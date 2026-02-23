import type {Viewport} from 'pixi-viewport';

export type Renderer = {
	onAppStarted(viewport: Viewport): void;
	onAppStopped(): void;
	tick(): void;
};
