
interface VideoPlayerProps {
  src?: string;
}

export const VideoPlayer = ({ src }: VideoPlayerProps) => {
  if (!src) return null; // Don't render anything if no video is selected

  return (
    <div className="w-full aspect-video bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg overflow-hidden animate-fade-in">
      <video
        controls
        className="w-full h-full object-cover"
        src={src}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};
