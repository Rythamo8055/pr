
import React from 'react';
import { Img, useCurrentFrame, interpolate, Easing, spring, useVideoConfig } from 'remotion'; // Added useVideoConfig
import type { GitHubPullRequest } from '@/lib/github-types';
import { SceneContainer } from './SceneContainer';
import { GitPullRequest, CheckCircle, XCircle, GitMerge } from 'lucide-react';
// FPS not needed from config if using useVideoConfig

interface FinalSceneProps {
  prDetails: GitHubPullRequest;
}

export const FinalScene: React.FC<FinalSceneProps> = ({ prDetails }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig(); // Use hook for FPS

  let statusText = "PR Status";
  let StatusIcon = GitPullRequest;
  let iconColor = "text-primary";
  let subText = `PR #${prDetails.number}`;

  if (prDetails.state === 'open') {
    statusText = "Ready for Review";
    StatusIcon = GitPullRequest;
    iconColor = "text-blue-500";
  } else if (prDetails.state === 'merged' && prDetails.merged_at) {
    statusText = "Successfully Merged!";
    StatusIcon = GitMerge;
    iconColor = "text-purple-500";
    if(prDetails.merged_by) {
      subText = `Merged by @${prDetails.merged_by.login}`;
    }
  } else if (prDetails.state === 'closed' && !prDetails.merged_at) {
    statusText = "PR Closed";
    StatusIcon = XCircle;
    iconColor = "text-destructive";
  }


  const animationProgress = spring({
    frame,
    fps,
    config: { stiffness: 80, damping: 15, mass: 1.2 },
  });

  const iconScale = interpolate(animationProgress, [0, 1], [0.3, 1]);
  const iconOpacity = animationProgress;

  const text1Spring = spring({frame, fps, delay: fps*0.2, config: {stiffness:90, damping: 18}});
  const text1Opacity = text1Spring;
  const text1Y = interpolate(text1Spring, [0,1], [20,0]);

  const text2Spring = spring({frame, fps, delay: fps*0.4, config: {stiffness:90, damping: 18}});
  const text2Opacity = text2Spring;
  const text2Y = interpolate(text2Spring, [0,1], [20,0]);

  const avatarOpacity = prDetails.merged_by ? spring({frame, fps, delay: fps*0.3, config: {stiffness: 90, damping: 18}}) : 0;
  const avatarScale = prDetails.merged_by ? interpolate(avatarOpacity, [0,1], [0.5,1], {easing: Easing.out(Easing.back(1.5))}) : 0;


  return (
    <SceneContainer title="Final Status">
      <div className="flex flex-col items-center justify-center text-center">
        <StatusIcon
          className={`w-36 h-36 md:w-48 md:h-48 mb-6 ${iconColor}`}
          style={{ opacity: iconOpacity, transform: `scale(${iconScale})` }}
        />
        <h2
          className={`font-headline text-5xl md:text-6xl font-bold mb-4 ${iconColor} text-shadow-md`}
          style={{ opacity: text1Opacity, transform: `translateY(${text1Y}px)`}}
        >
          {statusText}
        </h2>

        {prDetails.merged_by && prDetails.merged_by.avatar_url && (
          <div
            className="flex items-center justify-center my-4"
            style={{opacity: avatarOpacity, transform: `scale(${avatarScale})`}}
          >
            <Img
              src={prDetails.merged_by.avatar_url}
              alt={prDetails.merged_by.login}
              className="w-20 h-20 rounded-full border-4 border-purple-400/70 shadow-lg"
              data-ai-hint="profile avatar"
            />
          </div>
        )}

        <p
          className="text-3xl text-muted-foreground"
          style={{ opacity: text2Opacity, transform: `translateY(${text2Y}px)`}}
        >
          {subText}
        </p>
      </div>
    </SceneContainer>
  );
};
