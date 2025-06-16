
import React from 'react';
import { Img, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import type { GitHubPullRequest } from '@/lib/github-types';
import { SceneContainer } from './SceneContainer';
import { WIDTH, HEIGHT, FPS } from '../config'; // Added FPS

interface TitleSceneProps {
  prDetails: GitHubPullRequest;
}

export const TitleScene: React.FC<TitleSceneProps> = ({ prDetails }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animate title sliding in from the top
  const titleProgress = spring({ frame, fps, config: { stiffness: 100, damping: 15, mass: 1.2 }, delay: fps * 0.1 });
  const titleY = interpolate(titleProgress, [0, 1], [-60, 0]);
  const titleOpacity = titleProgress;

  // Animate author block with a spring, starting slightly later
  const authorSpring = spring({
    fps,
    frame: frame - fps * 0.3, // Stagger start
    config: { damping: 18, stiffness: 130, mass: 1 },
  });
  const authorScale = interpolate(authorSpring, [0, 1], [0.7, 1]);
  const authorOpacity = authorSpring;


  // Animate branch names one by one
  const branchDetailsSpring = spring({
    frame,
    fps,
    config: { stiffness: 70, damping: 20 },
    delay: fps * 0.6,
  });
  const branchOpacity = branchDetailsSpring;
  const branchY = interpolate(branchDetailsSpring, [0,1], [20,0]);


  return (
    <SceneContainer bgImage={`https://placehold.co/${WIDTH}x${HEIGHT}.png`} data-ai-hint="abstract tech lines">
      <div className="text-center flex flex-col items-center justify-center h-full w-full">
        <h1
          className="font-headline text-5xl md:text-6xl lg:text-7xl font-bold text-primary mb-6 text-shadow-md leading-tight max-w-4xl"
          style={{
            transform: `translateY(${titleY}px)`,
            opacity: titleOpacity,
          }}
        >
          {prDetails.title}
        </h1>

        {prDetails.user && (
          <div
            className="flex items-center mb-4"
            style={{
              transform: `scale(${authorScale})`,
              opacity: authorOpacity,
            }}
          >
            <Img
              src={prDetails.user.avatar_url}
              alt={`${prDetails.user.login}'s avatar`}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-primary/70 shadow-lg mr-4"
              width={80}
              height={80}
              data-ai-hint="profile avatar tech"
            />
            <p className="text-2xl md:text-3xl text-card-foreground font-medium text-shadow-sm">
              @{prDetails.user.login}
            </p>
          </div>
        )}

        <div
            className="text-xl md:text-2xl text-muted-foreground flex items-center flex-wrap justify-center"
            style={{opacity: branchOpacity, transform: `translateY(${branchY}px)`}}
        >
            <span className="font-semibold text-accent p-1 bg-accent/10 rounded mx-1">
                {prDetails.head.ref}
            </span>
            <span className="mx-1 text-xl text-card-foreground">{'=>'}</span>
            <span className="font-semibold text-primary p-1 bg-primary/10 rounded mx-1">
                {prDetails.base.ref}
            </span>
        </div>
        <p 
            className="text-lg md:text-xl text-muted-foreground mt-3" 
            style={{opacity: branchOpacity, transform: `translateY(${branchY}px)`}}
        >
            PR #{prDetails.number}
        </p>
      </div>
    </SceneContainer>
  );
};
