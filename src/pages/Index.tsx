
import { useState } from "react";
import { VideoUpload } from "@/components/VideoUpload";
import { LanguageSelect } from "@/components/LanguageSelect";
import { VideoPlayer } from "@/components/VideoPlayer";
import { VideoSummary } from "@/components/VideoSummary";
import { ChatInterface } from "@/components/ChatInterface";

const Index = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            VidGlobe
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Transform your videos into any language with AI-powered translation and
            get instant summaries and insights through our interactive chat.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Video Upload and Player */}
          <div className="lg:col-span-2 space-y-8">
            <VideoPlayer />
            <VideoUpload />
            <div className="flex justify-center">
              <LanguageSelect onSelect={setSelectedLanguage} />
            </div>
          </div>

          {/* Right Column - Summary and Chat */}
          <div className="space-y-8">
            <VideoSummary />
            <ChatInterface />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
