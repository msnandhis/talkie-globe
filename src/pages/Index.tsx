
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

  const handleVideoSelected = ({ type, data }: { type: 'file' | 'url', data: string }) => {
    setVideoSrc(data);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-8">
        {/* Enhanced Hero Section with Brand Identity */}
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
      </div>
      <Footer />
    </div>
  );
};

export default Index;
