
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export const VideoSummary = () => {
  const handleDownload = () => {
    // Download functionality to be implemented
    console.log("Downloading summary...");
  };

  return (
    <div className="p-4 glass rounded-lg animate-slide-in">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Video Summary</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleDownload}
          className="bg-white/50 hover:bg-white"
        >
          <Download className="h-4 w-4 mr-1" /> Save
        </Button>
      </div>
      <div className="space-y-4">
        <p className="text-gray-600 text-sm">
          {/* Show placeholder or actual summary */}
          Get AI-generated summaries of your videos here. Our advanced AI will analyze the content
          and provide key insights, topics, and important moments.
        </p>
        <div className="text-xs text-gray-500 bg-gray-50 rounded p-3">
          <p>💡 Upload a video to see its AI-generated summary</p>
        </div>
      </div>
    </div>
  );
};
