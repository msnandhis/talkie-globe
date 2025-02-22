
import { Download, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface VideoSummaryProps {
  videoId?: string;
}

export const VideoSummary = ({ videoId }: VideoSummaryProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (videoId) {
      setLoading(true);
      const fetchSummary = async () => {
        const { data, error } = await supabase
          .from('videos')
          .select('summary')
          .eq('id', videoId)
          .single();

        if (error) {
          console.error('Error fetching summary:', error);
          return;
        }

        setSummary(data.summary);
        setLoading(false);
      };

      fetchSummary();
    }
  }, [videoId]);

  const handleDownload = () => {
    if (summary) {
      const blob = new Blob([summary], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'video-summary.txt';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
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
          {summary && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDownload}
              className="bg-white/50 hover:bg-white"
            >
              <Download className="h-4 w-4 mr-1" /> Save
            </Button>
          )}
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4 space-y-4">
          {loading ? (
            <div className="h-20 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : summary ? (
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
              {summary}
            </p>
          ) : (
            <div className="text-xs text-gray-500 bg-gray-50 rounded p-3 border border-gray-100">
              <p>💡 Processing video to generate AI summary...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
