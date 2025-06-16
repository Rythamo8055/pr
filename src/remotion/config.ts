import type { PRData } from "@/lib/github-types";

export const COMPOSITION_ID = 'PRVisualizer';
export const FPS = 30;
export const WIDTH = 1280;
export const HEIGHT = 720;

// Scene duration estimates in seconds
export const DURATION_TITLE_SCENE = 4;
export const DURATION_STATS_SCENE = 5;
export const DURATION_PER_FILE_DIFF = 8; // Time per file in code diff scene
export const MAX_FILES_TO_SHOW = 5; // Max files to show in code diff
export const DURATION_COMMIT_HISTORY_SCENE = 6;
export const DURATION_CICD_STATUS_SCENE = 3;
export const DURATION_FINAL_SCENE = 4;
export const DURATION_TRANSITION = 0.5; // Transition time between scenes

export const calculateVideoDuration = (prData: PRData | null): { durationInFrames: number; width: number; height: number; fps: number } => {
  if (!prData) {
    return { durationInFrames: 30 * 10, width: WIDTH, height: HEIGHT, fps: FPS }; // Default 10s
  }

  let totalSeconds = 0;
  totalSeconds += DURATION_TITLE_SCENE + DURATION_TRANSITION;
  totalSeconds += DURATION_STATS_SCENE + DURATION_TRANSITION;
  
  const filesToShow = Math.min(prData.files.length, MAX_FILES_TO_SHOW);
  if (filesToShow > 0) {
    totalSeconds += (filesToShow * DURATION_PER_FILE_DIFF) + DURATION_TRANSITION;
  }
  
  if (prData.commits.length > 0) {
    totalSeconds += DURATION_COMMIT_HISTORY_SCENE + DURATION_TRANSITION;
  }
  
  if (prData.checkRuns.length > 0) {
    totalSeconds += DURATION_CICD_STATUS_SCENE + DURATION_TRANSITION;
  }
  
  totalSeconds += DURATION_FINAL_SCENE;

  return {
    durationInFrames: Math.ceil(totalSeconds * FPS),
    width: WIDTH,
    height: HEIGHT,
    fps: FPS,
  };
};
