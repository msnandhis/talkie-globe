
import ReactPlayer from 'react-player';
import { useState } from 'react';
import { Button } from './ui/button';
import { Globe, Volume2 } from 'lucide-react';

interface VideoPlayerProps {
  src?: string;
  translatedAudioSrc?: string;
}

export const VideoPlayer = ({ src, translatedAudioSrc }: VideoPlayerProps) => {
  const [isTranslatedAudio, setIsTranslatedAudio] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  if (!src) return null;

  const isYouTubeUrl = src.includes('youtube.com') || src.includes('youtu.be');

  const toggleAudio = () => {
    if (translatedAudioSrc) {
      if (!audioElement) {
        const audio = new Audio(translatedAudioSrc);
        setAudioElement(audio);
        audio.play();
      } else {
        if (audioElement.paused) {
          audioElement.play();
        } else {
          audioElement.pause();
          audioElement.currentTime = 0;
        }
      }
      setIsTranslatedAudio(!isTranslatedAudio);
    }
  };

  return (
    <div className="space-y-4">
      <div className="w-full aspect-video bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg overflow-hidden animate-fade-in relative">
        {isYouTubeUrl ? (
          <ReactPlayer
            url={src}
            width="100%"
            height="100%"
            controls
            playing={false}
            volume={isTranslatedAudio ? 0 : 1}
            config={{
              youtube: {
                playerVars: {
                  origin: window.location.origin,
                },
              },
            }}
          />
        ) : (
          <video
            controls
            className="w-full h-full object-cover"
            src={src}
            muted={isTranslatedAudio}
          >
            Your browser does not support the video tag.
          </video>
        )}
      </div>
      {translatedAudioSrc && (
        <Button
          onClick={toggleAudio}
          className="w-full flex items-center justify-center gap-2"
          variant={isTranslatedAudio ? "secondary" : "outline"}
        >
          {isTranslatedAudio ? <Globe className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          {isTranslatedAudio ? "Using Translated Audio" : "Use Translated Audio"}
        </Button>
      )}
    </div>
  );
};
