
import React from 'react';
import { Img, useCurrentFrame, interpolate, Easing, spring, useVideoConfig } from 'remotion';
import type { GitHubPullRequest } from '@/lib/github-types';
import { SceneContainer } from './SceneContainer';
import { WIDTH, HEIGHT } from '../config';

interface TitleSceneProps {
  prDetails: GitHubPullRequest;
}

export const TitleScene: React.FC<TitleSceneProps> = ({ prDetails }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({
    frame,
    fps,
    config: { stiffness: 100, damping: 15, mass: 1.2 },
    delay: fps * 0.2,
  });

  const titleAnimation = {
    opacity: titleSpring,
    transform: `translateY(${interpolate(titleSpring, [0, 1], [50, 0])}px) scale(${interpolate(titleSpring, [0,1],[0.9,1])})`,
  };

  const avatarSpring = spring({
    frame,
    fps,
    config: { stiffness: 120, damping: 10, mass: 1 },
    delay: fps * 0.5,
  });

  const avatarAnimation = {
    opacity: avatarSpring,
    transform: `scale(${interpolate(avatarSpring, [0, 1], [0.5, 1])})`,
  };
  
  const detailsSpring = spring({
    frame,
    fps,
    config: { stiffness: 90, damping: 18 },
    delay: fps * 0.8,
  });

  const detailsAnimation = {
    opacity: detailsSpring,
    transform: `translateY(${interpolate(detailsSpring, [0, 1], [30, 0])}px)`,
  };

  return (
    <SceneContainer bgImage={`https://placehold.co/${WIDTH}x${HEIGHT}.png`}>
      <div className="text-center flex flex-col items-center justify-center h-full">
        <h1
          className="font-headline text-6xl md:text-7xl font-bold text-primary-foreground mb-6 text-shadow-md leading-tight"
          style={titleAnimation}
        >
          {prDetails.title}
        </h1>

        {prDetails.user && (
          <div className="flex items-center mb-4" style={avatarAnimation}>
            <Img
              src={prDetails.user.avatar_url}
              alt={`${prDetails.user.login}'s avatar`}
              className="w-20 h-20 rounded-full border-4 border-primary/80 shadow-lg mr-4"
              width={80}
              height={80}
              data-ai-hint="profile avatar tech"
            />
            <p className="text-3xl text-secondary-foreground font-medium text-shadow-sm">
              @{prDetails.user.login}
            </p>
          </div>
        )}
        
        <div style={detailsAnimation} className="text-2xl text-muted-foreground">
            <p className="mb-2">PR #{prDetails.number}</p>
            <p>
              <span className="font-semibold text-accent/90">{prDetails.head.ref}</span>
              {' → '}
              <span className="font-semibold text-primary/90">{prDetails.base.ref}</span>
            </p>
        </div>

      </div>
    </SceneContainer>
  );
};
