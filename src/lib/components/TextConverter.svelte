<script>
	// Component: TextConverter
	// Purpose: Convert Markdown text to clean plain text with copy functionality
	
	// Import dependencies
	import { marked } from 'marked';
	
	// Reactive state variables
	let inputText = '';
	let outputText = '';
	let copied = false;
	let error = '';
	let isProcessing = false;
	let conversionMode = 'markdown-to-text'; // 'markdown-to-text' or 'text-to-markdown'
	let inputRendered = '';
	let outputRendered = '';
	let isPasting = false; // Flag to prevent double processing during paste
	
	// Character limit constant
	const CHARACTER_LIMIT = 10000;
	
	// Reactive statements for automatic conversion and validation
	$: isInputValid = inputText.length <= CHARACTER_LIMIT;
	$: hasInput = inputText.trim().length > 0;
	$: hasOutput = outputText.trim().length > 0;
	$: isCharacterLimitExceeded = inputText.length > CHARACTER_LIMIT;
	
	// Auto-clear copied status after 3 seconds
	$: if (copied) {
		setTimeout(() => {
			copied = false;
		}, 3000);
	}
	
	// Auto-clear error messages after 5 seconds
	$: if (error) {
		setTimeout(() => {
			error = '';
		}, 5000);
	}

	// Simple approach: convert markdown to HTML first, then strip HTML tags
	async function markdownToPlainText(markdown) {
		try {
			// Handle edge cases for incomplete markdown
			const trimmedMarkdown = markdown.trim();
			
			// If it's just markdown syntax without content, return the original text
			if (trimmedMarkdown === '#' || trimmedMarkdown === '##' || trimmedMarkdown === '###' ||
				trimmedMarkdown === '**' || trimmedMarkdown === '*' || trimmedMarkdown === '>' ||
				trimmedMarkdown === '-' || trimmedMarkdown === '+' || trimmedMarkdown === '1.') {
				return trimmedMarkdown;
			}
			
			// First convert markdown to HTML using default marked
			console.log('Converting markdown:', markdown);
			const html = await marked(markdown);
			console.log('Got HTML:', html);
			
			// Strip HTML tags and convert to plain text
			const tempDiv = document.createElement('div');
			tempDiv.innerHTML = html;
			
			// Convert list items to plain text with dashes
			const listItems = tempDiv.querySelectorAll('li');
			listItems.forEach(li => {
				const originalText = li.textContent;
				li.textContent = '- ' + originalText;
			});
			
			// Get plain text and clean it up
			let plainText = tempDiv.textContent || tempDiv.innerText || '';
			console.log('Plain text before cleanup:', plainText);
			
			// If the plain text is empty but we had input, return the original markdown
			if (!plainText.trim() && trimmedMarkdown) {
				return trimmedMarkdown;
			}
			
			// Clean up extra whitespace and normalize line breaks
			plainText = plainText
				.replace(/\n{3,}/g, '\n\n')  // Replace multiple line breaks with double
				.replace(/^\s+|\s+$/g, '')   // Trim whitespace from start/end
				.replace(/\s*\n\s*/g, '\n')  // Normalize line break spacing
				.replace(/\n\n+/g, '\n\n');  // Ensure max two consecutive line breaks
			
			console.log('Final plain text:', plainText);
			return plainText || trimmedMarkdown; // Fallback to original if empty
		} catch (error) {
			console.error('Error in markdownToPlainText:', error);
			// If there's an error, just return the original text
			return markdown;
		}
	}

	// Convert plain text to markdown with intelligent formatting
	function textToMarkdown(text) {
		try {
			const lines = text.split('\n');
			const result = [];
			
			for (let i = 0; i < lines.length; i++) {
				const line = lines[i].trim();
				
				// Skip empty lines
				if (!line) {
					result.push('');
					continue;
				}
				
				// Detect list items first (lines starting with dash, asterisk, or numbers)
				if (/^[\-\*\+]\s/.test(line)) {
					// Convert dashes to asterisks for proper markdown
					const markdownLine = line.replace(/^[\-\+]\s/, '* ');
					result.push(markdownLine);
					continue;
				}
				
				if (/^\d+\.\s/.test(line)) {
					result.push(line);
					continue;
				}
				
				// Detect headers - only for standalone lines that look like titles
				if (line.length < 60 && 
					i < lines.length - 1 && 
					!line.includes(',') && 
					!line.includes(';') && 
					!/[.!:]$/.test(line) && 
					lines[i + 1].trim().length > 0) {
					// Check if next line is not a list item
					const nextLine = lines[i + 1].trim();
					if (!(/^[\-\*\+]\s/.test(nextLine) || /^\d+\.\s/.test(nextLine))) {
						result.push(`## ${line}`);
						continue;
					}
				}
				
				// Process regular text for emphasis
				let processedLine = line;
				
				// Convert quoted text to italics
				processedLine = processedLine.replace(/"([^"]+)"/g, '*$1*');
				
				// Convert words surrounded by asterisks to emphasis
				processedLine = processedLine.replace(/\*([^*]+)\*/g, '*$1*');
				
				result.push(processedLine);
			}
			
			return result.join('\n');
		} catch (error) {
			console.error('Error in textToMarkdown:', error);
			return text;
		}
	}

	// Toggle conversion mode
	function toggleConversionMode() {
		conversionMode = conversionMode === 'markdown-to-text' ? 'text-to-markdown' : 'markdown-to-text';
		// Clear output when switching modes
		outputText = '';
		// Re-trigger conversion if there's input
		if (inputText.trim() && isInputValid) {
			performConversion(inputText);
		}
	}

	// Unified conversion function
	async function performConversion(text) {
		try {
			isProcessing = true;
			error = '';
			
			if (conversionMode === 'markdown-to-text') {
				const result = await markdownToPlainText(text);
				outputText = result;
			} else {
				const result = textToMarkdown(text);
				outputText = result;
			}
			
			isProcessing = false;
		} catch (err) {
			console.error('Error in performConversion:', err);
			error = 'Error converting text. Please check your input.';
			outputText = '';
			isProcessing = false;
		}
	}

	// Reactive conversion trigger
	$: {
		if (inputText.trim() && isInputValid) {
			performConversion(inputText);
		} else if (!inputText.trim()) {
			outputText = '';
			error = '';
			isProcessing = false;
		} else if (isCharacterLimitExceeded) {
			outputText = '';
			error = '';
			isProcessing = false;
		}
	}

	// Copy to clipboard functionality using native Clipboard API
	async function handleCopyText() {
		if (!outputText.trim()) {
			error = 'No text to copy';
			return;
		}

		try {
			// For text-to-markdown mode, copy the raw markdown syntax, not the rendered HTML
			const textToCopy = outputText;
			
			// Use modern Clipboard API if available
			if (navigator.clipboard && window.isSecureContext) {
				await navigator.clipboard.writeText(textToCopy);
				copied = true;
				error = '';
			} else {
				// Fallback for older browsers or non-HTTPS contexts
				const textArea = document.createElement('textarea');
				textArea.value = textToCopy;
				textArea.style.position = 'fixed';
				textArea.style.left = '-999999px';
				textArea.style.top = '-999999px';
				document.body.appendChild(textArea);
				textArea.focus();
				textArea.select();
				
				const successful = document.execCommand('copy');
				document.body.removeChild(textArea);
				
				if (successful) {
					copied = true;
					error = '';
				} else {
					throw new Error('Copy command failed');
				}
			}
		} catch (err) {
			error = 'Failed to copy text. Please try selecting and copying manually.';
			copied = false;
		}
	}

	// Clear functionality to reset both text areas and all state
	function handleClear() {
		inputText = '';
		outputText = '';
		inputRendered = '';
		outputRendered = '';
		copied = false;
		error = '';
		isProcessing = false;
	}

	// Render markdown to HTML for display
	async function renderMarkdown(text) {
		try {
			if (!text.trim()) return '';
			return await marked(text);
		} catch (error) {
			console.error('Error rendering markdown:', error);
			return text;
		}
	}


	// Convert HTML to Markdown
	function htmlToMarkdown(html) {
		console.log('🔄 === HTML TO MARKDOWN CONVERSION START ===');
		console.log('📥 Original HTML:', html);
		
		// Create a temporary div to parse the HTML
		const tempDiv = document.createElement('div');
		tempDiv.innerHTML = html;
		
		console.log('🔍 Analyzing HTML structure:', {
			childrenCount: tempDiv.children.length,
			childTags: Array.from(tempDiv.children).map(child => child.tagName.toLowerCase()),
			textContent: tempDiv.textContent,
			fullStructure: tempDiv.innerHTML
		});
		
		// Check if we have a single wrapper element that contains everything
		if (tempDiv.children.length === 1) {
			const wrapper = tempDiv.children[0];
			const wrapperTag = wrapper.tagName.toLowerCase();
			
			console.log('🎁 Single wrapper detected:', {
				tag: wrapperTag,
				innerHTML: wrapper.innerHTML,
				shouldUnwrap: ['strong', 'b', 'em', 'i'].includes(wrapperTag)
			});
			
			// If the entire content is wrapped in a formatting tag, unwrap it
			if (wrapperTag === 'strong' || wrapperTag === 'b' || wrapperTag === 'em' || wrapperTag === 'i') {
				console.log('🔓 Unwrapping outer formatting tag:', wrapperTag);
				html = wrapper.innerHTML;
				console.log('🔄 HTML after unwrapping:', html);
			}
		}
		
		console.log('📋 Processing final HTML:', html);
		
		// Create a new temporary div to parse the cleaned HTML
		const parseDiv = document.createElement('div');
		parseDiv.innerHTML = html;
		
		// Convert HTML elements to markdown
		const elements = parseDiv.childNodes;
		let markdown = '';
		
		function processNode(node) {
			if (node.nodeType === Node.TEXT_NODE) {
				return node.textContent;
			}
			
			if (node.nodeType === Node.ELEMENT_NODE) {
				const tagName = node.tagName.toLowerCase();
				const content = Array.from(node.childNodes).map(processNode).join('');
				
				// Skip processing if this is a wrapper element with block-level children
				if ((tagName === 'strong' || tagName === 'b') && content.includes('\n')) {
					console.log('🔄 Bold wrapper contains multiple lines - processing children instead of wrapper');
					// Don't apply bold to the wrapper, but process its children normally
					return content;
				}
				
				switch (tagName) {
					case 'h1':
						return `# ${content.trim()}\n\n`;
					case 'h2':
						return `## ${content.trim()}\n\n`;
					case 'h3':
						return `### ${content.trim()}\n\n`;
					case 'h4':
						return `#### ${content.trim()}\n\n`;
					case 'h5':
						return `##### ${content.trim()}\n\n`;
					case 'h6':
						return `###### ${content.trim()}\n\n`;
					case 'p':
						return content.trim() ? `${content.trim()}\n\n` : '\n';
					case 'strong':
					case 'b':
						// Only apply bold to inline content, not block content
						const trimmed = content.trim();
						const nodeInfo = {
							tagName,
							content: content,
							trimmed: trimmed,
							trimmedLength: trimmed.length,
							hasNewlines: trimmed.includes('\n'),
							hasHeaders: trimmed.includes('#'),
							outerHTML: node.outerHTML || 'N/A',
							parentTag: node.parentElement?.tagName || 'NONE'
						};
						
						console.log('🟡 BOLD ELEMENT DETECTED:', nodeInfo);
						
						if (!trimmed) {
							console.log('❌ Skipping bold - empty content');
							return '';
						}
						
						// Skip if this contains headers (like # Heading)
						if (trimmed.includes('#')) {
							console.log('❌ Skipping bold - contains headers (#)');
							return trimmed;
						}
						
						// Skip if this contains multiple lines with content
						const contentLines = trimmed.split('\n').filter(line => line.trim());
						if (trimmed.includes('\n') && contentLines.length > 1) {
							console.log('❌ Skipping bold - contains multiple content lines:', contentLines.length);
							return trimmed;
						}
						
						// Apply bold formatting
						console.log('✅ APPLYING BOLD FORMATTING to:', `"${trimmed}"`);
						const result = `**${trimmed}**`;
						console.log('✅ Bold result:', `"${result}"`);
						return result;
					case 'em':
					case 'i':
						const italicTrimmed = content.trim();
						if (!italicTrimmed || italicTrimmed.includes('\n')) {
							return italicTrimmed;
						}
						return `*${italicTrimmed}*`;
					case 'br':
						return '\n';
					case 'ul':
						return `${content}`;
					case 'ol':
						return `${content}`;
					case 'li':
						const parent = node.parentElement;
						const trimmedContent = content.trim();
						if (!trimmedContent) return '';
						if (parent && parent.tagName.toLowerCase() === 'ol') {
							return `1. ${trimmedContent}\n`;
						} else {
							return `* ${trimmedContent}\n`;
						}
					case 'blockquote':
						return content.trim() ? `> ${content.trim()}\n\n` : '';
					case 'code':
						return content.trim() ? `\`${content.trim()}\`` : '';
					case 'pre':
						return content.trim() ? `\`\`\`\n${content.trim()}\n\`\`\`\n\n` : '';
					case 'span':
						// Check if span has bold font-weight
						const style = node.getAttribute('style') || '';
						const isBold = style.includes('font-weight:700') || style.includes('font-weight:bold') || style.includes('font-weight: 700') || style.includes('font-weight: bold');
						
						if (isBold) {
							const spanTrimmed = content.trim();
							if (spanTrimmed && !spanTrimmed.includes('\n') && !spanTrimmed.includes('#')) {
								console.log('✅ APPLYING BOLD FORMATTING to span:', `"${spanTrimmed}"`);
								return `**${spanTrimmed}**`;
							}
						}
						
						// If not bold or doesn't meet criteria, just return content
						return content;
					case 'a':
						const href = node.getAttribute('href');
						const linkContent = content.trim();
						if (!linkContent) return '';
						return href ? `[${linkContent}](${href})` : linkContent;
					case 'div':
						return content.trim() ? `${content.trim()}\n` : '';
					default:
						return content;
				}
			}
			
			return '';
		}
		
		// Process all nodes
		Array.from(elements).forEach(node => {
			markdown += processNode(node);
		});
		
		// Clean up extra whitespace
		return markdown.trim().replace(/\n{3,}/g, '\n\n');
	}

	// Handle rich text input changes
	function handleRichTextInput(event) {
		const element = event.target;
		const plainText = element.innerText || element.textContent || '';
		const html = element.innerHTML;
		
		console.log('📝 Rich text input changed:', {
			plainText: plainText,
			htmlLength: html.length,
			hasFormatting: html !== plainText && html.includes('<'),
			isPasting: isPasting
		});
		
		if (isPasting) {
			console.log('🚫 Skipping input handler - paste in progress');
			return; // Skip during paste to prevent double processing
		}
		
		// For typed content (no formatting), just use plain text
		// For pasted content (with formatting), convert HTML to markdown
		if (html && html !== plainText && html.includes('<')) {
			// This has HTML formatting, convert to markdown
			console.log('🔄 Converting rich input to markdown...');
			const markdown = htmlToMarkdown(html);
			console.log('✅ Rich input converted to markdown:', markdown);
			inputText = markdown;
		} else {
			// Plain text input, use as-is
			console.log('📄 Using plain text input:', plainText);
			inputText = plainText;
		}
	}

	// Handle rich paste events
	function handleRichPaste(event) {
		console.log('🎯 === PASTE EVENT START ===');
		event.preventDefault();
		isPasting = true; // Set flag to prevent double processing
		
		const clipboardData = event.clipboardData || window.clipboardData;
		const html = clipboardData.getData('text/html');
		const plainText = clipboardData.getData('text/plain');
		
		console.log('📋 Raw clipboard data:', {
			htmlLength: html?.length || 0,
			plainTextLength: plainText?.length || 0,
			hasHTML: !!(html && html.trim()),
			htmlPreview: html?.substring(0, 200) + (html?.length > 200 ? '...' : '')
		});
		
		const element = event.target;
		
		if (html && html.trim()) {
			// We have rich HTML content
			console.log('🎨 Setting element HTML...');
			element.innerHTML = html;
			console.log('✅ Element HTML set. Current innerHTML length:', element.innerHTML.length);
			
			// Convert to markdown for the conversion
			console.log('🔄 Converting HTML to markdown...');
			const markdown = htmlToMarkdown(html);
			console.log('📝 Final markdown result:', markdown);
			
			// Set inputText to markdown for conversion processing
			inputText = markdown;
			console.log('✅ InputText set to markdown');
			
		} else if (plainText) {
			// Fallback to plain text
			console.log('📄 Using plain text fallback');
			element.textContent = plainText;
			inputText = plainText;
		}
		
		// Reset paste flag after a short delay
		setTimeout(() => {
			isPasting = false;
			console.log('🔓 Paste flag reset');
			
			// Ensure the visual content is still there
			if (html && html.trim() && element.innerHTML !== html) {
				console.log('🔧 Restoring visual content...');
				element.innerHTML = html;
			}
		}, 50); // Shorter delay
		
		console.log('🎯 === PASTE EVENT END ===');
	}

	// Reactive statements for rendering
	$: if (conversionMode === 'markdown-to-text' && inputText) {
		console.log('Rendering input markdown:', inputText);
		renderMarkdown(inputText).then(html => {
			console.log('Input rendered HTML:', html);
			inputRendered = html;
		});
	} else if (conversionMode === 'markdown-to-text' && !inputText) {
		inputRendered = '';
	}
