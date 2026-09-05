import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [],
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          posts: path.resolve(__dirname, 'posts.html'),
          about: path.resolve(__dirname, 'about.html'),
          contact: path.resolve(__dirname, 'contact.html'),
          post1: path.resolve(__dirname, 'posts/ai-philippine-education.html'),
          post2: path.resolve(__dirname, 'posts/ai-filipino-students.html'),
          post3: path.resolve(__dirname, 'posts/ai-student-productivity.html'),
          post4: path.resolve(__dirname, 'posts/ai-fact-checking.html'),
          post5: path.resolve(__dirname, 'posts/ai-future-philippine-education.html'),
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
