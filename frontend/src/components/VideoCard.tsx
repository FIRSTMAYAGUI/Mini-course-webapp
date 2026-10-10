import type { Video } from '../api/video';

interface VideoCardProps {
  video: Video;
  active: boolean;
  onSelect: (video: Video) => void;
}

export default function VideoCard({ video, active, onSelect }: VideoCardProps) {
  return (
    <button
      type="button"
      className={`video-card${active ? ' video-card--active' : ''}`}
      onClick={() => onSelect(video)}
    >
      {/* No real thumbnail yet — generating one with FFmpeg is a good follow-up */}
      <div className="video-card__thumb">
        <span className="video-card__play">▶</span>
      </div>
      <div className="video-card__body">
        <h3>{video.title}</h3>
        {video.position !== undefined && <p>Lesson {video.position}</p>}
      </div>
    </button>
  );
}