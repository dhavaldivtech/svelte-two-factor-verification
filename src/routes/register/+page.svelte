<script>
	import './style.css';

	export let data;
	let email = '';
	let message = '';
	let loading = false;

	if (data?.message) {
		message = data.message;
	}

	async function handleSubmit(event) {
		loading = true;

		const formData = new FormData(event.target);
		const email = formData.get('email');

		await fetch('/register', {
			method: 'POST',
			body: formData
		});

		loading = false;
	}
</script>

<div class="centered">
	<div class="auth-container">
		<h2>Two Factor Authentication</h2>
		<form method="post" on:submit={handleSubmit}>
			<label for="email">Enter your email:</label>
			<input type="email" name="email" id="email" bind:value={email} required />
			<button type="submit" disabled={loading}>
				{#if loading}
					<span>Loading...</span>
				{:else}
					Register
				{/if}
			</button>
		</form>
		{#if message}
			<p class="error">{message}</p>
		{/if}
	</div>
</div>
