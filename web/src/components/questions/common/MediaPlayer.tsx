'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';

interface MediaPlayerProps {
  url: string;
  type: 'audio' | 'video';
  className?: string;
  autoplay?: boolean;
  controls?: boolean;
  loop?: boolean;
}

export function MediaPlayer({ 
  url, 
  type, 
  className = '', 
  autoplay = false,
  controls = true,
  loop = false
}: MediaPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRef = useRef<HTMLAudioElement | HTMLVideoElement>(null);

  const handlePlay = () => {
    if (mediaRef.current) {
      mediaRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          setError('Failed to play media');
          console.error('Media playback error:', err);
        });
    }
  };

  const handlePause = () => {
    if (mediaRef.current) {
      mediaRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  const handleError = () => {
    setError('Failed to load media');
    setIsPlaying(false);
  };

  if (error) {
    return (
      <Card className={`p-4 border-red-200 bg-red-50 ${className}`}>
        <Text className="text-red-600 text-center">{error}</Text>
      </Card>
    );
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center gap-4">
        {type === 'audio' ? (
          <audio
            ref={mediaRef as React.RefObject<HTMLAudioElement>}
            src={url}
            autoPlay={autoplay}
            controls={controls}
            loop={loop}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={handleEnded}
            onError={handleError}
            className="flex-1"
          />
        ) : (
          <video
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            src={url}
            autoPlay={autoplay}
            controls={controls}
            loop={loop}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={handleEnded}
            onError={handleError}
            className="w-full max-w-md mx-auto rounded"
          />
        )}
        
        {!controls && (
          <div className="flex gap-2">
            {!isPlaying ? (
              <Button onClick={handlePlay} size="sm">
                ▶️ Play
              </Button>
            ) : (
              <Button onClick={handlePause} size="sm">
                ⏸️ Pause
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}