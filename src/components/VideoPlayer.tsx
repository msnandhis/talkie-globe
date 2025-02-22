
import ReactPlayer from 'react-player';

interface VideoPlayerProps {
  src?: string;
}

export const VideoPlayer = ({ src }: VideoPlayerProps) => {
  if (!src) return null;

  const isYouTubeUrl = src.includes('youtube.com') || src.includes('youtu.be');

  return (
    <div className="w-full aspect-video bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg overflow-hidden animate-fade-in">
      {isYouTubeUrl ? (
        <ReactPlayer
          url={src}
          width="100%"
          height="100%"
          controls
          playing={false}
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
        >
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
};
