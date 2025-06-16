import React from 'react';
import { Sequence, useCurrentFrame, interpolate, Easing, AbsoluteFill, OffthreadVideo, staticFile, Img } from 'remotion';
import type { GitHubFile } from '@/lib/github-types';
import { SceneContainer } from './SceneContainer';
import { CodeFileDiff } from './CodeFileDiff';
import { FPS, DURATION_PER_FILE_DIFF } from '../config';

interface CodeDiffSceneProps {
  files: GitHubFile[];
  diffContent: string; // Combined diff string
  codeInsights?: string;
}

export const CodeDiffScene: React.FC<CodeDiffSceneProps> = ({ files, diffContent, codeInsights }) => {
  const frame = useCurrentFrame();
  const durationPerFileInFrames = DURATION_PER_FILE_DIFF * FPS;

  const insightsOpacity = interpolate(frame, [0, FPS / 2, (files.length * durationPerFileInFrames) - FPS / 2, (files.length * durationPerFileInFrames)], [0, 1, 1, 0], {
    easing: Easing.inOut(Easing.ease),
  });
  const insightsY = interpolate(frame, [0, FPS / 2], [20, 0], { extrapolateRight: 'clamp' });
  
  return (
    <SceneContainer title="Code Changes">
      <AbsoluteFill className="flex flex-col items-center justify-start p-4">
        {/* Display AI Code Insights */}
        {codeInsights && (
           <div 
            className="w-full max-w-3xl mb-4 p-4 rounded-lg bg-primary/10 border border-primary/30 text-primary-foreground glassmorphism"
            style={{ opacity: insightsOpacity, transform: `translateY(${insightsY}px)` }}
          >
            <h3 className="font-headline text-xl text-primary font-semibold mb-2">AI Code Insights:</h3>
            <p className="text-sm font-body whitespace-pre-wrap">{codeInsights}</p>
          </div>
        )}

        {/* Files Diff */}
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
        </div>
      </AbsoluteFill>
    </SceneContainer>
  );
};
