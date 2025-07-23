<script>
	import { fade } from 'svelte/transition';

	export let message = '';
	export let type = 'error';
	export let dismissible = true;
	export let show = false;

	let alertElement;

	function handleDismiss() {
		show = false;
	}

	/** @param {KeyboardEvent} event */
	function handleKeydown(event) {
		if (event.key === 'Escape') {
			handleDismiss();
		}
	}
</script>

{#if show && message}
	{#if dismissible}
		<button
			bind:this={alertElement}
			class="alert alert-{type} dismissible"
			aria-live="assertive"
			aria-label="Dismiss alert: {message}"
			transition:fade={{ duration: 200 }}
			on:click={handleDismiss}
			on:keydown={handleKeydown}
			type="button"
		>
			<div class="alert-content">
				<div class="alert-icon" aria-hidden="true">
					{#if type === 'error' || type === 'critical'}
						⚠️
					{:else if type === 'warning'}
						⚠️
					{:else if type === 'info'}
						ℹ️
					{:else}
						⚠️
					{/if}
				</div>
				<div class="alert-message">
					{message}
				</div>
				<div class="alert-dismiss" aria-hidden="true">
					×
				</div>
			</div>
		</button>
	{:else}
		<div
			bind:this={alertElement}
			class="alert alert-{type}"
			role="alert"
			aria-live="assertive"
			transition:fade={{ duration: 200 }}
		>
			<div class="alert-content">
				<div class="alert-icon" aria-hidden="true">
					{#if type === 'error' || type === 'critical'}
						⚠️
					{:else if type === 'warning'}
						⚠️
					{:else if type === 'info'}
						ℹ️
					{:else}
						⚠️
					{/if}
				</div>
				<div class="alert-message">
					{message}
				</div>
			</div>
		</div>
	{/if}
{/if}

<style>
	.alert {
		position: fixed;
		top: 1rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 1001;
		max-width: 90vw;
		width: auto;
		min-width: 300px;
		font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', 'Courier New', monospace;
		font-size: 14px;
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		border: 1px solid;
		/* Reset button styles when used as button */
		background: none;
		padding: 0;
		text-align: left;
	}

	.alert-error,
	.alert-critical {
		background-color: #fef2f2;
		color: #991b1b;
		border-color: #fca5a5;
	}

	.alert-warning {
		background-color: #fefce8;
		color: #92400e;
		border-color: #fde047;
	}

	.alert-info {
		background-color: #eff6ff;
		color: #1e40af;
		border-color: #93c5fd;
	}

	.alert-content {
		display: flex;
		align-items: flex-start;
		padding: 1rem;
		gap: 0.75rem;
	}

	.alert-icon {
		flex-shrink: 0;
		font-size: 1.25rem;
		line-height: 1;
		margin-top: 0.125rem;
	}

	.alert-message {
		flex: 1;
		font-weight: 500;
		line-height: 1.5;
		word-break: break-word;
	}

	.alert-dismiss {
		background: none;
		border: none;
		color: inherit;
		font-size: 1.5rem;
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
		opacity: 0.7;
	}

	.alert-dismiss:hover {
		opacity: 1;
		background-color: rgba(0, 0, 0, 0.1);
	}

	.alert-dismiss:focus {
		outline: 2px solid;
		outline-offset: 1px;
		opacity: 1;
	}

	.alert-error .alert-dismiss:focus,
	.alert-critical .alert-dismiss:focus {
		outline-color: #991b1b;
	}

	.alert-warning .alert-dismiss:focus {
		outline-color: #92400e;
	}

	.alert-info .alert-dismiss:focus {
		outline-color: #1e40af;
	}

	.alert.dismissible {
		cursor: pointer;
	}

	.alert.dismissible:focus {
		outline: 2px solid;
		outline-offset: 2px;
	}

	.alert-error.dismissible:focus,
	.alert-critical.dismissible:focus {
		outline-color: #991b1b;
	}

	.alert-warning.dismissible:focus {
		outline-color: #92400e;
	}

	.alert-info.dismissible:focus {
		outline-color: #1e40af;
	}

	/* Mobile adjustments */
	@media (max-width: 480px) {
		.alert {
			top: 0.75rem;
			max-width: 95vw;
			min-width: 280px;
			font-size: 13px;
		}

		.alert-content {
			padding: 0.875rem;
			gap: 0.625rem;
		}

		.alert-icon {
			font-size: 1.125rem;
		}

		.alert-dismiss {
			font-size: 1.375rem;
		}
	}

	/* Desktop positioning adjustments */
	@media (min-width: 768px) {
		.alert {
			top: 1.5rem;
			max-width: 500px;
		}
	}
</style>