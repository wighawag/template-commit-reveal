import {expose, proxy} from 'comlink';
import {createEmbeddedChain, type EmbeddedChainOptions} from 'embedded-chain';

expose({
	async createEmbeddedChain(options: EmbeddedChainOptions) {
		console.log(`options`, options);
		const chain = await createEmbeddedChain(options);
		const providerAsProxy = proxy(chain.provider);
		return proxy({
			get recordedRequests() {
				return chain.recordedRequests;
			},
			mineBlock: chain.mineBlock.bind(chain),
			provider: providerAsProxy,
		});
	},
});
