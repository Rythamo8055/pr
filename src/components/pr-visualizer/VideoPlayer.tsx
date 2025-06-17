
"use client"; 

import React, { useRef, useState, useEffect } from 'react';
import type { PlayerRef } from '@remotion/player'; 
import type { PRData } from '@/lib/github-types';
import { MyComposition } from '@/remotion';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { calculateVideoDuration } from '@/remotion/config';
import { Loader2 } from 'lucide-react'; 
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
  
  useEffect(() => {
    // Reset player error if prData changes
    setPlayerError(null);
    setIsPlayerComponentReady(false); // Reset ready state when new data comes
  }, [prData]);

  if (!prData) {
    return null; 
  }

  const { durationInFrames, width, height, fps } = calculateVideoDuration(prData);

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
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-center justify-center p-4 md:p-6 pt-0 md:pt-0 min-h-[60px]">
        {playerError && (
           <p className="text-destructive text-sm">Error: {playerError}</p>
        )}
        {!playerError && isPlayerComponentReady && (
          <p className="text-muted-foreground text-sm">Video ready for playback.</p>
        )}
         {!playerError && !isPlayerComponentReady && !prData && ( // Only show loading if no prData yet
          <p className="text-muted-foreground text-sm">Preparing video...</p>
        )}
         {!playerError && !isPlayerComponentReady && prData && ( // Show loading player if prData is there
          <p className="text-muted-foreground text-sm">Loading player...</p>
        )}
      </CardFooter>
    </Card>
  );
};
