
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
  const { fps } = useVideoConfig(); // Use useVideoConfig for fps

  // Animate title sliding in from the top
  const titleY = interpolate(frame, [0, fps * 0.7], [-100, 0], { // Adjusted timing
    extrapolateRight: 'clamp',
  });
  const titleOpacity = interpolate(frame, [0, fps * 0.7], [0, 1], {extrapolateRight: 'clamp'});

  // Animate author block with a spring, starting slightly later
  const authorScale = spring({
    fps,
    frame: frame - fps * 0.5, // Stagger start (0.5 seconds)
    config: { damping: 200, stiffness: 150 },
  });
  const authorOpacity = authorScale; // Tie opacity to scale for a fade-in effect

  // Animate branch names one by one
  const branchBaseOpacity = spring({ fps, frame: frame - fps * 0.8 }); // Stagger start (0.8 seconds)
  const branchHeadOpacity = spring({ fps, frame: frame - fps * 1.0 }); // Stagger start (1 second)
  const arrowOpacity = spring({fps, frame: frame - fps * 0.9});


  const titleSpring = spring({
    frame,
    fps,
    config: { stiffness: 100, damping: 15, mass: 1.2 },
    delay: fps * 0.2,
  });


  const detailsSpring = spring({
    frame,
    fps,
    config: { stiffness: 90, damping: 18 },
    delay: fps * 0.8,
  });


  return (
    <SceneContainer bgImage={`https://placehold.co/${WIDTH}x${HEIGHT}.png`} data-ai-hint="abstract tech background">
      <div className="text-center flex flex-col items-center justify-center h-full w-full">
        <h1
          className="font-headline text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 text-shadow-md leading-tight max-w-4xl"
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
              opacity: authorOpacity
            }}
          >
            <Img
              src={prDetails.user.avatar_url}
              alt={`${prDetails.user.login}'s avatar`}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-primary/80 shadow-lg mr-4"
              width={80}
              height={80}
              data-ai-hint="profile avatar tech"
            />
            <p className="text-2xl md:text-3xl text-secondary-foreground font-medium text-shadow-sm">
              @{prDetails.user.login}
            </p>
          </div>
        )}
        
        <div 
            className="text-xl md:text-2xl text-muted-foreground flex items-center flex-wrap justify-center"
        >
            <span style={{opacity: branchHeadOpacity}} className="font-semibold text-accent/90 p-1 bg-accent/10 rounded mx-1">
                {prDetails.head.ref}
            </span>
            <span style={{opacity: arrowOpacity}} className="mx-1 text-xl">{'←'}</span>
            <span style={{opacity: branchBaseOpacity}} className="font-semibold text-primary/90 p-1 bg-primary/10 rounded mx-1">
                {prDetails.base.ref}
            </span>
        </div>
         <p className="text-lg md:text-xl text-muted-foreground mt-3" style={{opacity: branchBaseOpacity}}>PR #{prDetails.number}</p>

      </div>
    </SceneContainer>
  );
};
