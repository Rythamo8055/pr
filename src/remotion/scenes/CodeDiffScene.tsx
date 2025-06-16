
import React from 'react';
import { Sequence, useCurrentFrame, interpolate, Easing, AbsoluteFill, spring, useVideoConfig } from 'remotion';
import type { GitHubFile } from '@/lib/github-types';
import { SceneContainer } from './SceneContainer';
import { CodeFileDiff } from './CodeFileDiff';
import { FPS, DURATION_PER_FILE_DIFF } from '../config';
import { Lightbulb } from 'lucide-react';

interface CodeDiffSceneProps {
  files: GitHubFile[];
  diffContent: string;
  codeInsights?: string;
}

export const CodeDiffScene: React.FC<CodeDiffSceneProps> = ({ files, diffContent, codeInsights }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const durationPerFileInFrames = DURATION_PER_FILE_DIFF * FPS;

  const insightSpring = spring({
    fps,
    frame: frame - fps * 0.2, // Slight delay
    config: { stiffness: 100, damping: 20, mass: 1 },
    durationInFrames: fps * 1,
  });

  const insightsOpacity = insightSpring;
  const insightsY = interpolate(insightSpring, [0, 1], [20, 0]);

  return (
    <SceneContainer title="Code Changes & AI Insights">
      <AbsoluteFill className="flex flex-col items-center justify-start p-2 md:p-4">
        {codeInsights && (
           <div
            className="w-full max-w-3xl mb-3 p-3 rounded-lg bg-primary/10 backdrop-blur-sm border border-primary/20 text-card-foreground glassmorphism shadow-md"
            style={{
              opacity: insightsOpacity,
              transform: `translateY(${insightsY}px)`
            }}
          >
            <div className="flex items-center mb-1">
              <Lightbulb className="w-5 h-5 text-primary mr-2" />
              <h3 className="font-headline text-lg text-primary font-semibold">AI Code Insights:</h3>
            </div>
            <p className="text-xs sm:text-sm font-body whitespace-pre-wrap leading-relaxed max-h-28 overflow-y-auto custom-scrollbar">
              {codeInsights}
            </p>
          </div>
        )}

        <div className="w-full flex-grow overflow-hidden relative">
          {files.map((file, index) => (
            <Sequence
              key={file.filename}
              from={index * durationPerFileInFrames}
              durationInFrames={durationPerFileInFrames}
            >
              <CodeFileDiff file={file} diffContent={diffContent} />
            </Sequence>
          ))}
           {files.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Lightbulb className="w-16 h-16 mb-4" />
              <p className="text-xl">No code changes to display.</p>
            </div>
          )}
        </div>
      </AbsoluteFill>
    </SceneContainer>
  );
};
