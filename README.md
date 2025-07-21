# README: Text Convertor Project

This document provides the core technical documentation for the Text Convertor project, a lightweight web utility designed for developers. [cite_start]It adheres to the standards set out in `SOP: DWS-SOP-DOC-001`[cite: 8].

---

## 1.0 Overview

[cite_start]The Text Convertor is a free utility that eliminates the tedious task of manually reformatting text[cite: 92]. [cite_start]Its purpose is to provide a simple, one-click solution to convert text from formats like Markdown into clean, universally compatible plain text[cite: 99, 211].

The core job-to-be-done is framed as: *When I have AI-generated content or notes formatted in Markdown, I want to quickly convert it into clean, readable plain text, so I can paste it into a Google Doc or another application without spending time on manual reformatting and cleanup.*

[cite_start]The application is built to be exceptionally fast, private, and maintainable[cite: 97, 98, 106].

---

## 2.0 Architecture & Design Principles

[cite_start]The codebase is governed by three non-negotiable architectural principles to ensure it is robust, secure, and easy to maintain[cite: 112].

* [cite_start]**Client-Side Processing:** All text conversion logic **MUST** execute entirely in the user's browser[cite: 113]. [cite_start]No user-entered text is ever transmitted to or stored on any server[cite: 114]. [cite_start]This is a foundational commitment to user privacy[cite: 114].
* [cite_start]**Performance:** The application must feel instantaneous to the user[cite: 116]. [cite_start]This is achieved through the selection of a compiler-first framework and lightweight libraries that minimise runtime overhead[cite: 97]. [cite_start]Performance is considered the primary feature, not an afterthought[cite: 116].
* [cite_start]**Maintainability:** The project **MUST** use a popular, well-documented framework to ensure ease of future maintenance[cite: 115]. [cite_start]The codebase is intended to be clean, understandable, and well-supported[cite: 115].

---

## 3.0 Dependencies

[cite_start]The project relies on a minimal set of key libraries and frameworks to adhere to the core principles of performance and maintainability[cite: 32].

* **Core Framework:** **SvelteKit**
    * [cite_start]Chosen for its compiler-first architecture, which results in highly performant vanilla JavaScript with smaller bundle sizes and no virtual DOM overhead[cite: 97, 122, 123].
* **Markdown Parsing:** **Marked.js**
    * [cite_start]A high-performance, lightweight Markdown parser with no dependencies[cite: 224]. [cite_start]It was selected over alternatives for its significantly smaller bundle size and speed[cite: 99, 217, 224].
* **Clipboard Functionality:** **Native Browser Clipboard API (`navigator.clipboard`)**
    * [cite_start]The modern, secure, and asynchronous browser standard for interacting with the system clipboard, used to implement the 'Copy to Clipboard' function without external dependencies[cite: 67, 144].

---

## 4.0 Setup & Installation

[cite_start]Follow these steps to set up and run the project in a local development environment[cite: 31].

1.  **Clone the Repository**
    ```bash
    git clone <repository-url>
    cd text-convertor
    ```
2.  **Install Dependencies**
    * [cite_start]Install `npm` dependencies, which include `SvelteKit` and `marked`[cite: 31].
    ```bash
    npm install
    ```
3.  **Configure for Client-Side Rendering**
    * [cite_start]To ensure adherence to the client-side processing principle, the application must be configured as a pure client-side application[cite: 128, 343]. In the root layout file (`src/routes/+layout.svelte` or `src/routes/+layout.js`), add the following line:
    ```javascript
    export const ssr = false;
    ```
4.  **Run the Development Server**
    * This will start the application on `localhost`, typically on port 5173.
    ```bash
    npm run dev
    ```

---

## 5.0 Code Examples

[cite_start]The core logic of the application is encapsulated within the `TextConverter.svelte` component[cite: 30, 66, 227]. [cite_start]This single file contains all the necessary script, markup, and styling for the feature[cite: 228, 245, 246].

### `TextConverter.svelte`

[cite_start]This component provides two text areas for input and output[cite: 183, 185]. [cite_start]It uses Svelte's reactivity to automatically call the conversion function whenever the input text changes[cite: 233]. [cite_start]The `copyToClipboard` function uses the asynchronous Clipboard API to copy the result and provide user feedback[cite: 67, 237, 239, 240].

```svelte
<script>
  import { marked } from 'marked';

  // Reactive state for input and output text areas
  let inputText = '';
  let outputText = '';

  // State for the 'Copy' button feedback
  let copied = false;
  let copyTimeout;

  // This function converts Markdown to HTML, then strips HTML tags to get plain text.
  // It is called automatically whenever 'inputText' changes due to Svelte's reactivity.
  $: {
    if (inputText) {
      // Step 1: Convert Markdown to HTML using marked
      const html = marked(inputText);
      // Step 2: Strip HTML tags to get plain text.
      // A simple regex is sufficient for this use case.
      outputText = html.replace(/<[^>]*>?/gm, '');
    } else {
      outputText = '';
    }
  }

  // Function to copy the output text to the clipboard
  async function copyToClipboard() {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      copied = true;
      // Clear any existing timeout to reset the timer
      clearTimeout(copyTimeout);
      // Show the 'Copied!' message for 2 seconds
      copyTimeout = setTimeout(() => {
        copied = false;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Optionally, provide user feedback on error
    }
  }

  // Function to clear both text areas
  function clearText() {
    inputText = '';
    outputText = '';
    copied = false; // Also reset copy status
    clearTimeout(copyTimeout);
  }
</script>

<div class="converter-container">
  <div class="panel">
    <textarea
      bind:value={inputText}
      placeholder="Paste your Markdown, notes, or AI-generated text here..."
      class="text-area input-area"
    ></textarea>
  </div>
  <div class="panel">
    <textarea
      readonly
      value={outputText}
      placeholder="Your clean, plain text will appear here."
      class="text-area output-area"
    ></textarea>
    
    <div class="controls">
      <button on:click={copyToClipboard} class="btn btn-primary">Copy Text</button>
      <button on:click={clearText} class="btn btn-secondary">Clear</button>
      {#if copied}
        <span class="copy-feedback">Copied!</span>
      {/if}
    </div>
  </div>
</div>

<style>
  .converter-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    height: calc(100vh - 4rem); /* Full viewport height minus some padding */
    padding: 1rem;
  }
  .panel {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 200px; /* Ensure panels have a minimum height on mobile */
  }
  .text-area {
    width: 100%;
    height: 100%;
    padding: 0.75rem;
    border: 1px solid #ccc;
    border-radius: 8px;
    font-family: monospace;
    font-size: 14px;
    resize: none;
    box-sizing: border-box;
  }
  .output-area {
    background-color: #f8f9fa;
    color: #333;
  }
  .controls {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-top: 0.75rem;
  }
  .btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  .btn-primary {
    background-color: #007bff;
    color: white;
  }
  .btn-primary:hover {
    background-color: #0056b3;
  }
  .btn-secondary {
    background-color: #6c757d;
    color: white;
  }
  .btn-secondary:hover {
    background-color: #5a6268;
  }
  .copy-feedback {
    color: #28a745;
    font-weight: bold;
    font-size: 14px;
  }

  /* Desktop layout */
  @media (min-width: 768px) {
    .converter-container {
      flex-direction: row;
    }
    .panel {
      min-height: auto;
    }
  }
</style>