<script>
	import { onMount, onDestroy } from 'svelte';
	import '../register/style.css';
	import { goto } from '$app/navigation';

	export let data;

	let otp = ['', '', '', '', '', ''];
	let message = '';
	const email = data?.email;
	let timer = 300;
	let interval;
	let otpExpired = false;
	let loading = false;

	// Start the countdown timer
	const startTimer = () => {
		otpExpired = false;
		message = '';
		timer = 300;
		clearInterval(interval);
		interval = setInterval(() => {
			if (timer > 0) {
				timer--;
			} else {
				clearInterval(interval);
				otpExpired = true;
				message = 'OTP has expired. Please request a new one.';
			}
		}, 1000);
	};

	onMount(() => {
		history.replaceState({}, '', '/otp');
		startTimer();
	});

	// Clear the timer on component destruction
	onDestroy(() => {
		clearInterval(interval);
	});

	// Format the timer to display in MM:SS format
	const formatTime = (time) => {
		const minutes = Math.floor(time / 60);
		const seconds = time % 60;
		return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	};

	if (data?.message) {
		message = data.message;
	}

	// Resend OTP handler
	const resendOTP = async () => {
		loading = true;
		try {
			const response = await fetch('/api/resend-otp', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email })
			});

			if (!response.ok) {
				const result = await response.json();
				message = result.message || 'Failed to resend OTP.';
				return;
			}

			message = 'A new OTP has been sent to your email.';
			startTimer(); // Restart the countdown timer
		} catch (error) {
			message = 'An error occurred. Please try again.';
		} finally {
			loading = false;
		}
	};

	// Handle OTP verification
	const verifyOTP = async (event) => {
		event.preventDefault();
		if (otpExpired) {
			message = 'OTP has expired. Please request a new one.';
			return;
		}

		const otpString = otp.join('');
		try {
			const response = await fetch('/api/verify-otp', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, otp: otpString })
			});

			const result = await response.json();
			if (result.success) {
				message = 'OTP verified successfully!';
				goto(`/register-success?email=${encodeURIComponent(email)}`);
			} else {
				message = result.message || 'Invalid OTP. Please try again.';
			}
		} catch (error) {
			message = 'An error occurred while verifying OTP. Please try again.';
		}
	};

	onMount(() => {
		if (!email) {
			goto('/register'); // Redirect if no email is provided
		}
	});

	const handleBackspace = (index, event) => {
		if (event.key === 'Backspace' && otp[index] === '') {
			if (index > 0) {
				document.getElementById(`otp-${index - 1}`).focus(); // Focus previous input
			}
		}
	};
</script>

<div class="centered">
	<div class="auth-container">
		<h2>Two Factor Authentication</h2>
		<div class="otp-section">
			<p>Email: <strong>{email}</strong></p>
			<p>OTP will expire in: <strong>{formatTime(timer)}</strong></p>
			<label for="otp">Enter OTP:</label>
			<form on:submit={verifyOTP}>
				<div class="otp-boxes">
					<input type="hidden" name="email" value={email} />
					{#each otp as digit, index}
						<input
							type="text"
							maxlength="1"
							bind:value={otp[index]}
							on:input={() => {
								if (otp[index].length > 1) otp[index] = otp[index].slice(0, 1);
								if (index < 5 && otp[index]) {
									document.getElementById(`otp-${index + 1}`).focus();
								}
							}}
							on:keydown={(event) => handleBackspace(index, event)}
							id="otp-{index}"
							class="otp-input"
							required
						/>
					{/each}
				</div>

				<div class="btn-verify">
					<button type="submit" class="verify-btn">Verify OTP</button>
					{#if otpExpired}
						<button class="resend-btn" on:click={resendOTP} disabled={loading}>Resend OTP</button>
					{/if}
					<p>
						<a href="/register" class="register-link">← Register</a>
					</p>
				</div>
			</form>
			{#if message}<p class="error">{message}</p>{/if}
		</div>
	</div>
</div>
