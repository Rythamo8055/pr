import React from 'react';
import { Img, useCurrentFrame, interpolate, Easing, spring } from 'remotion';
import type { GitHubPullRequest } from '@/lib/github-types';
import { SceneContainer } from './SceneContainer';
import { GitPullRequest, CheckCircle, XCircle, GitMerge } from 'lucide-react';
import { FPS } from '../config';

interface FinalSceneProps {
  prDetails: GitHubPullRequest;
}

export const FinalScene: React.FC<FinalSceneProps> = ({ prDetails }) => {
  const frame = useCurrentFrame();

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
    iconColor = "text-purple-500"; // Merged often purple/violet
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
    fps: FPS,
    config: { stiffness: 80, damping: 15, mass: 1.2 },
  });

  const iconScale = interpolate(animationProgress, [0, 1], [0.3, 1]);
  const iconOpacity = animationProgress;
  
  const text1Opacity = interpolate(frame, [FPS*0.5, FPS*1], [0,1], {easing: Easing.out(Easing.ease)});
  const text1Y = interpolate(frame, [FPS*0.5, FPS*1], [20,0], {easing: Easing.out(Easing.ease)});

  const text2Opacity = interpolate(frame, [FPS*0.8, FPS*1.3], [0,1], {easing: Easing.out(Easing.ease)});
  const text2Y = interpolate(frame, [FPS*0.8, FPS*1.3], [20,0], {easing: Easing.out(Easing.ease)});
  
  const avatarOpacity = prDetails.merged_by ? interpolate(frame, [FPS*1, FPS*1.5], [0,1], {easing: Easing.out(Easing.ease)}) : 0;
  const avatarScale = prDetails.merged_by ? interpolate(frame, [FPS*1, FPS*1.5], [0.5,1], {easing: Easing.out(Easing.back(1.5))}) : 0;


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
              className="w-20 h-20 rounded-full border-4 border-purple-300 shadow-lg"
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
