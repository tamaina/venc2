const esbuild = require('esbuild');
const watch = !!process.argv[2]?.includes('watch');

/** @type {esbuild.BuildOptions} */
const lib = {
	entryPoints: [ `${__dirname}/src/index.ts` ],
	bundle: true,
	format: 'esm',
	treeShaking: true,
	minify: false,
	absWorkingDir: __dirname,
	outbase: `${__dirname}/src`,
	outdir: `${__dirname}/dist`,
	loader: {
		'.ts': 'ts'
	},
	tsconfig: `${__dirname}/tsconfig.json`,
};

const worker = {
	entryPoints: [ `${__dirname}/src/worker.ts` ],
	bundle: true,
	format: 'esm',
	treeShaking: true,
	minify: true,
	absWorkingDir: __dirname,
	outbase: `${__dirname}/src`,
	outdir: `${__dirname}/dist`,
	loader: {
		'.ts': 'ts'
	},
	tsconfig: `${__dirname}/tsconfig.json`,
};

(async () => {
	console.log('building...', { watch });

	if (!watch) {
		await esbuild.build(lib);
		await esbuild.build(worker);
		console.log('done');
	} else {
		const libCtx = await esbuild.context(lib);
		await libCtx.watch();
		const workerCtx = await esbuild.context(worker);
		await workerCtx.watch();
		console.log('watching...');
	}
})();
