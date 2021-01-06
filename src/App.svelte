<script>
	export let name;

	async function findConversation(name) {
		let formData = new FormData();
		formData.append('token', 'xoxb-1606628172838-1613641736723-3IapXu8RpJSbvQApxS5k3G3X')
		try {
			const res = await fetch(`https://slack.com/api/conversations.list`, {
				method: 'POST',
				body: formData
			});
			const conversation = await res.json();
			console.log(conversation)

		}
		catch (error) {
			console.error(error);
		}
	}
</script>

<main>
	<h1>Hello {name}!</h1>
	<button on:click={() => findConversation("test-channel")}>find conversation</button>
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