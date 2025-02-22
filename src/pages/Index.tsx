
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
        {/* Enhanced Hero Section */}
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),white)] opacity-20" />
          <div className="absolute inset-0 -z-10 mx-auto max-w-4xl blur-[100px]">
            <div className="relative aspect-[1024/256] bg-gradient-to-tr from-primary/40 via-secondary/40 to-accent/40" />
          </div>
          <div className="relative py-8 animate-fade-in">
            <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent inline-block">
              VidGlobe
            </h1>
            <div className="max-w-2xl mx-auto space-y-4">
              <p className="text-lg text-gray-700 leading-relaxed">
                Transform your videos into any language with AI-powered translation
              </p>
              <p className="text-sm text-gray-600">
                Get instant summaries and insights through our interactive chat
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Video Upload and Player */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass rounded-xl p-6 space-y-6 shadow-xl bg-white/90">
              {videoSrc ? (
                <>
                  <VideoPlayer src={videoSrc} />
                  <div className="border-t pt-6">
                    <LanguageSelect onSelect={setSelectedLanguage} />
                  </div>
                </>
              ) : (
                <div className="text-center p-8 rounded-lg border-2 border-dashed border-gray-200 bg-gradient-to-b from-white to-gray-50">
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
            <div className="glass rounded-xl p-6 shadow-lg bg-white/90">
              <VideoSummary />
            </div>
            <div className="glass rounded-xl p-6 shadow-lg bg-white/90">
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
