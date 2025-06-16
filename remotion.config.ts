// This file is used by the Remotion CLI.
// You can disable this file if you are not using the CLI,
// or if you are bundling Remotion using a different bundler.

// Find all compositions here.
import {enableSkia} from '@remotion/skia';
import {enableTailwind} from '@remotion/tailwind';

enableSkia();
enableTailwind();

/**
 * This is the main configuration file for Remotion.
 *
 * You can edit it to:
 * - change the entry point for bundling
 * - customize paths
 * - change the browser timeout
 * - add more compositions
 * - etc.
 *
 * Visit https://www.remotion.dev/docs/config to learn more!
 */
import {Config} from '@remotion/cli/config';

Config.setEntryPoint('src/remotion/index.ts'); // Point to your main Remotion export
Config.setChromiumOpenGlRenderer('angle'); // Or 'swiftshader' or 'desktop'. 'angle' is usually good for compatibility.
Config.setOverwriteOutput(true);
Config.setBrowserTimeout(120000); // Increase timeout for potentially long renders
// Config.setPort(3001); // If you want Remotion Studio on a different port
// Config.setPublicDir("public"); // If your static assets are in public
