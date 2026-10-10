import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  src: string; // the .m3u8 playlist URL
  autoPlay?: boolean;
}

export default function VideoPlayer({ src, autoPlay = true }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setError(null);
    let hls: Hls | null = null;
    let networkRetries = 0;

    if (Hls.isSupported()) {
      // Chrome, Firefox, Edge: no native HLS, so hls.js feeds segments
      // into the <video> element through the Media Source Extensions API.
      hls = new Hls({
        // Runs for EVERY request hls.js makes (the playlist and each .ts
        // segment), so your authenticateToken / requireVideoAccess
        // middleware sees the JWT every time. A plain <video src> could not do this.
        xhrSetup: (xhr) => {
          const token = localStorage.getItem('token');
          if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        },
      });
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) video.play().catch(() => {
          /* browsers may block autoplay with sound; user can press play */
        });
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal) return; // hls.js recovers from minor errors itself

        // The server answered, and the answer was "no" — retrying won't help.
        const status = data.response?.code;
        if (status === 401 || status === 403) {
          setError('You do not have access to this video.');
          hls?.destroy();
          return;
        }
        if (status === 404) {
          setError('Video file not found on the server.');
          hls?.destroy();
          return;
        }

        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            // No usable response (server down, CORS failure...): retry a few times, then give up
            if (networkRetries < 3) {
              networkRetries++;
              hls?.startLoad();
            } else {
              setError('Could not reach the server.');
              hls?.destroy();
            }
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            hls?.recoverMediaError();
            break;
          default:
            setError('This video could not be played.');
            hls?.destroy();
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari plays HLS natively
      video.src = src;
    } else {
      setError('Your browser does not support HLS playback.');
    }

    // Cleanup when the video changes or the component unmounts —
    // without this, old hls.js instances keep downloading segments.
    return () => {
      hls?.destroy();
    };
  }, [src, autoPlay]);

  return (
    <div className="player">
      <video ref={videoRef} controls playsInline />
      {error && <div className="form-error">{error}</div>}
    </div>
  );
}