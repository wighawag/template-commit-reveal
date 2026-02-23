import {type Viewport} from 'pixi-viewport';
import {writable, type Readable} from 'svelte/store';

export type Camera = {
	x: number;
	y: number;
	width: number;
	height: number;
};

export type CameraWatcher = Readable<Camera>;

export type CameraControl = {
	setViewPort(p: Viewport): void;
	update(values: Camera): void;
	follow(x: number, y: number): void;
	move(x: number, y: number): void;
};

export function createCamera() {
	let $camera = {
		x: 0,
		y: 0,
		width: 0,
		height: 0,
	};
	const cameraStore = writable<Camera>($camera);

	let viewport: Viewport | undefined;
	const camera: CameraWatcher = {
		subscribe: cameraStore.subscribe,
	};

	const cameraControl: CameraControl = {
		setViewPort(p: Viewport) {
			viewport = p;
		},
		follow(x: number, y: number) {
			if (viewport) {
				viewport.moveCenter(x * 10, y * 10);
			}
		},
		move(x: number, y: number) {
			if (viewport) {
				viewport.moveCenter(($camera.x + x) * 10, ($camera.y + y || 0) * 10);
			}
		},
		update(values: Camera) {
			if (
				$camera.x != values.x ||
				$camera.y != values.y ||
				$camera.width != values.width ||
				$camera.height != values.height
			) {
				$camera = values;
				cameraStore.set($camera);
			}
		},
	};

	return {camera, cameraControl};
}
