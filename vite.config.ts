import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages 项目站点部署在 /KnowledgeNotes/ 下；本地开发用根路径。
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/KnowledgeNotes/' : '/',
  plugins: [react()],
}));
