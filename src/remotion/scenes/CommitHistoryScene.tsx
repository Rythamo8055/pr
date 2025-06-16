import React from 'react';
import { useCurrentFrame, interpolate, Easing, Img } from 'remotion';
import type { GitHubCommit } from '@/lib/github-types';
import { SceneContainer } from './SceneContainer';
import { GitCommit } from 'lucide-react';
import { FPS } from '../config';

interface CommitHistorySceneProps {
  commits: GitHubCommit[];
}

export const CommitHistoryScene: React.FC<CommitHistorySceneProps> = ({ commits }) => {
  const frame = useCurrentFrame();
  const maxCommitsToShow = 5; // Show up to 5 commits
  const displayCommits = commits.slice(0, maxCommitsToShow).reverse(); // Show latest first

  return (
    <SceneContainer title="Commit History">
      <div className="w-full max-w-2xl">
        {displayCommits.map((commit, index) => {
          const delay = index * (FPS / 3); // Stagger appearance
          const itemProgress = interpolate(frame, [delay, delay + FPS], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.out(Easing.ease),
          });

          const opacity = itemProgress;
          const translateY = interpolate(itemProgress, [0, 1], [30, 0]);

          return (
            <div
              key={commit.sha}
              className="flex items-start mb-4 p-3 bg-card/70 backdrop-blur-sm rounded-lg shadow-sm glassmorphism"
              style={{ opacity, transform: `translateY(${translateY}px)` }}
            >
              {commit.author?.avatar_url && (
                <Img 
                  src={commit.author.avatar_url} 
                  alt={commit.author.login || 'Committer'}
                  className="w-10 h-10 rounded-full mr-3 border-2 border-primary"
                  data-ai-hint="profile avatar"
                />
              )}
              {!commit.author?.avatar_url && <GitCommit className="w-10 h-10 text-primary mr-3" />}
              <div className="flex-1">
                <p className="text-sm font-medium text-primary-foreground truncate" title={commit.commit.message}>
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
