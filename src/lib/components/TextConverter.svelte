<script>
	// Component: TextConverter
	// Purpose: Multi-format text converter with various formatting options
	
	// Import dependencies
	import { marked } from 'marked';
	import Toast from './Toast.svelte';
	import Alert from './Alert.svelte';
	import { 
		slugify, 
		toSnakeCase, 
		capitalize, 
		toUpperCase, 
		toLowerCase, 
		stripHTML,
		CONVERSION_MODES
	} from '../utils/textUtils.js';
	
	// Reactive state variables
	let inputText = '';
	let outputText = '';
	let copied = false;
	let error = '';
	let isProcessing = false;
	
	// Toast notification state
	let showToast = false;
	let toastMessage = '';
	let toastType = 'success';
	
	// Alert notification state
	let showAlert = false;
	let alertMessage = '';
	let alertType = 'error';
	let conversionMode = 'markdown-to-text'; // Current conversion mode
	let inputRendered = '';
	let inputHtml = ''; // Store HTML content when pasted for text-to-markdown mode
	let outputRendered = '';
	let isPasting = false; // Flag to prevent double processing during paste
	
	// Character limit constant
	const CHARACTER_LIMIT = 10000;
	
	// Reactive statements for automatic conversion and validation
	$: isInputValid = inputText.length <= CHARACTER_LIMIT;
	$: hasInput = inputText.trim().length > 0;
	$: hasOutput = outputText.trim().length > 0;
	$: isCharacterLimitExceeded = inputText.length > CHARACTER_LIMIT;
	$: currentMode = CONVERSION_MODES[conversionMode] || CONVERSION_MODES['markdown-to-text'];
	$: isBidirectional = currentMode.bidirectional;
	
	// Show toast when copy is successful
	$: if (copied) {
		toastMessage = 'Copied!';
		toastType = 'success';
		showToast = true;
		
		setTimeout(() => {
			copied = false;
		}, 100); // Reset copied state quickly
	}
	
	// Show alert for errors
	$: if (error && error !== '') {
		alertMessage = error;
		alertType = 'error';
		showAlert = true;
		
		setTimeout(() => {
			error = '';
		}, 100); // Reset error state quickly
	}

	// Simple approach: convert markdown to HTML first, then strip HTML tags
	/** @param {string} markdown */
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
			const html = await marked.parse(markdown);
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
	/** @param {string} text */
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
				
				// Detect existing list items first (lines starting with dash, asterisk, or numbers)
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
				
				// Detect simple list items (lines starting with a word followed by comma-separated items)
				if (line.includes(',') && !line.includes('.') && line.split(',').length >= 3) {
					const items = line.split(',').map(item => item.trim());
					if (items.length >= 2) {
						result.push(''); // Add blank line before list
						items.forEach(item => {
							if (item) result.push(`* ${item}`);
						});
						continue;
					}
				}
				
				// Improved header detection - look for standalone short lines or lines ending with colon
				const isShortLine = line.length <= 50;
				const isTitle = /^[A-Z][^.!?]*[^.!?:]$/.test(line) && !line.includes(',');
				const isHeader = line.endsWith(':') || (isShortLine && isTitle);
				
				if (isHeader) {
					// Remove trailing colon if present
					const headerText = line.replace(/:$/, '');
					result.push(`## ${headerText}`);
					continue;
				}
				
				// Process regular text for emphasis and formatting
				let processedLine = line;
				
				// Convert quoted text to italics
				processedLine = processedLine.replace(/"([^"]+)"/g, '*$1*');
				
				// Convert words in CAPS to bold (if more than 2 chars)
				processedLine = processedLine.replace(/\b([A-Z]{3,})\b/g, '**$1**');
				
				// Convert emphasized words (surrounded by underscores) to italics
				processedLine = processedLine.replace(/\b_([^_]+)_\b/g, '*$1*');
				
				// Convert bold markers (surrounded by asterisks) 
				processedLine = processedLine.replace(/\*([^*]+)\*/g, '**$1**');
				
				result.push(processedLine);
			}
			
			return result.join('\n');
		} catch (error) {
			console.error('Error in textToMarkdown:', error);
			return text;
		}
	}

	// Change conversion mode from dropdown (keep for backward compatibility)
	/** @param {Event} event */
	function changeConversionMode(event) {
		conversionMode = event.target.value;
		// Clear output and HTML previews when switching modes
		outputText = '';
		inputHtml = '';
		inputRendered = '';
		// Re-trigger conversion if there's input
		if (inputText.trim() && isInputValid) {
			performConversion(inputText);
		}
	}

	// Change conversion mode from button click
	/** @param {string} modeKey */
	function changeConversionModeByKey(modeKey) {
		conversionMode = modeKey;
		// Clear output and HTML previews when switching modes
		outputText = '';
		inputHtml = '';
		inputRendered = '';
		// Re-trigger conversion if there's input
		if (inputText.trim() && isInputValid) {
			performConversion(inputText);
		}
	}

	// Unified conversion function
	/** @param {string} text */
	async function performConversion(text) {
		try {
			isProcessing = true;
			error = '';
			
			let result = '';
			
			switch (conversionMode) {
				case 'markdown-to-text':
					result = await markdownToPlainText(text);
					break;
				case 'text-to-markdown':
					result = textToMarkdown(text);
					break;
				case 'slugify':
					result = slugify(text);
					break;
				case 'snake-case':
					result = toSnakeCase(text);
					break;
				case 'capitalize':
					result = capitalize(text);
					break;
				case 'uppercase':
					result = toUpperCase(text);
					break;
				case 'lowercase':
					result = toLowerCase(text);
					break;
				case 'strip-html':
					result = stripHTML(text);
					break;
				default:
					result = await markdownToPlainText(text);
			}
			
			outputText = result;
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
			inputHtml = ''; // Clear HTML preview when text is cleared
			error = '';
			isProcessing = false;
		} else if (isCharacterLimitExceeded) {
			outputText = '';
			error = '';
			isProcessing = false;
		}
	}

	// Copy to clipboard functionality using native Clipboard API with rich text support
	async function handleCopyText() {
		if (!outputText.trim()) {
			error = 'No text to copy';
			return;
		}

		try {
			// Use modern Clipboard API if available
			if (navigator.clipboard && window.isSecureContext) {
				// For text-to-markdown mode, copy markdown syntax as plain text only
				if (conversionMode === 'text-to-markdown') {
					await navigator.clipboard.writeText(outputText);
				} else {
					// For markdown-to-text mode, copy rich HTML from the rendered preview
					// Use the inputRendered HTML that's displayed in the preview
					if (inputRendered && inputRendered.trim()) {
						// Create clipboard data with both formats
						const clipboardData = [
							new ClipboardItem({
								'text/html': new Blob([inputRendered], { type: 'text/html' }),
								'text/plain': new Blob([outputText], { type: 'text/plain' })
							})
						];
						
						await navigator.clipboard.write(clipboardData);
					} else {
						// Fallback to plain text if no rendered HTML available
						await navigator.clipboard.writeText(outputText);
					}
				}
				
				copied = true;
				error = '';
			} else {
				// Fallback for older browsers or non-HTTPS contexts
				// Note: Rich text copying not supported in fallback mode
				const textArea = document.createElement('textarea');
				textArea.value = outputText;
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
			console.error('Copy error:', err);
			// Fallback to plain text if rich text copying fails
			try {
				if (navigator.clipboard && window.isSecureContext) {
					await navigator.clipboard.writeText(outputText);
					copied = true;
					error = '';
				} else {
					throw new Error('Clipboard not available');
				}
			} catch (fallbackErr) {
				error = 'Failed to copy text. Please try selecting and copying manually.';
				copied = false;
			}
		}
	}

	// Clear functionality to reset both text areas and all state
	function handleClear() {
		inputText = '';
		outputText = '';
		inputRendered = '';
		inputHtml = '';
		outputRendered = '';
		copied = false;
		error = '';
		isProcessing = false;
	}

	// Render markdown to HTML for display
	/** @param {string} text */
	async function renderMarkdown(text) {
		try {
			if (!text.trim()) return '';
			return await marked.parse(text);
		} catch (error) {
			console.error('Error rendering markdown:', error);
			return text;
		}
	}


	// Convert HTML to Markdown
	/** @param {string} html */
	function htmlToMarkdown(html) {
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
			}
		}
		
		console.log('📋 Processing final HTML:', html);
		
		// Create a new temporary div to parse the cleaned HTML
		const parseDiv = document.createElement('div');
		parseDiv.innerHTML = html;
		
		// Convert HTML elements to markdown
		const elements = parseDiv.childNodes;
		let markdown = '';
		
		/** @param {Node} node */
		function processNode(node) {
			if (node.nodeType === Node.TEXT_NODE) {
				return node.textContent;
			}
			
			if (node.nodeType === Node.ELEMENT_NODE) {
				const tagName = node.tagName.toLowerCase();
				const content = Array.from(node.childNodes).map(processNode).join('');
				
				// Skip processing if this is a wrapper element with block-level children
				if ((tagName === 'strong' || tagName === 'b') && content.includes('\n')) {
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
						const contentLines = trimmed.split('\n').filter(/** @param {string} line */ (line) => line.trim());
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
	/** @param {Event} event */
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
	/** @param {ClipboardEvent} event */
	function handleRichPaste(event) {
		event.preventDefault();
		isPasting = true; // Set flag to prevent double processing
		
		const clipboardData = event.clipboardData || (window).clipboardData;
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
			// Store HTML for rich text preview in text-to-markdown mode
			inputHtml = html;
			
			// We have rich HTML content
			console.log('🎨 Setting element HTML...');
			element.innerHTML = html;
			console.log('✅ Element HTML set. Current innerHTML length:', element.innerHTML.length);
			
			// Convert to markdown for the conversion
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
		
	}

	// Reactive statements for rendering
	$: {
		if (conversionMode === 'markdown-to-text' && inputText) {
			try {
				inputRendered = marked.parse(inputText);
			} catch (error) {
				console.error('Error rendering markdown:', error);
				inputRendered = inputText;
			}
		} else if (conversionMode === 'markdown-to-text' && !inputText) {
			inputRendered = '';
			console.log('Cleared inputRendered');
		} else {
			// Clear inputRendered when not in markdown-to-text mode
			inputRendered = '';
			console.log('Not in markdown-to-text mode or no input text');
		}
	}
</script>

<div class="text-converter">
	<!-- Conversion Mode Buttons -->
	<div class="mode-selector-section">
		<div class="mode-selector-container">
			<p class="mode-selector-label">Conversion Mode:</p>
			<div class="mode-buttons-container">
				{#each Object.entries(CONVERSION_MODES) as [modeKey, mode]}
					<button
						type="button"
						class="mode-button"
						class:active={conversionMode === modeKey}
						on:click={() => changeConversionModeByKey(modeKey)}
						aria-label="Select {mode.label} conversion mode"
					>
						{mode.label}
					</button>
				{/each}
			</div>
			<p class="mode-description">{currentMode.description}</p>
		</div>
	</div>

	<!-- Input Section (Always Left) -->
	<div class="input-section">
		<div class="section-header">
			<label for="input-textarea" class="section-label">
				{currentMode.inputLabel}
			</label>
			<!-- Clear Button for input section -->
			<button 
				type="button" 
				class="btn btn-secondary clear-btn" 
				disabled={!hasInput && !hasOutput}
				on:click={handleClear}
				aria-label="Clear all text areas"
			>
				<span class="btn-icon" aria-hidden="true">🗑️</span>
				Clear
			</button>
		</div>
		<!-- Universal Input Textarea -->
		<textarea
			id="input-textarea"
			class="textarea input-textarea"
			class:invalid={isCharacterLimitExceeded}
			placeholder={currentMode.inputPlaceholder}
			bind:value={inputText}
			aria-describedby="character-count"
			aria-invalid={isCharacterLimitExceeded}
			aria-label="Enter text to convert"
			spellcheck="true"
			autocomplete="off"
			data-autocorrect="on"
			autocapitalize="sentences"
			rows="8"
		></textarea>
		
		<!-- Rich Text Preview for Text-to-Markdown Mode (shows pasted HTML) -->
		{#if conversionMode === 'text-to-markdown' && inputHtml && inputHtml.trim()}
			<div class="rich-preview">
				<div class="rich-preview-label">Pasted Rich Text:</div>
				<div class="rich-preview-content">
					{@html inputHtml}
				</div>
			</div>
		{/if}
		
		<div id="character-count" class="character-count" class:warning={isCharacterLimitExceeded}>
			{inputText.length} / {CHARACTER_LIMIT} characters
			{#if isCharacterLimitExceeded}
				<span class="limit-warning">Character limit exceeded!</span>
			{/if}
		</div>
	</div>

	<!-- Output Section (Always Right) -->
	<div class="output-section">
		<div class="section-header">
			<label for="output-textarea" class="section-label">
				{currentMode.outputLabel}
			</label>
			<!-- Copy Text Button for output -->
			<button 
				type="button" 
				class="btn btn-primary copy-text-btn" 
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
		</div>
		<!-- Rich Text Preview for Markdown Mode -->
		{#if conversionMode === 'markdown-to-text' && inputRendered && inputText.trim()}
			<div class="rich-preview">
				<div class="rich-preview-label">Rich Text Preview:</div>
				<div class="rich-preview-content">
					{@html inputRendered}
				</div>
			</div>
		{/if}

		<!-- Universal Output Textarea -->
		<textarea
			id="output-textarea"
			class="textarea output-textarea"
			class:has-content={hasOutput}
			placeholder={currentMode.outputPlaceholder}
			bind:value={outputText}
			readonly
			tabindex="0"
			aria-label="Converted text output"
			rows="8"
		></textarea>
		<div id="output-character-count" class="character-count">
			{outputText.length} characters
		</div>
	</div>


	<!-- Toast Notifications -->
	<Toast
		message={toastMessage}
		type={toastType}
		duration={3000}
		bind:show={showToast}
	/>
	
	<!-- Alert Notifications -->
	<Alert
		message={alertMessage}
		type={alertType}
		dismissible={true}
		bind:show={showAlert}
	/>
</div>

<style>
	/* Component Container */
	.text-converter {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		width: 100%;
		min-height: 100%;
		padding-bottom: 4rem;
	}

	/* Mode Selector Section */
	.mode-selector-section {
		display: flex;
		justify-content: center;
		padding: 1rem 0;
		border-bottom: 1px solid #e5e7eb;
		margin-bottom: 0.5rem;
	}

	.mode-selector-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		background: #f8fafc;
		padding: 1rem 1.5rem;
		border-radius: 12px;
		border: 1px solid #e2e8f0;
		min-width: 300px;
	}

	.mode-selector-label {
		font-size: 14px;
		font-weight: 600;
		color: #374151;
		margin: 0;
	}

	.mode-buttons-container {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		justify-content: center;
		margin: 0.5rem 0;
	}

	.mode-button {
		padding: 0.5rem 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		background: white;
		font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', 'Courier New', monospace;
		font-size: 12px;
		color: #374151;
		cursor: pointer;
		transition: all 0.2s ease;
		white-space: nowrap;
		min-width: 80px;
	}

	.mode-button:hover {
		background: #f3f4f6;
		border-color: #9ca3af;
	}

	.mode-button:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.mode-button.active {
		background: #3b82f6;
		color: white;
		border-color: #3b82f6;
	}

	.mode-button.active:hover {
		background: #2563eb;
		border-color: #2563eb;
	}

	.mode-description {
		font-size: 0.75rem;
		color: #6b7280;
		text-align: center;
		margin: 0;
		font-style: italic;
	}

	/* Section Styling */
	.input-section,
	.output-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		flex: 1;
		padding-bottom: 2rem;
		min-width: 0;
		overflow-x: hidden;
		overflow-y: visible;
	}

	.section-label {
		font-weight: 600;
		font-size: 14px;
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
		color: #28a745;
	}


	.success-indicator {
		color: #28a745;
		font-weight: 500;
	}

	.help-text {
		color: #6b7280;
		font-style: italic;
	}

	/* Section Header with Copy Button */
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.copy-text-btn,
	.clear-btn {
		min-width: 65px !important;
		padding: 0.375rem 0.75rem !important;
		font-size: 11px !important;
		border-radius: 4px !important;
		flex-shrink: 0;
	}

	/* Textarea Base Styling */
	.textarea {
		width: 100%;
		max-width: 100%;
		box-sizing: border-box;
		min-height: 200px;
		padding: 0.75rem;
		border: 1px solid #ccc;
		border-radius: 8px;
		font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', 'Courier New', monospace;
		font-size: 14px;
		font-weight: 400;
		line-height: 1.5;
		resize: vertical;
		transition: border-color 0.2s ease, box-shadow 0.2s ease;
		word-wrap: break-word;
		overflow-wrap: break-word;
		white-space: pre-wrap;
		overflow-x: hidden;
		overflow-y: auto;
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
		border-color: #28a745;
		box-shadow: 0 0 0 2px rgba(40, 167, 69, 0.1);
	}

	.textarea[readonly]:focus {
		border-color: #28a745;
		box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1);
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
		font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', 'Courier New', monospace;
		font-size: 14px;
		font-weight: 400;
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
		border: 1px solid #ccc;
		border-radius: 8px;
		font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', 'Courier New', monospace;
		font-size: 14px;
		font-weight: 400;
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
		background-color: #f8f9fa;
		color: #333;
	}

	.output-display.has-content,
	.text-display.has-content {
		background-color: #ffffff;
		border-color: #28a745;
		box-shadow: 0 0 0 2px rgba(40, 167, 69, 0.1);
	}

	.output-display:focus,
	.text-display:focus {
		border-color: #28a745;
		box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1);
	}

	.text-display {
		background-color: #f8f9fa;
		color: #333;
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
		border: 1px solid #ccc;
		border-radius: 8px;
		font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', 'Courier New', monospace;
		font-size: 14px;
		font-weight: 400;
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
		font-size: 12px;
	}

	/* Placeholder for empty contenteditable */
	.markdown-display.empty::before {
		content: attr(data-placeholder);
		color: #9ca3af;
		font-style: italic;
	}

	/* Rich Text Preview */
	.rich-text-preview {
		margin-top: 1rem;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		background: #f8f9fa;
		overflow: hidden;
	}

	.preview-label {
		background: #e5e7eb;
		padding: 0.5rem 0.75rem;
		font-size: 0.75rem;
		font-weight: 600;
		color: #374151;
		border-bottom: 1px solid #d1d5db;
	}

	.rich-text-preview .markdown-display {
		padding: 0.75rem;
		background: white;
		border: none;
		margin: 0;
		min-height: 100px;
		max-height: 200px;
		overflow-y: auto;
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


	/* Button Base Styling */
	.btn {
		padding: 0.875rem 1.75rem;
		border: none;
		border-radius: 10px;
		font-weight: 600;
		font-size: 14px;
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
		font-size: 16px;
		line-height: 1;
	}

	.btn-primary {
		background: #007bff;
		color: white;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.btn-primary:hover:not(:disabled) {
		background: #0056b3;
		transform: translateY(-2px) scale(1.02);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.btn-primary:active:not(:disabled) {
		transform: translateY(-1px) scale(1.01);
		box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3), 0 2px 6px rgba(0, 0, 0, 0.1);
		transition: all 0.1s ease;
	}

	.btn-primary.loading {
		background-color: #0056b3;
		cursor: wait;
	}

	.btn-secondary {
		background: #6c757d;
		color: white;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.btn-secondary:hover:not(:disabled) {
		background: #545b62;
		transform: translateY(-2px) scale(1.02);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.btn-secondary:active:not(:disabled) {
		transform: translateY(-1px) scale(1.01);
		box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3), 0 2px 6px rgba(0, 0, 0, 0.1);
		transition: all 0.1s ease;
	}

	.btn-secondary:focus {
		box-shadow: 0 0 0 3px rgba(108, 117, 125, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15);
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


	/* Mobile Responsive */
	@media (max-width: 767px) {
		.mode-selector-container {
			padding: 0.75rem 1rem;
			min-width: 280px;
		}

		.mode-buttons-container {
			gap: 0.375rem;
		}

		.mode-button {
			font-size: 11px;
			padding: 0.375rem 0.5rem;
			min-width: 70px;
		}

		.mode-description {
			font-size: 0.6875rem;
		}

		.textarea,
		.markdown-display,
		.rich-text-input {
			min-height: 150px;
		}


		.section-header {
			flex-direction: column;
			align-items: stretch;
			gap: 0.75rem;
		}

		.copy-text-btn,
		.clear-btn {
			width: 100%;
			max-width: 120px;
			align-self: center;
		}

		.btn {
			width: 100%;
			max-width: 220px;
			padding: 1rem 1.5rem;
			font-size: 14px;
		}
	}

	/* Desktop Two-Column Layout (768px+) */
	@media (min-width: 768px) {
		.text-converter {
			max-width: 1200px;
			margin: 0 auto;
			padding: 2rem 2rem 4rem 2rem;
			gap: 2rem;
			min-height: 600px;
			display: grid;
			grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
			grid-template-rows: auto 1fr;
			grid-template-areas: 
				"selector selector"
				"input output";
		}

		.mode-selector-section {
			grid-area: selector;
			border-bottom: 1px solid #e5e7eb;
			margin-bottom: 1rem;
			padding-bottom: 1.5rem;
		}

		.input-section {
			grid-area: input;
			gap: 1.25rem;
			min-width: 0;
			overflow-x: hidden;
			overflow-y: visible;
		}

		.output-section {
			grid-area: output;
			gap: 1.25rem;
			min-width: 0;
			overflow-x: hidden;
			overflow-y: visible;
		}


		.textarea,
		.markdown-display,
		.rich-text-input {
			min-height: 300px;
			padding: 1rem;
			font-size: 14px;
		}

		.markdown-textarea {
			font-size: 14px;
		}

		.section-label {
			font-size: 16px;
			margin-bottom: 0.5rem;
		}

		.character-count {
			font-size: 14px;
			padding: 0.5rem 0;
		}

		.btn {
			width: auto;
			min-width: 140px;
			max-width: none;
			padding: 1rem 2.25rem;
			font-size: 14px;
			font-weight: 600;
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

	/* Rich Text Preview Styles */
	.rich-preview {
		margin-bottom: 1rem;
		border: 1px solid #e1e5e9;
		border-radius: 8px;
		background: #f8f9fa;
		overflow-x: hidden;
		overflow-y: visible;
		width: 100%;
		max-width: 100%;
		box-sizing: border-box;
	}

	.rich-preview-label {
		background: #007bff;
		color: white;
		padding: 0.5rem 0.75rem;
		font-size: 0.875rem;
		font-weight: 600;
		font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', 'Courier New', monospace;
	}

	.rich-preview-content {
		padding: 1rem;
		background: white;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
		line-height: 1.6;
		color: #333;
		max-height: 200px;
		overflow-y: auto;
		overflow-x: hidden;
		word-wrap: break-word;
		overflow-wrap: break-word;
	}

	.rich-preview-content :global(h1) {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0 0 0.75rem 0;
		color: #1a202c;
		word-wrap: break-word;
		overflow-wrap: break-word;
	}

	.rich-preview-content :global(h2) {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		color: #2d3748;
		word-wrap: break-word;
		overflow-wrap: break-word;
	}

	.rich-preview-content :global(h3) {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		color: #4a5568;
		word-wrap: break-word;
		overflow-wrap: break-word;
	}

	.rich-preview-content :global(p) {
		margin: 0 0 0.75rem 0;
		word-wrap: break-word;
		overflow-wrap: break-word;
	}

	.rich-preview-content :global(strong) {
		font-weight: 700;
	}

	.rich-preview-content :global(em) {
		font-style: italic;
	}

	.rich-preview-content :global(ul), 
	.rich-preview-content :global(ol) {
		margin: 0.5rem 0;
		padding-left: 1.5rem;
	}

	.rich-preview-content :global(li) {
		margin: 0.25rem 0;
	}

	.rich-preview-content :global(blockquote) {
		border-left: 4px solid #007bff;
		padding-left: 1rem;
		margin: 0.75rem 0;
		color: #6b7280;
		font-style: italic;
	}

	.rich-preview-content :global(code) {
		background: #f3f4f6;
		padding: 0.125rem 0.25rem;
		border-radius: 4px;
		font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', 'Courier New', monospace;
		font-size: 0.875rem;
	}
</style>