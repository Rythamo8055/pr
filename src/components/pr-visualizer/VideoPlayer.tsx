
"use client"; 

import React, { useRef, useState, useEffect } from 'react';
import type { PlayerRef } from '@remotion/player'; 
import type { PRData } from '@/lib/github-types';
import { MyComposition } from '@/remotion';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { calculateVideoDuration } from '@/remotion/config';
import { Button } from '@/components/ui/button';
import { Download, Terminal, Loader2, ImageIcon } from 'lucide-react'; 
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from "@/hooks/use-toast";
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
  const [isRecording, setIsRecording] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const { toast } = useToast();
  const [isPlayerComponentReady, setIsPlayerComponentReady] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const successSoundBufferRef = useRef<AudioBuffer | null>(null);

  useEffect(() => {
    // Initialize AudioContext and load sound effect on client-side
    audioContextRef.current = new window.AudioContext();
    const loadSuccessSound = async () => {
      try {
        // IMPORTANT: Place your sound file at public/sounds/notification.mp3
        const response = await fetch('/sounds/notification.mp3');
        if (!response.ok) {
          console.warn('Failed to load notification sound, response not OK:', response.statusText);
          return;
        }
        const arrayBuffer = await response.arrayBuffer();
        if (audioContextRef.current) {
          successSoundBufferRef.current = await audioContextRef.current.decodeAudioData(arrayBuffer);
        }
      } catch (error) {
        console.warn("Failed to load or decode success sound:", error);
      }
    };
    loadSuccessSound();

    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  const playSuccessSound = () => {
    if (audioContextRef.current && successSoundBufferRef.current && audioContextRef.current.state === 'running') {
      const source = audioContextRef.current.createBufferSource();
      source.buffer = successSoundBufferRef.current;
      source.connect(audioContextRef.current.destination);
      source.start();
    } else if (audioContextRef.current && audioContextRef.current.state !== 'running') {
        // Attempt to resume audio context if suspended (e.g., by browser policy)
        audioContextRef.current.resume().then(() => {
            if (successSoundBufferRef.current) {
                const source = audioContextRef.current!.createBufferSource();
                source.buffer = successSoundBufferRef.current;
                source.connect(audioContextRef.current!.destination);
                source.start();
            }
        }).catch(e => console.warn("Could not resume audio context for sound:", e));
    }
  };


  if (!prData) {
    return null;
  }

  const { durationInFrames, width, height, fps } = calculateVideoDuration(prData);

  const handleDownload = async () => {
    if (!playerRef.current) {
      console.error("Player ref is null when handleDownload is called. Cannot record.");
      toast({
        variant: "destructive",
        title: "Player Not Ready",
        description: "The video player reference is not available. Please wait and try again.",
      });
      setDownloadError("Player reference is not available.");
      return;
    }

    if (typeof playerRef.current.record !== 'function') {
      const currentRefValue = playerRef.current;
      const refKeys = Object.keys(currentRefValue || {});
      console.error(
        `playerRef.current.record is not a function. PlayerRef current value is:`, 
        currentRefValue,
        `Keys on playerRef.current: [${refKeys.join(', ')}]`
      );
      toast({
        variant: "destructive",
        title: "Recording Error",
        description: `The player's 'record' function is unavailable (player methods: ${refKeys.join(', ') || 'none'}). The player might still be initializing or there's an issue. Please try again.`,
      });
      setDownloadError("Player's record method is unavailable or player is not fully ready.");
      return;
    }
    
    setIsRecording(true);
    setDownloadError(null);
    console.warn("PR Visualizer: Starting client-side video recording. Performance will depend on your computer's resources. This might be slower than local development previews.");
    
    try {
      const blob = await playerRef.current.record();
      
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pr-visualizer-${prData.prDetails.number || 'video'}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        playSuccessSound();
        toast({
          title: "Download Started",
          description: "Your video recording has completed and download has started.",
        });
      } else {
        setDownloadError("Recording failed: No data was received from the player.");
         toast({
          variant: "destructive",
          title: "Recording Error",
          description: "Recording failed: No data was received from the player.",
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

  const handleGenerateSlides = () => {
    toast({
      title: "Generate Slides (Conceptual)",
      description: "This feature is planned for future implementation. It will allow you to download key frames from the video as slides.",
    });
    console.log("Generate Slides button clicked. PR Data:", prData);
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
            onReady={() => {
              console.log("Remotion Player onReady fired. Current playerRef.current:", playerRef.current);
              const currentRefValue = playerRef.current;
              if (currentRefValue) {
                const refKeys = Object.keys(currentRefValue);
                console.log(`Keys on playerRef.current in onReady: [${refKeys.join(', ')}]`);
                if (typeof currentRefValue.record === 'function') {
                  console.log("playerRef.current.record IS a function in onReady.");
                } else {
                  console.warn("playerRef.current.record is NOT a function in onReady.");
                }
              }
              setIsPlayerComponentReady(true);
            }}
            onError={(e) => {
              console.error("Remotion Player Error:", e);
              setDownloadError(`Player error: ${e.message}`);
              toast({
                variant: "destructive",
                title: "Player Error",
                description: "The video player encountered an error.",
              });
            }}
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
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              onClick={handleDownload}
              disabled={isRecording || !prData || !isPlayerComponentReady}
              className="w-full sm:w-auto"
              size="lg"
            >
              {isRecording ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Recording...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  Download Video
                </>
              )}
            </Button>
            <Button
              onClick={handleGenerateSlides}
              disabled={!prData || !isPlayerComponentReady} // Similar disabled logic
              className="w-full sm:w-auto"
              variant="outline"
              size="lg"
            >
              <ImageIcon className="mr-2 h-5 w-5" />
              Generate Slides
            </Button>
        </div>
         <p className="text-xs text-muted-foreground mt-3 text-center">
          Note: Video recording happens client-side and might take a few moments. Video is in .webm format.
          <br />
          For best results, keep this browser tab active during recording.
        </p>
      </CardFooter>
    </Card>
  );
};

