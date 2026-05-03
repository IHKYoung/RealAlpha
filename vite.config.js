import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    // Terser: compress + mangle all variable names, strip comments/console
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 2,
      },
      mangle: {
        toplevel: true,
      },
      format: {
        comments: false,
      },
    },
    // No source maps → original source is not recoverable from devtools
    sourcemap: false,
    rollupOptions: {
      output: {
        // Merge all JS into one chunk to avoid exposing module structure
        manualChunks: () => 'app',
      },
      plugins: [obfuscatorPlugin()],
    },
  },
});

// Inline Rollup plugin: runs javascript-obfuscator on the bundled output
// after terser, adding string-array encoding and hex identifier renaming.
function obfuscatorPlugin() {
  return {
    name: 'obfuscator',
    async renderChunk(code) {
      const { default: JavaScriptObfuscator } = await import('javascript-obfuscator');
      const result = JavaScriptObfuscator.obfuscate(code, {
        compact: true,
        // String array: moves string literals into an encoded array
        stringArray: true,
        stringArrayEncoding: ['base64'],
        stringArrayThreshold: 0.8,
        rotateStringArray: true,
        shuffleStringArray: true,
        // Rename all identifiers to 0xABCD-style hex names
        identifierNamesGenerator: 'hexadecimal',
        renameGlobals: false,
        // Keep these light to avoid significant perf impact
        controlFlowFlattening: false,
        deadCodeInjection: false,
        selfDefending: false,
        disableConsoleOutput: false,
      });
      return { code: result.getObfuscatedCode(), map: null };
    },
  };
}
