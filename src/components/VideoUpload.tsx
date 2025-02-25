
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Globe, Video, ArrowRight } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

interface VideoUploadProps {
  onVideoSelected: (videoData: { type: 'file' | 'url', data: string, videoId?: string }) => void;
  selectedLanguage: string;
  onTranslationComplete: (translatedUrl: string) => void;
}

export const VideoUpload = ({ onVideoSelected, selectedLanguage, onTranslationComplete }: VideoUploadProps) => {
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);
  const [translatedVideoUrl, setTranslatedVideoUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);

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
      const formData = new FormData();
      formData.append('video', file);
      formData.append('metadata', JSON.stringify({
        title: file.name,
        originalLanguage: 'auto',
        targetLanguage: selectedLanguage,
      }));

      const { data: uploadResponse, error } = await supabase.functions.invoke('upload-video', {
        body: formData,
      });

      if (error) throw error;

      onVideoSelected({ 
        type: 'file', 
        data: uploadResponse.video.stored_url,
        videoId: uploadResponse.video.id 
      });
      setHasVideo(true);
      setCurrentVideoId(uploadResponse.video.id);
      
      toast({
        title: "Success!",
        description: "Video uploaded successfully",
      });
    } catch (error) {
      console.error('Upload error:', error);
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

    try {
      new URL(url);
    } catch {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('metadata', JSON.stringify({
        title: 'Video from URL',
        originalUrl: url,
        originalLanguage: 'auto',
        targetLanguage: selectedLanguage,
      }));

      const { data: processResponse, error } = await supabase.functions.invoke('upload-video', {
        body: formData,
      });

      if (error) throw error;

      onVideoSelected({ 
        type: 'url', 
        data: processResponse.video.stored_url,
        videoId: processResponse.video.id 
      });
      setHasVideo(true);
      setCurrentVideoId(processResponse.video.id);
      
      toast({
        title: "Success!",
        description: "Video URL processed successfully",
      });
    } catch (error) {
      console.error('Process error:', error);
      toast({
        title: "Error",
        description: "Failed to process video URL",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUrl("");
    }
  };

  const handleSubmit = async () => {
    if (!selectedLanguage) {
      toast({
        title: "Error",
        description: "Please select a target language first",
        variant: "destructive",
      });
      return;
    }

    if (!currentVideoId) {
      toast({
        title: "Error",
        description: "No video selected",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data: processResponse, error } = await supabase.functions.invoke('process-video', {
        body: { 
          videoId: currentVideoId,
          targetLanguage: selectedLanguage 
        },
      });

      if (error) throw error;

      if (processResponse.video.translated_url) {
        setTranslatedVideoUrl(processResponse.video.translated_url);
        onTranslationComplete(processResponse.video.translated_url);
      }
      
      toast({
        title: "Success!",
        description: "Video has been processed successfully",
      });
    } catch (error) {
      console.error('Processing error:', error);
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
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between p-3 border rounded-lg bg-white/50 backdrop-blur">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">Translation Complete</span>
          </div>
          <Button size="sm" onClick={() => setTranslatedVideoUrl("")}>
            New Translation
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!hasVideo ? (
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="w-full grid grid-cols-2 bg-gray-100 border border-gray-200">
            <TabsTrigger value="upload" className="data-[state=active]:bg-white data-[state=active]:text-primary">
              Upload Video
            </TabsTrigger>
            <TabsTrigger value="url" className="data-[state=active]:bg-white data-[state=active]:text-primary">
              Video URL
            </TabsTrigger>
          </TabsList>
          <TabsContent value="upload" className="mt-4">
            <label htmlFor="video-upload" className="cursor-pointer block">
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg border-gray-200 hover:border-primary/50 transition-colors bg-gray-50">
                <Video className="w-8 h-8 text-primary mb-4" />
                <p className="text-sm text-gray-600 mb-4 text-center">
                  Click to choose a video file or drag and drop here
                </p>
                <Input
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="video-upload"
                />
                <Button size="sm" disabled={uploading} variant="secondary" className="bg-white hover:bg-gray-50">
                  <Upload className="mr-2 h-4 w-4" />
                  {uploading ? 'Uploading...' : 'Choose Video'}
                </Button>
              </div>
            </label>
          </TabsContent>
          <TabsContent value="url" className="mt-4">
            <form onSubmit={handleUrlSubmit} className="flex gap-2">
              <Input
                type="url"
                placeholder="Paste video URL..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 bg-white border-gray-200"
              />
              <Button type="submit" size="sm" disabled={uploading}>
                {uploading ? 'Processing...' : 'Process URL'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="flex items-center justify-between p-4 border rounded-lg bg-white/50 backdrop-blur">
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
            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
          >
            {isProcessing ? 'Processing...' : 'Translate Video'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
