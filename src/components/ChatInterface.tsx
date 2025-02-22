
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Mic, MicOff } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export const ChatInterface = () => {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      // Chat functionality to be implemented
      setMessage("");
    }
  };

  const toggleVoiceRecording = async () => {
    try {
      if (!isRecording) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Voice recording logic would go here
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
    "What are the main topics covered?",
    "Can you explain the key points?",
    "What is the conclusion?",
  ];

  return (
    <div className="space-y-4 animate-slide-in">
      <div className="glass rounded-lg p-4 bg-white/80">
        <h3 className="text-lg font-semibold mb-3">Suggested Questions</h3>
        <div className="space-y-2">
          {suggestedQuestions.map((question, index) => (
            <Button
              key={index}
              variant="secondary"
              className="w-full justify-start text-left text-sm bg-white/50 hover:bg-white/80"
              onClick={() => setMessage(question)}
            >
              {question}
            </Button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="text"
          placeholder="Ask a question about the video..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 bg-white"
        />
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className={`${isRecording ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-white'}`}
          onClick={toggleVoiceRecording}
        >
          {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
        <Button type="submit" size="icon">
          <MessageSquare className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};
