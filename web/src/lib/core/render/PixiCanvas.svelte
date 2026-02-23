<script lang="ts">
	import {initDevtools} from '@pixi/devtools';
	import {Viewport} from 'pixi-viewport';
	import {Application, Assets, FederatedPointerEvent, Graphics} from 'pixi.js';
	import {onMount} from 'svelte';
	import {EventEmitter} from 'tseep/lib/ee-safe';
	import type {CameraControl} from './camera';
	import type {Renderer} from './renderer';

	type CanvasEventEmitter = EventEmitter<{
		clicked: (pos: {x: number; y: number}) => void;
	}>;

	interface Props {
		cameraControl: CameraControl;
		renderer: Renderer;
		eventEmitter: CanvasEventEmitter;
		cellSize: number;
		showGrid?: boolean;
	}
	let {cameraControl, renderer, eventEmitter, showGrid, cellSize}: Props =
		$props();

	function buildGrid(
		graphics: Graphics,
		witdh: number,
		height: number,
		cellSize: number,
	) {
		const numRows = Math.floor(height / cellSize) + 1;
		const numCols = Math.floor(witdh / cellSize) + 1;
		for (let i = 0; i < numCols; i++) {
			graphics.moveTo(i * cellSize, 0).lineTo(i * cellSize, height);
		}

		for (let i = 0; i < numRows; i++) {
			graphics.moveTo(0, i * cellSize).lineTo(witdh, i * cellSize);
		}

		return graphics;
	}

	let canvas: HTMLCanvasElement;
	let viewport: Viewport;
	onMount(() => {
		const minWidth = 5 * cellSize;
		const minHeight = 5 * cellSize;
		const maxWidth = 50 * cellSize;
		const maxHeight = 50 * cellSize;

		let isDragging = false;
		let dragStartPos = {x: 0, y: 0};
		let clickThreshold = 5; // pixels

		function onclick(event: FederatedPointerEvent) {
			// Only trigger click if we're not in a drag operation
			if (!isDragging) {
				const pos = viewport.toWorld(event.x, event.y);
				eventEmitter.emit('clicked', {
					x: Math.round(pos.x / cellSize),
					y: Math.round(pos.y / cellSize),
				});
			}
		}

		function onPointerDown(event: FederatedPointerEvent) {
			isDragging = false;
			dragStartPos = {x: event.x, y: event.y};
		}

		function onPointerMove(event: FederatedPointerEvent) {
			const deltaX = Math.abs(event.x - dragStartPos.x);
			const deltaY = Math.abs(event.y - dragStartPos.y);

			// If movement exceeds threshold, we're dragging
			if (deltaX > clickThreshold || deltaY > clickThreshold) {
				isDragging = true;
			}
		}

		function onPointerUp() {
			// Reset drag state after a short delay to ensure click event doesn't fire
			setTimeout(() => {
				isDragging = false;
			}, 10);
		}

		function resizeViewport() {
			viewport && viewport.resize();
		}
		const sizeObserver = new ResizeObserver(resizeViewport);
		sizeObserver.observe(canvas);

		console.log(`Mounting PixiCanvas......`);
		const app = new Application();
		(globalThis as any).app = app;

		initDevtools({app}); // does not seem to work anymore
		// so we use this:
		(globalThis as any).__PIXI_APP__ = app;

		let initialised = false;
		let appStarted = false;
		let destroying = false;
		const appInitialising = app.init({
			resizeTo: canvas,
			canvas,
			backgroundAlpha: 1,
			backgroundColor: 'black',
			roundPixels: true,
			resolution: 1,
			antialias: false,
		});
		appInitialising.then(() => {
			if (destroying) {
				return;
			}
			initialised = true;
			// create viewport
			viewport = new Viewport({
				events: app.renderer.events, // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
				allowPreserveDragOutside: true,
			});
			cameraControl.setViewPort(viewport);
			(globalThis as any).viewport = viewport;
			viewport.moveCenter(0, 0);

			Assets.loadBundle('default').then(() => {
				if (destroying) {
					return;
				}
				appStarted = true;
				renderer.onAppStarted(viewport);
			});

			// add the viewport to the stage
			app.stage.addChild(viewport);

			// activate plugins
			viewport.drag().pinch().wheel().clampZoom({
				maxWidth,
				maxHeight,
				minHeight,
				minWidth,
			});

			viewport.fit(true, 20 * cellSize, 20 * cellSize);

			let gridPixel: Graphics | undefined;
			if (showGrid) {
				const gridSize = Math.max(maxWidth, maxHeight) + 2 * cellSize;

				gridPixel = buildGrid(
					new Graphics(),
					gridSize,
					gridSize,
					cellSize,
				).stroke({
					color: 0xffffff,
					pixelLine: true,
					width: 1,
				});
			}

			viewport.moveCenter(0, 0);

			// viewport.addChild(gridPixel);

			// Register pointer events for proper click/drag handling
			viewport.on('pointerdown', onPointerDown);
			viewport.on('pointermove', onPointerMove);
			viewport.on('pointerup', onPointerUp);
			viewport.on('click', onclick);
			viewport.on('tap', onclick);

			// Listen for animate update
			app.ticker.add((time) => {
				cameraControl.update({
					x: viewport.center.x / cellSize,
					y: viewport.center.y / cellSize,
					width: viewport.worldScreenWidth / cellSize,
					height: viewport.worldScreenHeight / cellSize,
				});

				if (gridPixel) {
					// Apply modulo to create an infinite scrolling grid that follows viewport
					// Get the current viewport position
					const viewportX = viewport.x;
					const viewportY = viewport.y;
					const scale = viewport.scaled;

					const offsetX = viewportX / scale;
					const offsetY = viewportY / scale;

					gridPixel.x =
						-offsetX - cellSize - cellSize / 2 + (offsetX % cellSize);
					gridPixel.y =
						-offsetY - cellSize - cellSize / 2 + (offsetY % cellSize);

					gridPixel.alpha = viewport.scaled / 48;
				}

				// Call tick() on the renderer for per-frame updates
				renderer.tick();
			});
		});

		return () => {
			sizeObserver.disconnect();
			console.log(`Unmounting PixiCanvas...`);
			if (initialised) {
				console.log(`destroying Pixi Application...`);
				if (appStarted) {
					renderer.onAppStopped();
				}
				app.destroy();
			} else {
				console.log(
					`unmounting while app was not initialised, waiting for it...`,
				);
				destroying = true;
				appInitialising.then(() => {
					console.log(`destroying Pixi Application...`);
					app.destroy();
				});
			}
		};
	});
</script>

<canvas id="arena" bind:this={canvas}></canvas>

<style>
	canvas {
		background-color: black;
		position: absolute;
		width: 100%;
		height: 100%;
		pointer-events: auto;
		image-rendering: pixelated; /* crisp-edge  ?*/
	}
</style>
