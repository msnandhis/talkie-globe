
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Globe, Video } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export const VideoUpload = () => {
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);

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
      // Simulated upload delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
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
      // Simulated processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
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

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg border-gray-200 hover:border-primary/50 transition-colors">
        <div className="mb-4">
          <Video className="w-12 h-12 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Upload Your Video</h3>
        <p className="text-sm text-gray-500 mb-4 text-center">
          Drag and drop your video file here, or click to browse
        </p>
        <Input
          type="file"
          accept="video/*"
          onChange={handleFileUpload}
          className="hidden"
          id="video-upload"
        />
        <label htmlFor="video-upload">
          <Button disabled={uploading}>
            <Upload className="mr-2 h-4 w-4" />
            Choose Video
          </Button>
        </label>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Or Use Video URL</h3>
        <form onSubmit={handleUrlSubmit} className="flex gap-2">
          <Input
            type="url"
            placeholder="Paste video URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={uploading}>
            <Globe className="mr-2 h-4 w-4" />
            Process URL
          </Button>
        </form>
      </div>
    </div>
  );
};
