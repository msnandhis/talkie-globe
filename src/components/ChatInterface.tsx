
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare } from "lucide-react";

export const ChatInterface = () => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Chat functionality to be implemented
    setMessage("");
  };

  const suggestedQuestions = [
    "What are the main topics covered?",
    "Can you explain the key points?",
    "What is the conclusion?",
  ];

  return (
    <div className="space-y-4 animate-slide-in">
      <div className="glass rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">Suggested Questions</h3>
        <div className="space-y-2">
          {suggestedQuestions.map((question, index) => (
            <Button
              key={index}
              variant="secondary"
              className="w-full justify-start text-left text-sm"
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
          className="flex-1"
        />
        <Button type="submit">
          <MessageSquare className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};
