import deployments from '$lib/deployments';
import {driver} from 'driver.js';
import 'driver.js/dist/driver.css';
import {writable} from 'svelte/store';

const _tour = writable({running: false});
export const tour = {
	subscribe: _tour.subscribe,
};

export function startTour(callback?: () => void) {
	let interval: NodeJS.Timeout | undefined;
	const driverObj = driver({
		popoverClass: 'driverjs-theme',
		showProgress: true,
		animate: false,
		allowClose: false,
		// disableActiveInteraction: true,
		steps: [
			{
				element: '#arena',
				popover: {
					title: 'The Arena',
					description:
						'To enter the game, you just need to pick a location in the arean',
				},
			},
		],
		onDestroyed(elem) {
			if (interval) {
				clearInterval(interval);
			}
			_tour.set({running: false});
			callback && callback();
		},
	});
	interval = setInterval(() => {
		if (driverObj) {
			// needed if elements moves
			driverObj.refresh();
		}
	}, 200);
	_tour.set({running: true});
	driverObj.drive();
}
