
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Globe, Video, ArrowRight } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface VideoUploadProps {
  onVideoSelected: (videoData: { type: 'file' | 'url', data: string }) => void;
  selectedLanguage: string;
}

export const VideoUpload = ({ onVideoSelected, selectedLanguage }: VideoUploadProps) => {
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);
  const [translatedVideoUrl, setTranslatedVideoUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes("video/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a video file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const videoUrl = URL.createObjectURL(file);
      onVideoSelected({ type: 'file', data: videoUrl });
      setHasVideo(true);
      toast({
        title: "Success!",
        description: "Video uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload video",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      toast({
        title: "Error",
        description: "Please enter a video URL",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      onVideoSelected({ type: 'url', data: url });
      setHasVideo(true);
      toast({
        title: "Success!",
        description: "Video URL processed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process video URL",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedLanguage) {
      toast({
        title: "Error",
        description: "Please select a target language",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Simulated processing delay
      await new Promise((resolve) => setTimeout(resolve, 3000));
      // For demo purposes, we're just using the same video URL
      // In a real app, this would be the translated video URL
      setTranslatedVideoUrl(url || "sample-translated-video.mp4");
      toast({
        title: "Success!",
        description: "Video has been translated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process video",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (translatedVideoUrl) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 border rounded-lg bg-muted">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">Translation Complete</span>
          </div>
          <Button size="sm" onClick={() => setTranslatedVideoUrl("")}>
            New Translation
          </Button>
        </div>
        <video 
          controls 
          className="w-full rounded-lg"
          src={translatedVideoUrl}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!hasVideo ? (
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="upload" className="flex-1">Upload Video</TabsTrigger>
            <TabsTrigger value="url" className="flex-1">Video URL</TabsTrigger>
          </TabsList>
          <TabsContent value="upload" className="mt-4">
            <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg border-gray-200 hover:border-primary/50 transition-colors">
              <Video className="w-8 h-8 text-primary mb-2" />
              <Input
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                className="hidden"
                id="video-upload"
              />
              <label htmlFor="video-upload">
                <Button size="sm" disabled={uploading}>
                  <Upload className="mr-2 h-4 w-4" />
                  Choose Video
                </Button>
              </label>
            </div>
          </TabsContent>
          <TabsContent value="url" className="mt-4">
            <form onSubmit={handleUrlSubmit} className="flex gap-2">
              <Input
                type="url"
                placeholder="Paste video URL..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="sm" disabled={uploading}>
                Process URL
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="flex items-center justify-between p-3 border rounded-lg bg-muted">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Video Ready</p>
              <p className="text-xs text-gray-500">Select language to continue</p>
            </div>
          </div>
          <Button 
            size="sm"
            onClick={handleSubmit} 
            disabled={!selectedLanguage || isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Translate Video'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
