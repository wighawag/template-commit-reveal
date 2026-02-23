import {
	type Camera,
	type CameraControl,
	type CameraWatcher,
} from '$lib/core/render/camera';
import {type MyEventEmitter} from '$lib/render/eventEmitter';
import {type ViewState} from '$lib/view';
import {AnimatedSprite, Container, Sprite} from 'pixi.js';
import type {Readable} from 'svelte/store';
import {createOperations} from '$lib/operations';
import type {LocalStateStore} from '$lib/private/localState';
import type {TypedDeployments} from '$lib/core/connection/types';
import type {EpochConfigStore, EpochInfoStore} from '$lib/types';

export function createRenderer(params: {
	viewState: Readable<ViewState>;
	eventEmitter: MyEventEmitter;

	epochInfo: EpochInfoStore;
	localState: LocalStateStore;
	epochConfig: EpochConfigStore;
	camera: CameraWatcher;
	cameraControl: CameraControl;
	deployments: TypedDeployments;
}) {
	const {
		viewState,
		eventEmitter,
		epochInfo,
		localState,
		epochConfig,
		camera,
		cameraControl,
		deployments,
	} = params;
	const operations = createOperations({
		localState,
		epochInfo,
		epochConfig,
		cameraControl,
		viewState,
		eventEmitter,
		deployments,
	});
	let unsubscribe: (() => void) | undefined = undefined;
	let cameraUnsubscribe: (() => void) | undefined = undefined;

	function getVisibleBounds(camera: Camera): {
		startX: number;
		endX: number;
		startY: number;
		endY: number;
	} {
		// Large margin to ensure no gaps at area boundaries
		const margin = 20;
		return {
			startX: Math.floor(camera.x - camera.width / 2 - margin),
			endX: Math.ceil(camera.x + camera.width / 2 + margin),
			startY: Math.floor(camera.y - camera.height / 2 - margin),
			endY: Math.ceil(camera.y + camera.height / 2 + margin),
		};
	}

	async function onAppStarted(container: Container) {
		console.log(`renderer has started!`);
		operations.startListening();

		function updateFromCamera(camera: Camera) {
			const bounds = getVisibleBounds(camera);

			// TODO
		}

		// Subscribe to camera changes for wall rendering
		cameraUnsubscribe = camera.subscribe(($camera) => {
			updateFromCamera($camera);
		});

		unsubscribe = viewState.subscribe(($viewState) => {});
	}

	function onAppStopped() {
		operations.stopListening();

		unsubscribe?.();
		cameraUnsubscribe?.();
	}

	// Per-frame update for all game objects
	function tick() {
		// TODO
	}

	return {
		onAppStarted,
		onAppStopped,
		tick,
	};
}

export type Renderer = ReturnType<typeof createRenderer>;
