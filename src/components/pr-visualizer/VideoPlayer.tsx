
import React, { useRef, useState } from 'react';
import { Player, type PlayerRef } from '@remotion/player';
import type { PRData } from '@/lib/github-types';
import { MyComposition } from '@/remotion';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { calculateVideoDuration } from '@/remotion/config';
import { Button } from '@/components/ui/button';
import { Download, Terminal } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from "@/hooks/use-toast";

interface VideoPlayerProps {
  prData: PRData | null;
  compositionId: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ prData, compositionId }) => {
  const playerRef = useRef<PlayerRef>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const { toast } = useToast();

  if (!prData) {
    return null;
  }

  const { durationInFrames, width, height, fps } = calculateVideoDuration(prData);

  const handleDownload = async () => {
    if (!playerRef.current || !prData) return;

    setIsRecording(true);
    setDownloadError(null);
    toast({
      title: "Recording Started",
      description: "The video is being recorded in the background. This may take a few moments...",
    });

    try {
      const blob = await playerRef.current.record({
        // You can specify codec options here if needed, default is often 'vp9' for WebM
        // quality: 0.8,
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
          disabled={isRecording || !prData}
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
