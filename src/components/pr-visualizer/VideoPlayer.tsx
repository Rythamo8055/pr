
"use client"; 

import React, { useRef, useState, useEffect } from 'react';
import type { PlayerRef } from '@remotion/player'; 
import type { PRData } from '@/lib/github-types';
import { MyComposition } from '@/remotion';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { calculateVideoDuration } from '@/remotion/config';
import { Loader2 } from 'lucide-react'; 
import { Progress } from "@/components/ui/progress";
import dynamic from 'next/dynamic';

const Player = dynamic(() => import('@remotion/player').then((mod) => mod.Player), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-muted text-muted-foreground rounded-md aspect-video">
      <Loader2 className="h-12 w-12 animate-spin mb-4 text-primary" />
      <p>Loading Video Player...</p>
    </div>
  ),
});

interface VideoPlayerProps {
  prData: PRData | null;
  compositionId: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ prData, compositionId }) => {
  const playerRef = useRef<PlayerRef>(null);
  const [isPlayerComponentReady, setIsPlayerComponentReady] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  
  useEffect(() => {
    setPlayerError(null);
    setPlaybackProgress(0);
    setIsPlayerComponentReady(false);
  }, [prData]);

  if (!prData) {
    return null; 
  }

  const { durationInFrames, width, height, fps } = calculateVideoDuration(prData);

  const handleFrameUpdate = (e: { currentFrame: number }) => {
    if (durationInFrames > 0) {
      const progress = (e.currentFrame / durationInFrames) * 100;
      setPlaybackProgress(progress);
    } else {
      setPlaybackProgress(0);
    }
  };

  return (
    <Card className="w-full max-w-4xl mt-8 glassmorphism">
      <CardContent className="p-4 md:p-6">
        <div className="aspect-video w-full bg-muted rounded-md overflow-hidden border border-border shadow-inner">
          <Player
            ref={playerRef}
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
            showVolumeControls={true}
            clickToPlay
            onReady={() => {
              setIsPlayerComponentReady(true);
              console.log("Remotion Player is ready for playback.");
            }}
            onError={(e) => {
              console.error("Remotion Player Error:", e);
              setPlayerError(`Player error: ${e.message || 'Unknown player error'}`);
            }}
            onFrameUpdate={handleFrameUpdate}
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-center justify-center p-4 pt-2 pb-4">
        {playerError && (
           <p className="text-destructive text-sm text-center">Player Error: {playerError}</p>
        )}
        {!playerError && !isPlayerComponentReady && prData && (
          <p className="text-muted-foreground text-sm">Player is loading...</p> 
        )}
        {!playerError && isPlayerComponentReady && prData && (
          <div className="w-full max-w-xl mt-1">
            <Progress value={playbackProgress} className="w-full h-2" />
            <p className="text-xs text-muted-foreground text-center mt-1">
              {`${Math.round(playbackProgress)}% played`}
            </p>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
