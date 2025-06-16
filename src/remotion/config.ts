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
// Transition duration is handled by TransitionSeries timing

export const calculateVideoDuration = (prData: PRData | null): { durationInFrames: number; width: number; height: number; fps: number } => {
  if (!prData) {
    return { durationInFrames: 30 * 10, width: WIDTH, height: HEIGHT, fps: FPS }; // Default 10s
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

  // Account for transitions between scenes. Number of transitions = Number of active scenes - 1
  let activeScenes = 1; // Title scene
  if (filesToShow > 0) activeScenes++;
  if (prData.commits.length > 0) activeScenes++;
  if (prData.checkRuns.length > 0) activeScenes++;
  activeScenes++; // Stats scene
  activeScenes++; // Final scene

  // Filter out scenes that might not be shown
  let actualSceneCount = 2; // Title and Final are always there (conceptually)
  if (DURATION_STATS_SCENE > 0) actualSceneCount++; // Stats
  if (filesToShow > 0 && DURATION_PER_FILE_DIFF > 0) actualSceneCount++; // CodeDiff
  if (prData.commits.length > 0 && DURATION_COMMIT_HISTORY_SCENE > 0) actualSceneCount++; // CommitHistory
  if (prData.checkRuns.length > 0 && DURATION_CICD_STATUS_SCENE > 0) actualSceneCount++; // CICD


  const numberOfTransitions = Math.max(0, actualSceneCount -1);
  totalSeconds += numberOfTransitions * ( (FPS/2) / FPS); // Each transition is 0.5 seconds (FPS/2 frames)

  return {
    durationInFrames: Math.ceil(totalSeconds * FPS),
    width: WIDTH,
    height: HEIGHT,
    fps: FPS,
  };
};
