
import { useState } from "react";
import { VideoUpload } from "@/components/VideoUpload";
import { LanguageSelect } from "@/components/LanguageSelect";
import { VideoPlayer } from "@/components/VideoPlayer";
import { VideoSummary } from "@/components/VideoSummary";
import { ChatInterface } from "@/components/ChatInterface";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Globe } from "lucide-react";

const Index = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [videoSrc, setVideoSrc] = useState<string>("");
  const [currentVideoId, setCurrentVideoId] = useState<string>("");
  const [translatedAudioSrc, setTranslatedAudioSrc] = useState<string>("");

  const handleVideoSelected = ({ type, data, videoId }: { type: 'file' | 'url', data: string, videoId?: string }) => {
    setVideoSrc(data);
    if (videoId) {
      setCurrentVideoId(videoId);
    }
  };

  const handleTranslationComplete = (translatedUrl: string) => {
    setTranslatedAudioSrc(translatedUrl);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),white)] opacity-20" />
          <div className="absolute inset-0 -z-10 mx-auto max-w-4xl blur-[100px]">
            <div className="relative aspect-[1024/256] bg-gradient-to-tr from-primary/40 via-secondary/40 to-accent/40" />
          </div>
          <div className="relative py-8 animate-fade-in">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Globe className="w-12 h-12 text-primary animate-pulse" />
              <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent inline-block">
                VidGlobe
              </h1>
            </div>
            <div className="max-w-2xl mx-auto space-y-4">
              <p className="text-lg text-gray-700 leading-relaxed font-medium">
                Break Language Barriers with AI-Powered Video Translation
              </p>
              <p className="text-sm text-gray-600">
                Transform your content instantly and reach a global audience
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Video Upload and Player */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass rounded-xl p-6 space-y-6 shadow-xl bg-white/90">
              {videoSrc && (
                <>
                  <VideoPlayer src={videoSrc} translatedAudioSrc={translatedAudioSrc} />
                  <div className="border-t pt-6">
                    <LanguageSelect onSelect={setSelectedLanguage} />
                  </div>
                </>
              )}
              <VideoUpload 
                onVideoSelected={handleVideoSelected}
                selectedLanguage={selectedLanguage}
                onTranslationComplete={handleTranslationComplete}
              />
            </div>
          </div>

          {/* Right Column - Summary and Chat */}
          <div className="lg:sticky lg:top-4 space-y-6 max-h-[calc(100vh-2rem)] overflow-y-auto pb-6">
            <div className="glass rounded-xl shadow-lg bg-white/90 backdrop-blur transition-all duration-200 hover:shadow-xl">
              <VideoSummary videoId={currentVideoId} />
            </div>
            <div className="glass rounded-xl shadow-lg bg-white/90 backdrop-blur transition-all duration-200 hover:shadow-xl">
              <ChatInterface videoId={currentVideoId} />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Index;
