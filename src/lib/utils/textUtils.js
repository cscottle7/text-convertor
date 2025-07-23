// Text formatting utility functions

/**
 * Convert text to URL-friendly slug format
 * @param {string} text
 * @returns {string}
 */
export function slugify(text) {
	return text
		.toString()
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '')       // Remove all non-word chars except spaces and hyphens
		.replace(/\s+/g, '-')           // Replace spaces with -
		.replace(/\-\-+/g, '-')         // Replace multiple - with single -
		.replace(/^-+/, '')             // Trim - from start of text
		.replace(/-+$/, '');            // Trim - from end of text
}

/**
 * Convert text to snake_case format
 * @param {string} text
 * @returns {string}
 */
export function toSnakeCase(text) {
	return text
		.toString()
		.trim()
		.replace(/\W+/g, ' ')           // Replace non-word characters with spaces
		.split(/ |\B(?=[A-Z])/)         // Split on spaces or before capital letters
		.map(/** @param {string} word */ (word) => word.toLowerCase())
		.filter(/** @param {string} word */ (word) => word.length > 0)
		.join('_');
}

/**
 * Capitalize Each Word In Text
 * @param {string} text
 * @returns {string}
 */
export function capitalize(text) {
	return text
		.toString()
		.toLowerCase()
		.split(' ')
		.map(/** @param {string} word */ (word) => {
			if (word.length === 0) return word;
			return word.charAt(0).toUpperCase() + word.slice(1);
		})
		.join(' ');
}

/**
 * Convert text to UPPERCASE
 * @param {string} text
 * @returns {string}
 */
export function toUpperCase(text) {
	return text.toString().toUpperCase();
}

/**
 * Convert text to lowercase
 * @param {string} text
 * @returns {string}
 */
export function toLowerCase(text) {
	return text.toString().toLowerCase();
}

/**
 * Strip HTML tags from text
 * @param {string} html
 * @returns {string}
 */
export function stripHTML(html) {
	// Create a temporary div element to parse HTML
	const tempDiv = document.createElement('div');
	tempDiv.innerHTML = html;
	
	// Get text content and clean up whitespace
	let text = tempDiv.textContent || tempDiv.innerText || '';
	
	// Clean up extra whitespace and normalize line breaks
	text = text
		.replace(/\n{3,}/g, '\n\n')     // Replace multiple line breaks with double
		.replace(/^\s+|\s+$/g, '')      // Trim whitespace from start/end
		.replace(/\s*\n\s*/g, '\n')     // Normalize line break spacing
		.replace(/\t+/g, ' ')           // Replace tabs with spaces
		.replace(/  +/g, ' ');          // Replace multiple spaces with single space
	
	return text;
}

/**
 * Get conversion mode configuration
 */
export const CONVERSION_MODES = {
	'markdown-to-text': {
		label: 'Markdown → Text',
		description: 'Convert Markdown to clean plain text',
		inputLabel: 'Markdown',
		outputLabel: 'Plain Text',
		inputPlaceholder: 'Paste your Markdown, notes, or AI-generated text here...',
		outputPlaceholder: 'Your clean, plain text will appear here.',
		bidirectional: true
	},
	'text-to-markdown': {
		label: 'Text → Markdown',
		description: 'Convert plain text to formatted Markdown',
		inputLabel: 'Plain Text',
		outputLabel: 'Markdown',
		inputPlaceholder: 'Type or paste your text here...',
		outputPlaceholder: 'Generated Markdown will appear here...',
		bidirectional: true
	},
	'slugify': {
		label: 'Slugify',
		description: 'Convert text to URL-friendly slugs',
		inputLabel: 'Text',
		outputLabel: 'URL Slug',
		inputPlaceholder: 'Enter text to convert to URL slug...',
		outputPlaceholder: 'url-friendly-slug-will-appear-here',
		bidirectional: false
	},
	'snake-case': {
		label: 'Snake Case',
		description: 'Convert text to snake_case format',
		inputLabel: 'Text',
		outputLabel: 'Snake Case',
		inputPlaceholder: 'Enter text to convert to snake_case...',
		outputPlaceholder: 'snake_case_text_will_appear_here',
		bidirectional: false
	},
	'capitalize': {
		label: 'Capitalize',
		description: 'Capitalize Each Word In Text',
		inputLabel: 'Text',
		outputLabel: 'Capitalized Text',
		inputPlaceholder: 'enter text to capitalize each word...',
		outputPlaceholder: 'Capitalized Text Will Appear Here',
		bidirectional: false
	},
	'uppercase': {
		label: 'UPPERCASE',
		description: 'Convert text to UPPERCASE',
		inputLabel: 'Text',
		outputLabel: 'UPPERCASE',
		inputPlaceholder: 'enter text to convert to uppercase...',
		outputPlaceholder: 'UPPERCASE TEXT WILL APPEAR HERE',
		bidirectional: false
	},
	'lowercase': {
		label: 'lowercase',
		description: 'convert text to lowercase',
		inputLabel: 'Text',
		outputLabel: 'lowercase',
		inputPlaceholder: 'ENTER TEXT TO CONVERT TO LOWERCASE...',
		outputPlaceholder: 'lowercase text will appear here',
		bidirectional: false
	},
	'strip-html': {
		label: 'Strip HTML',
		description: 'Remove HTML tags and extract clean text',
		inputLabel: 'HTML',
		outputLabel: 'Clean Text',
		inputPlaceholder: 'Paste HTML content to strip tags...',
		outputPlaceholder: 'Clean text without HTML tags will appear here',
		bidirectional: false
	}
};