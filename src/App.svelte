<script>
	import { onMount } from "svelte";

	/** @type {*[]}	 */
	let messages = [];
	/** @type {FormData} */
	let formData = new FormData();
	formData.append('token', process.env.TOKEN);

	export let channelName = process.env.CHANNEL ?? "just-for-testing"; //prop for the channelName defaults to test-channel

	/**
	 * List all Channels in a JSON-Object
	 * @returns {JSON}
	 */
	async function getConversation() {
		const conv = await fetch(`https://slack.com/api/conversations.list`, {
			method: 'POST',
			body: formData
		});
		return await conv.json();
	}

	/**
	 * Finds the latest 50 messages in a given channel and returns the complete history
	 * @param conversation {json}
	 * @returns {Promise<any>}
	 */
	async function findHistory(conversation) {
		//find the id
		const channel = conversation.channels.find(channel => channel.name === channelName);
		console.log(channel)
		if (channel) {
			const channelId = channel.id;

			const channelFormData = formData;
			channelFormData.append('channel', channelId);
			channelFormData.append('limit', 50);
			const hist = await fetch(`https://slack.com/api/conversations.history`, {
				method: 'POST',
				body: channelFormData
			});
			return await hist.json();
		} else {
			throw "the channel is not available"
		}
	}

	/**
	 * gets the text from a given history json. replaces nameIds for names. sets username of the author
	 * @param history {json}
	 * @returns {*[]}
	 */
	async function getMessages(history) {
		async function replaceAsync(str, regex, asyncFn) {
			const promises = [];
			str.replace(regex, (match, ...args) => {
				const promise = asyncFn(match, ...args);
				promises.push(promise);
			});
			const data = await Promise.all(promises);
			return str.replace(regex, () => data.shift());
		}

		async function asyncReplacer(match, p1) {
			const userFormData = formData;
			userFormData.append('user', p1);
			const req = await fetch(`https://slack.com/api/users.info`, {
				method: 'POST',
				body: userFormData
			});
			const res = await req.json();
			return res.user.name;
		}
		const enriched = await Promise.all(history.messages.map(async message => {
			const userFormData = formData;
			userFormData.append('user', message.user);
			const req = await fetch(`https://slack.com/api/users.info`, {
				method: 'POST',
				body: userFormData
			});
			const res = await req.json();
			message.username = res.user.name;
			message.text = await replaceAsync(message.text, /<@(.*?)>/g, asyncReplacer);
			return message;
		}))
		return enriched.reverse();
	}

	onMount(async () => {
		const conversation = await getConversation();
		console.log(conversation)
		const history = await findHistory(conversation);
		console.log(history)
		messages = await getMessages(history);
		console.log(messages)
	});
</script>

<main>
	<!--<h1>Slack: {channelName}</h1>-->
	<ul class="messagelist">
		{#each messages as message}
			<li><b>{message.username}:</b> {message.text}</li>
		{:else}
			<li>loading...</li>
		{/each}
	</ul>
</main>

<style>
	body {
		padding: 0;
	}
	main {
		text-align: center;
		padding: 0;
		margin: 0 auto;
		max-width: 700px;
	}

	/*h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 2em;
		font-weight: 100;
	}*/

	ul{
		list-style-type: none;
		text-align: left;
		padding: 0;
	}
	li{
		margin: .8em 0;
		overflow-wrap: break-word;
		font-size: 12px;
	}
</style>