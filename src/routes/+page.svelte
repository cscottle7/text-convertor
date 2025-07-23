<script>
	import TextConverter from '$lib/components/TextConverter.svelte';
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

<header class="header">
	<div class="header-content">
		<h1 class="title">Text Converter</h1>
	</div>
</header>

<main class="main">
	<div class="subtitle-section">
		<p class="subtitle">Convert text between multiple formats instantly</p>
	</div>

	<section class="converter-section">
		<div class="converter-container">
			<TextConverter />
		</div>
	</section>

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

	/* Full-width Header */
	.header {
		width: 100%;
		background: #007bff;
		padding: 0.5rem 0;
		margin: 0;
		box-shadow: 0 2px 8px rgba(0, 123, 255, 0.2);
	}

	.header-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1rem;
		text-align: center;
	}

	.title {
		font-size: 1.25rem;
		font-weight: 700;
		margin: 0;
		color: white;
		letter-spacing: -0.02em;
		font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', 'Courier New', monospace;
	}

	/* Mobile-First Layout Structure */
	.main {
		min-height: calc(100vh - 120px);
		display: flex;
		flex-direction: column;
		width: 100%;
		max-width: 100%;
		margin: 0;
		padding: 1rem;
		background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
	}

	.subtitle-section {
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		margin-bottom: 0.5rem;
		padding: 0.25rem 0.25rem 1rem 0.25rem;
		min-height: 2rem;
	}

	.subtitle {
		font-size: 0.875rem;
		color: #4a5568;
		margin: 0;
		font-weight: 400;
		line-height: 1.2;
		max-width: 600px;
		margin: 0 auto;
		font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', 'Courier New', monospace;
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


	/* Responsive Breakpoints */
	
	/* Small Mobile Landscape / Large Mobile Portrait */
	@media (min-width: 480px) {
		.main {
			padding: 1.25rem;
		}
		
		.header {
			padding: 0.75rem 0;
		}
		
		.header-content {
			padding: 0 1.5rem;
		}
		
		.title {
			font-size: 1.5rem;
		}
		
		.subtitle {
			font-size: 1rem;
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
			padding: 0.75rem 0;
		}

		.header-content {
			padding: 0 2rem;
		}

		.title {
			font-size: 1.75rem;
		}

		.subtitle {
			font-size: 1.125rem;
		}
		
		/* Desktop Two-Column Layout */
		.converter-section {
			margin-bottom: 2rem;
		}

		.converter-container {
			padding: 2rem;
			/* This will be overridden by the TextConverter component for two-column layout */
		}
		
	}

	/* Desktop / Large Tablet Landscape */
	@media (min-width: 1024px) {
		.main {
			padding: 2.5rem;
		}
		
		.header {
			padding: 0.75rem 0;
		}
		
		.header-content {
			padding: 0 2.5rem;
		}
		
		.title {
			font-size: 2rem;
		}
		
		.subtitle {
			font-size: 1.25rem;
		}
	}

	/* Large Desktop */
	@media (min-width: 1200px) {
		.main {
			padding: 3rem;
		}
	}
</style>