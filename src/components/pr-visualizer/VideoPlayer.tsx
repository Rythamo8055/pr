import React from 'react';
import { Player } from '@remotion/player';
import { PRData } from '@/lib/github-types';
import { MyComposition } from '@/remotion'; // Assuming MyComposition is the main export from remotion/index.ts
import { Card, CardContent } from '@/components/ui/card';
import { calculateVideoDuration } from '@/remotion/config';

interface VideoPlayerProps {
  prData: PRData | null;
  compositionId: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ prData, compositionId }) => {
  if (!prData) {
    return null;
  }

  const { durationInFrames, width, height, fps } = calculateVideoDuration(prData);

  return (
    <Card className="w-full max-w-4xl mt-8 glassmorphism">
      <CardContent className="p-4 md:p-6">
        <div className="aspect-video w-full bg-muted rounded-md overflow-hidden">
          <Player
            component={MyComposition}
            inputProps={{ prData }}
            durationInFrames={durationInFrames}
            compositionWidth={width}
            compositionHeight={height}
            fps={fps}
            style={{
              width: '100%',
              height: '100%',
            }}
            controls
            loop={false}
            showVolumeControls={false}
            clickToPlay
          />
        </div>
      </CardContent>
    </Card>
  );
};
