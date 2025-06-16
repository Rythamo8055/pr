import {Composition} from 'remotion';
import {MyComposition} from './MyComposition';
import type {PRData} from '@/lib/github-types'; // Assuming types are needed for defaultProps
import {
  COMPOSITION_ID,
  FPS,
  WIDTH,
  HEIGHT,
  calculateVideoDuration,
} from './config';

// Sample default PRData for Remotion Studio and `remotion render` if needed.
// In a real scenario, you might fetch this or use a local JSON.
const defaultPrData: PRData = {
  prDetails: {
    id: 1,
    html_url: 'https://github.com/example/repo/pull/1',
    number: 1,
    title: 'Default PR Title: Fix an amazing bug',
    user: { login: 'defaultUser', avatar_url: 'https://placehold.co/80x80.png', html_url: '' },
    body: 'This is a default PR body description.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    closed_at: null,
    merged_at: null,
    state: 'open',
    merged: false,
    merged_by: null,
    comments: 2,
    review_comments: 1,
    commits: 3,
    additions: 100,
    deletions: 50,
    changed_files: 5,
    head: { ref: 'feature-branch', sha: 'headsha' },
    base: { ref: 'main', sha: 'basesha' },
  },
  commits: [
    { sha: 'c1', commit: { message: 'First commit: Initial work', author: { name: 'User A' } }, author: { login: 'UserA', avatar_url: 'https://placehold.co/40x40.png', html_url: '' }, html_url: '' },
    { sha: 'c2', commit: { message: 'Second commit: Add new feature', author: { name: 'User B' } }, author: { login: 'UserB', avatar_url: 'https://placehold.co/40x40.png', html_url: '' }, html_url: '' },
    { sha: 'c3', commit: { message: 'Third commit: Refactor and fix tests', author: { name: 'User A' } }, author: { login: 'UserA', avatar_url: 'https://placehold.co/40x40.png', html_url: '' }, html_url: '' },
  ],
  files: [
    { filename: 'src/components/Feature.tsx', additions: 50, deletions: 10, status: 'modified', patch: 'diff --git a/file.txt b/file.txt\nindex 123..456 100644\n--- a/file.txt\n+++ b/file.txt\n@@ -1 +1 @@\n-old line\n+new line\n+another new line', sha:'', blob_url:'',raw_url:'',contents_url:'',changes:60 },
    { filename: 'README.md', additions: 10, deletions: 0, status: 'added', patch: 'diff --git a/README.md b/README.md\n--- /dev/null\n+++ b/README.md\n@@ -0,0 +1 @@\n+Hello World', sha:'', blob_url:'',raw_url:'',contents_url:'',changes:10 },
  ],
  diff: 'diff --git a/src/components/Feature.tsx b/src/components/Feature.tsx\nindex 123..456 100644\n--- a/src/components/Feature.tsx\n+++ b/src/components/Feature.tsx\n@@ -1,1 +1,2 @@\n-Hello\n+Hello World\n+New Line\ndiff --git a/README.md b/README.md\n--- /dev/null\n+++ b/README.md\n@@ -0,0 +1 @@\n+Hello World',
  checkRuns: [
    { id: 1, name: 'Build', status: 'completed', conclusion: 'success', html_url: '', started_at: new Date().toISOString(), completed_at: new Date().toISOString()},
    { id: 2, name: 'Test Suite', status: 'completed', conclusion: 'success', html_url: '', started_at: new Date().toISOString(), completed_at: new Date().toISOString() },
  ],
  codeInsights: 'This PR introduces a new feature and updates the README. Key changes include modifications to Feature.tsx and the addition of a new line. All checks have passed.',
};

export const RemotionRoot: React.FC = () => {
  const { durationInFrames } = calculateVideoDuration(defaultPrData);
  return (
    <Composition
      id={COMPOSITION_ID}
      component={MyComposition}
      durationInFrames={durationInFrames}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={{
        prData: defaultPrData,
      }}
    />
  );
};
