export default {
	root: '.',
	server: {
		proxy: {
			'/save': 'http://localhost:3000',
			'/load': 'http://localhost:3000',
			'/dir': 'http://localhost:3000',
			'/upload': 'http://localhost:3000',
		},
	},
	build: {
		rollupOptions: {
			input: {
				main: './index.html',
			},
		},
		outDir: 'dist',
		emptyOutDir: true,
	},
};
