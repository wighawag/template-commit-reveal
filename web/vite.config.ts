import {defineConfig, type Plugin, type ResolvedConfig} from 'vite';
import devtoolsJson from 'vite-plugin-devtools-json';
import basicSsl from '@vitejs/plugin-basic-ssl';
import tailwindcss from '@tailwindcss/vite';
import {sveltekit} from '@sveltejs/kit/vite';
import {AssetPack, type AssetPackConfig} from '@assetpack/core';
import {pixiPipes} from '@assetpack/core/pixi';
import {readFileSync, writeFileSync, existsSync} from 'fs';
import {hookup} from 'named-logs-console';
import {execSync} from 'child_process';

hookup();

const assetsFolder = '../assets';
const manifestSrcPath = './src/lib/manifest.json';

function assetpackPlugin(): Plugin {
	const apConfig: AssetPackConfig = {
		entry: assetsFolder,
		logLevel: 'verbose',
		strict: true,
		pipes: [
			...pixiPipes({
				resolutions: {default: 1},
				compression: {png: true, jpg: true, webp: false},
				manifest: {
					output: manifestSrcPath,
					includeFileSizes: 'raw',
					includeMetaData: true,
					trimExtensions: true,
				},
			}),
		],
		assetSettings: [
			{
				files: ['**/sprites'],
				metaData: {
					tps: true,
					// other tags can be added here
				},
			},
		],
	};
	let mode: ResolvedConfig['command'];
	let ap: AssetPack | undefined;

	function fixManifest() {
		// ------------------------------------------------------------------
		// fix https://github.com/pixijs/assetpack/issues/148
		// ------------------------------------------------------------------
		const content = readFileSync(manifestSrcPath, 'utf-8');
		const jsonContent = JSON.parse(content);
		function transform(value: string | {src: string}): string | {src: string} {
			if (typeof value === 'string') {
				if (value.startsWith('/')) {
					return value;
				}
				const newValue = `/assets/${value}`;
				console.log(`transforming ${value} into ${newValue}`);
				return newValue;
			} else {
				if (value.src.startsWith('/')) {
					return value;
				}
				const newSrcValue = `/assets/${value.src}`;
				console.log(`transforming ${value.src} into ${newSrcValue}`);
				value.src = newSrcValue;
				return value;
			}
		}
		for (const bundle of jsonContent.bundles) {
			for (const asset of bundle.assets) {
				if (typeof asset.src === 'object') {
					if (Array.isArray(asset.src)) {
						for (let i = 0; i < asset.src.length; i++) {
							asset.src[i] = transform(asset.src[i]);
						}
					} else {
						throw new Error(`src object not supported yet`);
					}
				} else {
					asset.src = transform(asset.src);
				}
			}
		}
		writeFileSync(manifestSrcPath, JSON.stringify(jsonContent, null, 2));
		// ------------------------------------------------------------------
	}

	return {
		name: 'vite-plugin-assetpack',
		configResolved(resolvedConfig) {
			mode = resolvedConfig.command;
			if (!resolvedConfig.publicDir) return;
			if (apConfig.output) return;
			const publicDir = resolvedConfig.publicDir.replace(process.cwd(), '');
			apConfig.output = `.${publicDir}/assets/`;
		},
		buildStart: async () => {
			if (mode === 'serve') {
				if (ap) return;
				ap = new AssetPack(apConfig);
				void ap.watch(() => {
					fixManifest();
				});
			} else {
				await new AssetPack(apConfig).run();
				fixManifest();
			}
		},
		buildEnd: async () => {
			if (ap) {
				await ap.stop();
				ap = undefined;
			}
		},
	};
}

const env = process.env;

let FIRST_COMMIT: string | undefined;
try {
	FIRST_COMMIT = execSync('git rev-list --max-parents=0 HEAD', {
		stdio: ['ignore', 'pipe', 'ignore'],
	})
		.toString()
		.trim();
} catch (e) {
	console.error(e);
}

const plugins = [
	devtoolsJson(
		FIRST_COMMIT
			? {
					uuid: FIRST_COMMIT,
				}
			: undefined,
	),
	tailwindcss(),
	sveltekit(),
];

if (existsSync(assetsFolder)) {
	plugins.push(assetpackPlugin());
} else {
	writeFileSync(
		manifestSrcPath,
		JSON.stringify({
			bundles: [{name: 'default', assets: []}],
		}),
	);
}

if (env.USE_LOCALHOST_SSL) {
	plugins.push(
		// following is not recommended, see:
		// - https://v4.vitejs.dev/config/server-options.html#server-https
		// - https://github.com/vitejs/vite-plugin-basic-ssl
		basicSsl({
			/** name of certification */
			name: 'test',
			/** custom trust domains */
			domains: ['*.custom.com'],
			/** custom certification directory */
			certDir: `${env.HOME}/.devServer/cert`,
		}),
	);
}

export default defineConfig({
	plugins,
	build: {
		emptyOutDir: true,
		minify: false,
		sourcemap: true,
	},
	worker: {
		format: 'es',
	},
	ssr: {
		noExternal: ['pixi-viewport'],
	},
});
