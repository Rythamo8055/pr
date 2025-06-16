
import type { PRData } from "@/lib/github-types";

export const COMPOSITION_ID = 'PRVisualizer';
export const FPS = 30;
export const WIDTH = 1280;
export const HEIGHT = 720;

// Scene duration estimates in seconds
export const DURATION_TITLE_SCENE = 5; // Increased for more animation
export const DURATION_STATS_SCENE = 6; // Increased for counter and bar animations
export const DURATION_PER_FILE_DIFF = 8; 
export const MAX_FILES_TO_SHOW = 3; // Reduced to allow more time per file if many insights
export const DURATION_COMMIT_HISTORY_SCENE = 6;
export const DURATION_CICD_STATUS_SCENE = 4; // Increased for icon animation
export const DURATION_FINAL_SCENE = 5; // Increased for animation

// Transition duration
export const DEFAULT_TRANSITION_DURATION_IN_FRAMES = FPS; // 1 second for spring transitions

export const calculateVideoDuration = (prData: PRData | null): { durationInFrames: number; width: number; height: number; fps: number } => {
  if (!prData) {
    return { durationInFrames: 30 * 15, width: WIDTH, height: HEIGHT, fps: FPS }; // Default 15s
  }

  let totalSeconds = 0;
  totalSeconds += DURATION_TITLE_SCENE;
  totalSeconds += DURATION_STATS_SCENE;
  
  const filesToShow = Math.min(prData.files.length, MAX_FILES_TO_SHOW);
  if (filesToShow > 0) {
    totalSeconds += (filesToShow * DURATION_PER_FILE_DIFF);
  }
  
  if (prData.commits.length > 0) {
    totalSeconds += DURATION_COMMIT_HISTORY_SCENE;
  }
  
  if (prData.checkRuns.length > 0) {
    totalSeconds += DURATION_CICD_STATUS_SCENE;
  }
  
  totalSeconds += DURATION_FINAL_SCENE;

  let actualSceneCount = 0;
  if (DURATION_TITLE_SCENE > 0) actualSceneCount++;
  if (DURATION_STATS_SCENE > 0) actualSceneCount++;
  if (filesToShow > 0 && DURATION_PER_FILE_DIFF > 0) actualSceneCount++;
  if (prData.commits.length > 0 && DURATION_COMMIT_HISTORY_SCENE > 0) actualSceneCount++;
  if (prData.checkRuns.length > 0 && DURATION_CICD_STATUS_SCENE > 0) actualSceneCount++;
  if (DURATION_FINAL_SCENE > 0) actualSceneCount++;
  
  const numberOfTransitions = Math.max(0, actualSceneCount -1);
  totalSeconds += numberOfTransitions * (DEFAULT_TRANSITION_DURATION_IN_FRAMES / FPS);

  return {
    durationInFrames: Math.ceil(totalSeconds * FPS),
    width: WIDTH,
    height: HEIGHT,
    fps: FPS,
  };
};
