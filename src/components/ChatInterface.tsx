
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Mic, MicOff, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ChatInterfaceProps {
  videoId?: string;
}

export const ChatInterface = ({ videoId }: ChatInterfaceProps) => {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [responses, setResponses] = useState<Array<{ question: string; answer: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !videoId) return;

    const question = message;
    setMessage("");
    setIsLoading(true);

    try {
      // Get video context
      const { data: video } = await supabase
        .from('videos')
        .select('transcript, translated_transcript, summary')
        .eq('id', videoId)
        .single();

      // Use edge function to get AI response
      const { data: aiResponse, error } = await supabase.functions.invoke('chat-with-video', {
        body: {
          question,
          videoContext: video,
        },
      });

      if (error) throw error;

      setResponses(prev => [{
        question,
        answer: aiResponse.answer,
      }, ...prev]);

    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: "Failed to get response",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVoiceRecording = async () => {
    try {
      if (!isRecording) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsRecording(true);
        toast({
          title: "Recording started",
          description: "Speak your message...",
        });
      } else {
        setIsRecording(false);
        toast({
          title: "Recording stopped",
          description: "Processing your message...",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not access microphone",
        variant: "destructive",
      });
    }
  };

  const suggestedQuestions = [
    "What are the main topics covered in this video?",
    "Can you summarize the key points?",
    "What is the main conclusion?",
  ];

  return (
    <div className="animate-slide-in">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800">Chat Assistant</h3>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700"
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
          <div className="bg-gray-50/50 rounded-lg p-4 border border-gray-100">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Suggested Questions</h4>
            <div className="space-y-2">
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start text-left text-sm hover:bg-white/80 transition-colors"
                  onClick={() => {
                    setMessage(question);
                    handleSubmit(new Event('submit') as any);
                  }}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>

          {responses.length > 0 && (
            <div className="space-y-4 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
              {responses.map((response, index) => (
                <div key={index} className="bg-white rounded-lg p-3 space-y-2 border border-gray-100">
                  <p className="text-sm font-medium text-primary">{response.question}</p>
                  <p className="text-sm text-gray-600">{response.answer}</p>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="text"
              placeholder="Ask a question about the video..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 bg-white border-gray-200 focus:border-primary/50 focus:ring-primary/50"
            />
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className={`${
                isRecording 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                  : 'bg-white hover:bg-gray-50'
              } transition-colors`}
              onClick={toggleVoiceRecording}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button 
              type="submit" 
              size="icon"
              disabled={isLoading || !videoId}
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};
