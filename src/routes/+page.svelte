<script>
	import { TextConverter } from '$lib';
</script>

<svelte:head>
	<title>Text Convertor | Clean Up Your Text Instantly</title>
	<meta name="description" content="Convert Markdown text to clean, plain text instantly. Perfect for pasting into Google Docs, CMS platforms, or any application without formatting issues. Free, fast, and secure - all processing happens in your browser." />
	<meta name="keywords" content="text converter, markdown to text, text formatting, plain text, markdown converter, text cleanup" />
	<meta name="author" content="Text Convertor" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	
	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Text Convertor | Clean Up Your Text Instantly" />
	<meta property="og:description" content="Convert Markdown text to clean, plain text instantly. Perfect for pasting into Google Docs, CMS platforms, or any application without formatting issues." />
	<meta property="og:url" content="https://textconvertor.app" />
	
	<!-- Twitter -->
	<meta property="twitter:card" content="summary" />
	<meta property="twitter:title" content="Text Convertor | Clean Up Your Text Instantly" />
	<meta property="twitter:description" content="Convert Markdown text to clean, plain text instantly. Perfect for pasting into Google Docs, CMS platforms, or any application without formatting issues." />
	
	<!-- Additional SEO -->
	<meta name="robots" content="index, follow" />
	<meta name="language" content="en-GB" />
	<link rel="canonical" href="https://textconvertor.app" />
</svelte:head>

<main class="main">
	<header class="header">
		<h1 class="title">Text Convertor</h1>
		<p class="subtitle">Clean Up Your Text Instantly</p>
	</header>

	<section class="converter-section">
		<div class="converter-container">
			<TextConverter />
		</div>
	</section>

	<footer class="footer">
		<p class="footer-text">
			Built with <a href="https://kit.svelte.dev" class="footer-link">SvelteKit</a>
		</p>
	</footer>
</main>

<style>
	/* Global Reset & Base Styles */
	:global(*, *::before, *::after) {
		box-sizing: border-box;
	}

	:global(body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
		line-height: 1.6;
		color: #333;
		background-color: #fafafa;
	}

	/* Mobile-First Layout Structure */
	.main {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		width: 100%;
		max-width: 100%;
		margin: 0;
		padding: 1rem;
		background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
	}

	.header {
		text-align: center;
		margin-bottom: 1.5rem;
		padding: 0.5rem 0;
	}

	.title {
		font-size: 1.75rem;
		font-weight: 700;
		margin: 0 0 0.5rem 0;
		color: #1a1a1a;
		letter-spacing: -0.025em;
	}

	.subtitle {
		font-size: 1rem;
		color: #666;
		margin: 0;
		font-weight: 400;
	}

	/* Mobile-First Converter Section - Single Column */
	.converter-section {
		flex: 1;
		display: flex;
		flex-direction: column;
		width: 100%;
		margin-bottom: 1.5rem;
	}

	.converter-container {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 100%;
		background: white;
		border-radius: 12px;
		padding: 1rem;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
		border: 1px solid #e1e5e9;
	}

	.footer {
		margin-top: auto;
		padding: 1rem 0 0.5rem 0;
		border-top: 1px solid rgba(255, 255, 255, 0.2);
		text-align: center;
		background: transparent;
	}

	.footer-text {
		font-size: 0.8rem;
		color: #888;
		margin: 0;
		font-weight: 400;
	}

	.footer-link {
		color: #0066cc;
		text-decoration: none;
		transition: color 0.2s ease;
	}

	.footer-link:hover {
		color: #004499;
		text-decoration: underline;
	}

	/* Responsive Breakpoints */
	
	/* Small Mobile Landscape / Large Mobile Portrait */
	@media (min-width: 480px) {
		.main {
			padding: 1.25rem;
		}
		
		.title {
			font-size: 2rem;
		}
		
		.subtitle {
			font-size: 1.125rem;
		}
		
		.converter-container {
			padding: 1.5rem;
		}
	}

	/* Tablet Portrait - Two Column Layout Begins */
	@media (min-width: 768px) {
		.main {
			max-width: 1200px;
			margin: 0 auto;
			padding: 2rem;
		}

		.header {
			margin-bottom: 2rem;
			padding: 1rem 0;
		}

		.title {
			font-size: 2.5rem;
		}

		.subtitle {
			font-size: 1.25rem;
		}
		
		/* Desktop Two-Column Layout */
		.converter-section {
			margin-bottom: 2rem;
		}

		.converter-container {
			padding: 2rem;
			/* This will be overridden by the TextConverter component for two-column layout */
		}
		
		.footer {
			padding: 1.5rem 0 1rem 0;
		}
		
		.footer-text {
			font-size: 0.875rem;
		}
	}

	/* Desktop / Large Tablet Landscape */
	@media (min-width: 1024px) {
		.main {
			padding: 2.5rem;
		}
		
		.title {
			font-size: 3rem;
		}
		
		.subtitle {
			font-size: 1.375rem;
		}
	}

	/* Large Desktop */
	@media (min-width: 1200px) {
		.main {
			padding: 3rem;
		}
	}
</style>