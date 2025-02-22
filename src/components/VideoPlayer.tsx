
interface VideoPlayerProps {
  src?: string;
}

export const VideoPlayer = ({ src }: VideoPlayerProps) => {
  return (
    <div className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden animate-fade-in">
      {src ? (
        <video
          controls
          className="w-full h-full object-cover"
          src={src}
        >
          Your browser does not support the video tag.
        </video>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          No video selected
        </div>
      )}
    </div>
  );
};
