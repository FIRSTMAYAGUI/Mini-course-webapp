import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { listVideosForCourse, getStreamUrl, type Video } from '../api/video';
import '../styles/watch.css';
import VideoCard from '../components/VideoCard';
import VideoPlayer from '../components/VideoPlayer';

export default function WatchPage() {
  const { courseId } = useParams<{ courseId: string }>();

  const [videos, setVideos] = useState<Video[]>([]);
  const [selected, setSelected] = useState<Video | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;
    listVideosForCourse(courseId)
      .then((data) => {
        setVideos(data);
        setSelected(data[0] ?? null); // start on the first video
      })
      .catch(() => setError('Could not load videos.'))
      .finally(() => setLoading(false));
  }, [courseId]);

  return (
    <div className="watch">
      <Link to={`/courses/${courseId}`} className="watch__back">← Back to course</Link>

      {loading && <p>Loading…</p>}
      {error && <div className="form-error">{error}</div>}
      {!loading && !error && videos.length === 0 && <p>No videos in this course yet.</p>}

      {selected && (
        <>
          <VideoPlayer src={getStreamUrl(selected.id)} />
          <h1 className="watch__title">{selected.title}</h1>
        </>
      )}

      {videos.length > 0 && (
        <>
          <h2 className="watch__heading">All videos</h2>
          <div className="video-grid">
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                active={video.id === selected?.id}
                onSelect={setSelected}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}