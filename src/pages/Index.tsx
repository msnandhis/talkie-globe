
import { useState } from "react";
import { VideoUpload } from "@/components/VideoUpload";
import { LanguageSelect } from "@/components/LanguageSelect";
import { VideoPlayer } from "@/components/VideoPlayer";
import { VideoSummary } from "@/components/VideoSummary";
import { ChatInterface } from "@/components/ChatInterface";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const Index = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [videoSrc, setVideoSrc] = useState<string>("");

  const handleVideoSelected = ({ type, data }: { type: 'file' | 'url', data: string }) => {
    setVideoSrc(data);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
            VidGlobe
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Transform your videos into any language with AI-powered translation and
            get instant summaries and insights through our interactive chat.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Video Upload and Player */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass rounded-xl p-6 space-y-6">
              {videoSrc ? (
                <>
                  <VideoPlayer src={videoSrc} />
                  <div className="border-t pt-6">
                    <LanguageSelect onSelect={setSelectedLanguage} />
                  </div>
                </>
              ) : (
                <div className="text-center p-8 rounded-lg border-2 border-dashed border-gray-200">
                  <p className="text-gray-500">Upload a video to get started</p>
                </div>
              )}
              <VideoUpload 
                onVideoSelected={handleVideoSelected}
                selectedLanguage={selectedLanguage}
              />
            </div>
          </div>

          {/* Right Column - Summary and Chat */}
          <div className="space-y-6">
            <div className="glass rounded-xl p-6">
              <VideoSummary />
            </div>
            <div className="glass rounded-xl p-6">
              <ChatInterface />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Index;
