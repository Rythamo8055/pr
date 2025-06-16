
"use client"; // Ensure this is a client component

import React, { useRef, useState, useEffect } from 'react';
import type { PlayerRef } from '@remotion/player'; // Keep type import
import type { PRData } from '@/lib/github-types';
import { MyComposition } from '@/remotion';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { calculateVideoDuration } from '@/remotion/config';
import { Button } from '@/components/ui/button';
import { Download, Terminal, Loader2 } from 'lucide-react'; // Added Loader2 for player loading
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from "@/hooks/use-toast";
import dynamic from 'next/dynamic';

// Dynamically import the Player component
const Player = dynamic(() => import('@remotion/player').then((mod) => mod.Player), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-muted text-muted-foreground">
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
  const [isRecording, setIsRecording] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const { toast } = useToast();
  const [isPlayerComponentReady, setIsPlayerComponentReady] = useState(false); // New state to track player's onReady

  if (!prData) {
    return null;
  }

  const { durationInFrames, width, height, fps } = calculateVideoDuration(prData);

  const handleDownload = async () => {
    if (!playerRef.current || typeof playerRef.current.record !== 'function') {
        console.error("playerRef.current.record is not a function. PlayerRef:", playerRef.current);
        toast({
            variant: "destructive",
            title: "Player Not Ready",
            description: "The video player is not fully initialized. Please wait a moment and try again.",
        });
        setDownloadError("Player not ready or record function unavailable.");
        return;
    }
    
    setIsRecording(true);
    setDownloadError(null);
    toast({
      title: "Recording Started",
      description: "The video is being recorded in the background. This may take a few moments...",
    });

    try {
      const blob = await playerRef.current.record({
        // You can specify codec options here if needed, default is often 'vp9' for WebM
        // quality: 0.8, // Example: adjust quality
      });
      
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pr-visualizer-${prData.prDetails.number || 'video'}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast({
          title: "Recording Complete",
          description: "Your video download has started.",
        });
      } else {
        setDownloadError("Recording failed: No data was received from the player.");
         toast({
          variant: "destructive",
          title: "Recording Error",
          description: "Recording failed: No data was received.",
        });
      }
    } catch (err: any) {
      console.error("Error recording video:", err);
      setDownloadError(`Error recording video: ${err.message || 'Unknown error'}`);
      toast({
        variant: "destructive",
        title: "Recording Error",
        description: `An error occurred: ${err.message || 'Unknown error'}`,
      });
    } finally {
      setIsRecording(false);
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
            showVolumeControls={false}
            clickToPlay
            onReady={() => setIsPlayerComponentReady(true)} // Set ready state when player calls onReady
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-center p-4 md:p-6 pt-0 md:pt-0">
        {downloadError && (
          <Alert variant="destructive" className="mb-4 w-full">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Download Error</AlertTitle>
            <AlertDescription>{downloadError}</AlertDescription>
          </Alert>
        )}
        <Button
          onClick={handleDownload}
          disabled={isRecording || !prData || !isPlayerComponentReady} // Disable button until player is ready
          className="w-full md:w-auto"
          size="lg"
        >
          <Download className="mr-2 h-5 w-5" />
          {isRecording ? 'Recording Video...' : 'Download Video (.webm)'}
        </Button>
         <p className="text-xs text-muted-foreground mt-2 text-center">
          Note: Recording happens client-side and might take a few moments. The video will be in WebM format.
        </p>
      </CardFooter>
    </Card>
  );
};
