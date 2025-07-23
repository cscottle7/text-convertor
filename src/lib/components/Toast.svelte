<script>
	import { onMount } from 'svelte';
	import { fly, fade } from 'svelte/transition';

	export let message = '';
	export let type = 'success';
	export let duration = 3000;
	export let show = false;

	let toastElement;

	$: if (show && message) {
		setTimeout(() => {
			show = false;
		}, duration);
	}

	function handleDismiss() {
		show = false;
	}
</script>

{#if show}
	<div
		bind:this={toastElement}
		class="toast toast-{type}"
		role="alert"
		aria-live="polite"
		in:fly={{ y: -50, duration: 300 }}
		out:fade={{ duration: 200 }}
		on:click={handleDismiss}
		on:keydown={(e) => e.key === 'Escape' && handleDismiss()}
	>
		<div class="toast-content">
			<span class="toast-message">{message}</span>
			<button
				class="toast-dismiss"
				on:click|stopPropagation={handleDismiss}
				aria-label="Dismiss notification"
				type="button"
			>
				×
			</button>
		</div>
	</div>
{/if}

<style>
	.toast {
		position: fixed;
		top: 1rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 1000;
		max-width: 90vw;
		width: auto;
		min-width: 200px;
		font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', 'Courier New', monospace;
		font-size: 14px;
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		cursor: pointer;
		user-select: none;
	}

	.toast-success {
		background-color: #28a745;
		color: white;
		border: 1px solid #1e7e34;
	}

	.toast-error {
		background-color: #dc3545;
		color: white;
		border: 1px solid #c82333;
	}

	.toast-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		gap: 0.75rem;
	}

	.toast-message {
		flex: 1;
		font-weight: 500;
		line-height: 1.4;
	}

	.toast-dismiss {
		background: none;
		border: none;
		color: inherit;
		font-size: 1.25rem;
		font-weight: bold;
		line-height: 1;
		cursor: pointer;
		padding: 0;
		width: 1.5rem;
		height: 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		transition: background-color 0.2s ease;
		flex-shrink: 0;
	}

	.toast-dismiss:hover {
		background-color: rgba(255, 255, 255, 0.2);
	}

	.toast-dismiss:focus {
		outline: 2px solid rgba(255, 255, 255, 0.5);
		outline-offset: 1px;
	}

	/* Mobile adjustments */
	@media (max-width: 480px) {
		.toast {
			top: 0.75rem;
			max-width: 95vw;
			font-size: 13px;
		}

		.toast-content {
			padding: 0.625rem 0.875rem;
		}
	}

	/* Desktop positioning adjustments */
	@media (min-width: 768px) {
		.toast {
			top: 1.5rem;
			max-width: 400px;
		}
	}
</style>