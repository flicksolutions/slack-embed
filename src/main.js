import App from './App.svelte';

const app = new App({
	target: document.body,
	props: {
		channelName: 'just-for-testing'
	}
});

export default app;