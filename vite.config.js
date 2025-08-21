import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
	build: {
		rollupOptions: {
			input: {
				popup: resolve(__dirname, 'popup.html'),
			},
			output: {
				entryFileNames: `[name].js`,
				chunkFileNames: `[name].js`,
				assetFileNames: `[name].[ext]`,
			},
		},
		outDir: 'dist',
		emptyOutDir: true,
		assetsDir: '',
		// Optimize for browser extensions
		target: 'esnext',
		minify: false, // Keep readable for debugging
	},
	base: './',
	publicDir: 'public',
	// Configure for transformers library
	optimizeDeps: {
		include: ['@xenova/transformers'],
	},
	// Handle Web Workers and WASM files
	worker: {
		format: 'es',
	},
	// Ensure proper module resolution
	resolve: {
		alias: {
			'@': resolve(__dirname, './'),
		},
	},
});