</script>

<div class="text-converter">
	<!-- Conversion Mode Toggle -->
	<div class="mode-toggle-section">
		<div class="mode-toggle-container">
			<span class="mode-label" class:active={conversionMode === 'markdown-to-text'}>
				Markdown → Text
			</span>
			<button
				type="button"
				class="mode-toggle"
				class:text-to-markdown={conversionMode === 'text-to-markdown'}
				on:click={toggleConversionMode}
				aria-label="Toggle conversion mode between Markdown to Text and Text to Markdown"
			>
				<span class="toggle-slider"></span>
			</button>
			<span class="mode-label" class:active={conversionMode === 'text-to-markdown'}>
				Text → Markdown
			</span>
		</div>
	</div>

	<!-- Markdown Section (Always Left) -->
	<div class="markdown-section">
		<label for="markdown-textarea" class="section-label">
			Markdown
			{#if conversionMode === 'text-to-markdown' && hasOutput}
				<span class="output-count">{outputText.length} characters</span>
			{:else if conversionMode === 'markdown-to-text' && hasInput}
				<span class="input-count">{inputText.length} characters</span>
			{/if}
		</label>
		{#if conversionMode === 'markdown-to-text'}
			<!-- Input: Markdown syntax -->
			<textarea
				id="markdown-textarea"
				class="textarea markdown-textarea"
				class:invalid={isCharacterLimitExceeded}
				placeholder="Paste your Markdown text here...

Try pasting some Markdown content like:
# Heading
**Bold text**
- List item
> Quote"
				bind:value={inputText}
				aria-describedby="character-count"
				aria-invalid={isCharacterLimitExceeded}
				spellcheck="true"
				autocomplete="off"
				data-autocorrect="on"
				autocapitalize="sentences"
				rows="8"
			></textarea>
		{:else}
			<!-- Output: Markdown syntax -->
			<textarea
				id="markdown-textarea"
				class="textarea markdown-textarea"
				class:has-content={hasOutput}
				placeholder="Converted markdown will appear here automatically..."
				bind:value={outputText}
				readonly
				tabindex="0"
				aria-label="Converted markdown output"
				rows="8"
			></textarea>
		{/if}
		<div id="character-count" class="character-count" class:warning={isCharacterLimitExceeded}>
			{conversionMode === 'markdown-to-text' ? inputText.length : outputText.length} / {CHARACTER_LIMIT} characters
			{#if isCharacterLimitExceeded}
				<span class="limit-warning">Character limit exceeded!</span>
			{/if}
		</div>
	</div>

	<!-- Text Section (Always Right) -->
	<div class="text-section">
		<label for="text-area" class="section-label">
			Plain Text
			{#if conversionMode === 'markdown-to-text' && hasOutput}
				<span class="output-count">{outputText.length} characters</span>
			{:else if conversionMode === 'text-to-markdown' && hasInput}
				<span class="input-count">{inputText.length} characters</span>
			{/if}
		</label>
		{#if conversionMode === 'text-to-markdown'}
			<!-- Input: Rich text that preserves formatting -->
			<div class="rich-text-container">
				<div
					id="rich-text-input"
					class="rich-text-input"
					class:invalid={isCharacterLimitExceeded}
					contenteditable="true"
					on:input={handleRichTextInput}
					on:paste={handleRichPaste}
					data-placeholder="Type or paste your text here - formatting will be preserved and converted to markdown!"
					role="textbox"
					aria-multiline="true"
					aria-describedby="text-character-count"
					aria-invalid={isCharacterLimitExceeded}
				></div>
			</div>
		{:else}
			<!-- Output: Rendered text with markdown styling -->
			<div
				id="text-display"
				class="markdown-display text-display"
				class:has-content={hasOutput}
				class:empty={!outputText.trim()}
				data-placeholder="Converted text will appear here automatically..."
				aria-label="Converted plain text output"
			>{@html inputRendered}</div>
		{/if}
		<div id="text-character-count" class="character-count">
			{conversionMode === 'text-to-markdown' ? inputText.length : outputText.length} / {CHARACTER_LIMIT} characters
		</div>
	</div>

	<!-- Actions Section -->
	<div class="actions-section">
		<button 
			type="button" 
			class="btn btn-primary" 
			class:loading={isProcessing}
			disabled={!hasOutput || isProcessing}
			on:click={handleCopyText}
			aria-label="Copy converted text to clipboard"
		>
			{#if isProcessing}
				<span class="btn-spinner" aria-hidden="true"></span>
				Processing...
			{:else}
				<span class="btn-icon" aria-hidden="true">📋</span>
				Copy Text
			{/if}
		</button>
		<button 
			type="button" 
			class="btn btn-secondary" 
			disabled={!hasInput && !hasOutput}
			on:click={handleClear}
			aria-label="Clear all text areas"
		>
			<span class="btn-icon" aria-hidden="true">🗑️</span>
			Clear
		</button>
	</div>

	<!-- Feedback Messages -->
	{#if copied}
		<div class="feedback success">
			Copied!
		</div>
	{/if}

	{#if error}
		<div class="feedback error">
			{error}
		</div>
	{/if}
</div>

<style>
	/* Component Container */
	.text-converter {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		width: 100%;
		height: 100%;
	}

	/* Mode Toggle Section */
	.mode-toggle-section {
		display: flex;
		justify-content: center;
		padding: 1rem 0;
		border-bottom: 1px solid #e5e7eb;
		margin-bottom: 0.5rem;
	}

	.mode-toggle-container {
		display: flex;
		align-items: center;
		gap: 1rem;
		background: #f8fafc;
		padding: 0.75rem 1.5rem;
		border-radius: 12px;
		border: 1px solid #e2e8f0;
	}

	.mode-label {
		font-size: 0.875rem;
		font-weight: 500;
		color: #64748b;
		transition: color 0.2s ease;
		user-select: none;
	}

	.mode-label.active {
		color: #3b82f6;
		font-weight: 600;
	}

	.mode-toggle {
		position: relative;
		width: 60px;
		height: 30px;
		background: #cbd5e1;
		border: none;
		border-radius: 15px;
		cursor: pointer;
		transition: background-color 0.3s ease;
		outline: none;
	}

	.mode-toggle:focus {
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
	}

	.mode-toggle.text-to-markdown {
		background: #3b82f6;
	}

	.toggle-slider {
		position: absolute;
		top: 3px;
		left: 3px;
		width: 24px;
		height: 24px;
		background: white;
		border-radius: 50%;
		transition: transform 0.3s ease;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.mode-toggle.text-to-markdown .toggle-slider {
		transform: translateX(30px);
	}

	/* Section Styling */
	.markdown-section,
	.text-section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		flex: 1;
	}

	.section-label {
		font-weight: 600;
		font-size: 0.875rem;
		color: #374151;
		margin-bottom: 0.25rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.output-count,
	.input-count {
		font-weight: 400;
		font-size: 0.75rem;
		color: #10b981;
	}

	.output-help {
		font-size: 0.75rem;
		text-align: right;
		margin-top: 0.25rem;
	}

	.success-indicator {
		color: #10b981;
		font-weight: 500;
	}

	.help-text {
		color: #6b7280;
		font-style: italic;
	}

	/* Textarea Base Styling */
	.textarea {
		width: 100%;
		min-height: 200px;
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		font-size: 0.875rem;
		line-height: 1.5;
		resize: vertical;
		transition: border-color 0.2s ease, box-shadow 0.2s ease;
	}

	.textarea:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.markdown-textarea {
		background-color: white;
		font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', 'Courier New', monospace;
	}

	.text-textarea {
		background-color: white;
	}

	.textarea.invalid {
		border-color: #dc2626;
		box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
	}

	.textarea[readonly] {
		background-color: #f9fafb;
		color: #374151;
		cursor: text;
		user-select: text;
	}

	.textarea[readonly].has-content {
		background-color: #ffffff;
		border-color: #10b981;
		box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.1);
	}

	.textarea[readonly]:focus {
		border-color: #10b981;
		box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
	}

	/* Input Container for Markdown Mode */
	.input-container {
		position: relative;
		width: 100%;
	}

	.hidden-textarea {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		opacity: 0;
		z-index: 2;
		resize: none;
		background: transparent;
		border: none;
		padding: 0.75rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		font-size: 0.875rem;
		line-height: 1.5;
	}

	.hidden-textarea:focus {
		outline: none;
	}

	/* Markdown Display Areas */
	.markdown-display {
		width: 100%;
		min-height: 200px;
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		font-size: 0.875rem;
		line-height: 1.5;
		transition: border-color 0.2s ease, box-shadow 0.2s ease;
		overflow-y: auto;
		background: white;
		position: relative;
		z-index: 1;
	}

	.markdown-display:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.markdown-display.invalid {
		border-color: #dc2626;
		box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
	}

	.input-display {
		background-color: white;
	}

	.output-display {
		background-color: #f9fafb;
		color: #374151;
	}

	.output-display.has-content,
	.text-display.has-content {
		background-color: #ffffff;
		border-color: #10b981;
		box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.1);
	}

	.output-display:focus,
	.text-display:focus {
		border-color: #10b981;
		box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
	}

	.text-display {
		background-color: #f9fafb;
		color: #374151;
	}

	/* Rich Text Input */
	.rich-text-container {
		position: relative;
		width: 100%;
	}

	.rich-text-input {
		width: 100%;
		min-height: 200px;
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		font-size: 0.875rem;
		line-height: 1.5;
		transition: border-color 0.2s ease, box-shadow 0.2s ease;
		overflow-y: auto;
		background: white;
		outline: none;
	}

	.rich-text-input:focus {
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.rich-text-input.invalid {
		border-color: #dc2626;
		box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
	}

	.rich-text-input:empty::before {
		content: attr(data-placeholder);
		color: #9ca3af;
		font-style: italic;
	}

	/* Preserve formatting in rich text input */
	.rich-text-input h1,
	.rich-text-input h2,
	.rich-text-input h3,
	.rich-text-input h4,
	.rich-text-input h5,
	.rich-text-input h6 {
		font-weight: bold;
		margin: 0.5rem 0;
	}

	.rich-text-input h1 { font-size: 1.5rem; }
	.rich-text-input h2 { font-size: 1.25rem; }
	.rich-text-input h3 { font-size: 1.125rem; }

	.rich-text-input strong,
	.rich-text-input b {
		font-weight: bold;
	}

	.rich-text-input em,
	.rich-text-input i {
		font-style: italic;
	}

	.rich-text-input ul,
	.rich-text-input ol {
		margin: 0.5rem 0;
		padding-left: 1.5rem;
	}

	.rich-text-input li {
		margin: 0.25rem 0;
	}

	.rich-text-input p {
		margin: 0.5rem 0;
	}

	.rich-text-input blockquote {
		border-left: 4px solid #e5e7eb;
		padding-left: 1rem;
		margin: 0.5rem 0;
		color: #6b7280;
		font-style: italic;
	}

	/* Markdown content styling */
	.markdown-display :global(h1) {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0.5rem 0;
		color: #1f2937;
	}

	.markdown-display :global(h2) {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0.4rem 0;
		color: #374151;
	}

	.markdown-display :global(h3) {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0.3rem 0;
		color: #4b5563;
	}

	.markdown-display :global(p) {
		margin: 0.5rem 0;
	}

	.markdown-display :global(strong) {
		font-weight: 700;
		color: #1f2937;
	}

	.markdown-display :global(em) {
		font-style: italic;
		color: #374151;
	}

	.markdown-display :global(ul) {
		margin: 0.5rem 0;
		padding-left: 1.5rem;
	}

	.markdown-display :global(ol) {
		margin: 0.5rem 0;
		padding-left: 1.5rem;
	}

	.markdown-display :global(li) {
		margin: 0.25rem 0;
	}

	.markdown-display :global(blockquote) {
		border-left: 4px solid #e5e7eb;
		padding-left: 1rem;
		margin: 0.5rem 0;
		color: #6b7280;
		font-style: italic;
	}

	.markdown-display :global(code) {
		background: #f3f4f6;
		padding: 0.125rem 0.25rem;
		border-radius: 4px;
		font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', 'Courier New', monospace;
		font-size: 0.8rem;
	}

	/* Placeholder for empty contenteditable */
	.markdown-display.empty::before {
		content: attr(data-placeholder);
		color: #9ca3af;
		font-style: italic;
	}

	/* Character Count */
	.character-count {
		font-size: 0.75rem;
		color: #6b7280;
		text-align: right;
		transition: color 0.2s ease;
	}

	.character-count.warning {
		color: #dc2626;
	}

	.limit-warning {
		display: block;
		font-weight: 600;
		margin-top: 0.25rem;
	}

	/* Actions Section */
	.actions-section {
		display: flex;
		gap: 1rem;
		justify-content: center;
		padding: 1rem 0;
		margin-top: 0.5rem;
	}

	/* Button Base Styling */
	.btn {
		padding: 0.875rem 1.75rem;
		border: none;
		border-radius: 10px;
		font-weight: 600;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		min-width: 130px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		position: relative;
		overflow: hidden;
		letter-spacing: 0.025em;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none !important;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
	}

	.btn:focus {
		outline: none;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.btn-icon {
		font-size: 1rem;
		line-height: 1;
	}

	.btn-primary {
		background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
		color: white;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.btn-primary:hover:not(:disabled) {
		background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
		transform: translateY(-2px) scale(1.02);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.btn-primary:active:not(:disabled) {
		transform: translateY(-1px) scale(1.01);
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3), 0 2px 6px rgba(0, 0, 0, 0.1);
		transition: all 0.1s ease;
	}

	.btn-primary.loading {
		background-color: #6366f1;
		cursor: wait;
	}

	.btn-secondary {
		background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
		color: white;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.btn-secondary:hover:not(:disabled) {
		background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
		transform: translateY(-2px) scale(1.02);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.btn-secondary:active:not(:disabled) {
		transform: translateY(-1px) scale(1.01);
		box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3), 0 2px 6px rgba(0, 0, 0, 0.1);
		transition: all 0.1s ease;
	}

	.btn-secondary:focus {
		box-shadow: 0 0 0 3px rgba(107, 114, 128, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	/* Button Spinner Animation */
	.btn-spinner {
		width: 1rem;
		height: 1rem;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top: 2px solid white;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	/* Feedback Messages */
	.feedback {
		padding: 0.75rem;
		border-radius: 8px;
		font-size: 0.875rem;
		font-weight: 500;
		text-align: center;
		animation: fadeIn 0.3s ease;
	}

	.feedback.success {
		background-color: #d1fae5;
		color: #065f46;
		border: 1px solid #a7f3d0;
	}

	.feedback.error {
		background-color: #fee2e2;
		color: #991b1b;
		border: 1px solid #fca5a5;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Mobile Responsive */
	@media (max-width: 767px) {
		.mode-toggle-container {
			padding: 0.5rem 1rem;
			gap: 0.75rem;
		}

		.mode-label {
			font-size: 0.75rem;
		}

		.mode-toggle {
			width: 50px;
			height: 26px;
		}

		.toggle-slider {
			width: 20px;
			height: 20px;
		}

		.mode-toggle.text-to-markdown .toggle-slider {
			transform: translateX(24px);
		}

		.textarea,
		.markdown-display,
		.rich-text-input {
			min-height: 150px;
		}

		.actions-section {
			flex-direction: column;
			align-items: center;
			gap: 0.75rem;
			padding: 1.25rem 0;
		}

		.btn {
			width: 100%;
			max-width: 220px;
			padding: 1rem 1.5rem;
			font-size: 0.9rem;
		}
	}

	/* Desktop Two-Column Layout (768px+) */
	@media (min-width: 768px) {
		.text-converter {
			max-width: 1200px;
			margin: 0 auto;
			padding: 2rem;
			gap: 2rem;
			height: 100vh;
			min-height: 600px;
			display: grid;
			grid-template-columns: 1fr 1fr;
			grid-template-rows: auto 1fr auto;
			grid-template-areas: 
				"toggle toggle"
				"markdown text"
				"actions actions";
		}

		.mode-toggle-section {
			grid-area: toggle;
			border-bottom: 1px solid #e5e7eb;
			margin-bottom: 1rem;
			padding-bottom: 1.5rem;
		}

		.markdown-section {
			grid-area: markdown;
			gap: 0.75rem;
		}

		.text-section {
			grid-area: text;
			gap: 0.75rem;
		}

		.actions-section {
			grid-area: actions;
			flex-direction: row;
			justify-content: center;
			gap: 1.5rem;
			padding: 2rem 0 1rem 0;
			border-top: 1px solid #e5e7eb;
			margin-top: 1.5rem;
		}

		.textarea,
		.markdown-display,
		.rich-text-input {
			min-height: 300px;
			padding: 1rem;
			font-size: 1rem;
		}

		.markdown-textarea {
			font-size: 0.875rem;
		}

		.section-label {
			font-size: 1rem;
			margin-bottom: 0.5rem;
		}

		.character-count,
		.output-help {
			font-size: 0.875rem;
			padding: 0.5rem 0;
		}

		.btn {
			width: auto;
			min-width: 140px;
			max-width: none;
			padding: 1rem 2.25rem;
			font-size: 1rem;
			font-weight: 600;
		}

		.feedback {
			position: fixed;
			top: 2rem;
			right: 2rem;
			left: auto;
			margin: 0;
			min-width: 200px;
			z-index: 1000;
		}
	}

	/* Large Desktop (1024px+) */
	@media (min-width: 1024px) {
		.text-converter {
			padding: 2.5rem;
		}

		.textarea,
		.markdown-display,
		.rich-text-input {
			min-height: 350px;
			padding: 1.25rem;
		}
	}
</style>