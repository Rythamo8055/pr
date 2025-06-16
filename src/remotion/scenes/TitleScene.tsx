import React from 'react';
import { Img, useCurrentFrame, interpolate, Easing } from 'remotion';
import type { GitHubPullRequest } from '@/lib/github-types';
import { SceneContainer } from './SceneContainer';
import { WIDTH, HEIGHT } from '../config';

interface TitleSceneProps {
  prDetails: GitHubPullRequest;
}

export const TitleScene: React.FC<TitleSceneProps> = ({ prDetails }) => {
  const frame = useCurrentFrame();

  const titleAnimation = {
    opacity: interpolate(frame, [0, 20], [0, 1], { easing: Easing.out(Easing.ease) }),
    transform: `translateY(${interpolate(frame, [0, 20], [50, 0], { easing: Easing.out(Easing.cubic) })}px)`,
  };

  const avatarAnimation = {
    opacity: interpolate(frame, [15, 35], [0, 1], { easing: Easing.out(Easing.ease) }),
    transform: `scale(${interpolate(frame, [15, 35], [0.5, 1], { easing: Easing.out(Easing.back(1.7)) })})`,
  };
  
  const detailsAnimation = {
    opacity: interpolate(frame, [25, 45], [0, 1], { easing: Easing.out(Easing.ease) }),
    transform: `translateY(${interpolate(frame, [25, 45], [30, 0], { easing: Easing.out(Easing.cubic) })}px)`,
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
              className="w-20 h-20 rounded-full border-4 border-primary shadow-lg mr-4"
              width={80}
              height={80}
              data-ai-hint="profile avatar"
            />
            <p className="text-3xl text-secondary-foreground font-medium">
              @{prDetails.user.login}
            </p>
          </div>
        )}
        
        <div style={detailsAnimation} className="text-2xl text-muted-foreground">
            <p className="mb-2">PR #{prDetails.number}</p>
            <p>
              <span className="font-semibold text-accent">{prDetails.head.ref}</span>
              {' → '}
              <span className="font-semibold text-primary">{prDetails.base.ref}</span>
            </p>
        </div>

      </div>
    </SceneContainer>
  );
};
