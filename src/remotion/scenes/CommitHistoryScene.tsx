
import React from 'react';
import { useCurrentFrame, interpolate, Easing, Img, spring, useVideoConfig } from 'remotion'; // Added spring, useVideoConfig
import type { GitHubCommit } from '@/lib/github-types';
import { SceneContainer } from './SceneContainer';
import { GitCommit } from 'lucide-react';
// FPS is not directly needed from config if using useVideoConfig

interface CommitHistorySceneProps {
  commits: GitHubCommit[];
}

export const CommitHistoryScene: React.FC<CommitHistorySceneProps> = ({ commits }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig(); // Use hook for FPS
  const maxCommitsToShow = 4; // Adjusted for better spacing
  const displayCommits = commits.slice(0, maxCommitsToShow).reverse(); // Show latest first

  return (
    <SceneContainer title="Commit History">
      <div className="w-full max-w-2xl">
        {displayCommits.map((commit, index) => {
          const delay = index * (fps / 2.5); // Stagger appearance more
          
          const itemProgress = spring({
            frame,
            fps,
            delay,
            config: { mass: 0.7, stiffness: 100, damping: 15 }
          });

          const opacity = itemProgress;
          const translateY = interpolate(itemProgress, [0, 1], [25, 0]);
          const scale = interpolate(itemProgress, [0, 1], [0.9, 1]);

          return (
            <div
              key={commit.sha}
              className="flex items-start mb-3 p-3 bg-card/80 backdrop-blur-md rounded-lg shadow-md glassmorphism"
              style={{ opacity, transform: `translateY(${translateY}px) scale(${scale})` }}
            >
              {commit.author?.avatar_url && (
                <Img
                  src={commit.author.avatar_url}
                  alt={commit.author.login || 'Committer'}
                  className="w-10 h-10 rounded-full mr-3 border-2 border-primary/70 shadow"
                  data-ai-hint="profile avatar"
                />
              )}
              {!commit.author?.avatar_url && <GitCommit className="w-10 h-10 text-primary mr-3 flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary truncate" title={commit.commit.message}>
                  {commit.commit.message.split('\n')[0]} {/* Show first line only */}
                </p>
                <p className="text-xs text-muted-foreground">
                  by {commit.commit.author?.name || commit.author?.login || 'Unknown User'}
                  {commit.commit.author?.date && ` on ${new Date(commit.commit.author.date).toLocaleDateString()}`}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </SceneContainer>
  );
};
