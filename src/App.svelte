<script>
	import { onMount } from "svelte";

	let messages = [];

	export let channelName = "test-channel";

	async function findConversation(name) {
		let formData = new FormData();
		formData.append('token', 'xoxb-1606628172838-1613641736723-3THHpQQ3RfObUf1egQMAKPNr');
		try {
			const conv = await fetch(`https://slack.com/api/conversations.list`, {
				method: 'POST',
				body: formData
			});
			const conversation = await conv.json();
			console.log(conversation)
			//find the id
			const channelId = await conversation.channels.find(channel => channel.name === name).id;
			//console.log(channelId)
			const channelFormData = formData;
			channelFormData.append('channel', channelId);
			channelFormData.append('limit', 50);
			const hist = await fetch(`https://slack.com/api/conversations.history`, {
				method: 'POST',
				body: channelFormData
			});
			const history = await hist.json();

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
				console.log(`returning: ${res.user.name}`)
				return res.user.name;
			}

			//find usernames
			messages = (await Promise.all(history.messages.map(async message => {
				const userFormData = formData;
				userFormData.append('user', message.user);
				const req = await fetch(`https://slack.com/api/users.info`, {
					method: 'POST',
					body: userFormData
				});
				const res = await req.json();
				message.username = res.user.name;
				//message.text = await message.text.replace(/<@(.*?)>/g, asyncReplacer);
				message.text = await replaceAsync(message.text, /<@(.*?)>/g, asyncReplacer);
				return message;
			}))).reverse();

			console.log(await messages)

		}
		catch (error) {
			console.error(error);
		}
	}

	onMount(async () => {
		await findConversation(channelName);
	});
</script>

<main>
	<h1>Slack: {channelName}</h1>
	<ul class="messagelist">
		{#each messages as message}
			<li><b>{message.username}:</b> {message.text}</li>
		{:else}
			<li>loading...</li>
		{/each}
	</ul>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>