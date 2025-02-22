
import { Download, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const VideoSummary = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleDownload = () => {
    console.log("Downloading summary...");
  };

  return (
    <div className="animate-slide-in">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800">Video Summary</h3>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDownload}
            className="bg-white/50 hover:bg-white"
          >
            <Download className="h-4 w-4 mr-1" /> Save
          </Button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4 space-y-4">
          <div className="space-y-4">
            <p className="text-gray-600 text-sm leading-relaxed">
              Get AI-generated summaries of your videos here. Our advanced AI will analyze the content
              and provide key insights, topics, and important moments.
            </p>
            <div className="text-xs text-gray-500 bg-gray-50 rounded p-3 border border-gray-100">
              <p>💡 Upload a video to see its AI-generated summary</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
