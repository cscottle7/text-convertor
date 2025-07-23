# CLAUDE.md
**Project:** Text Convertor
**Version:** 3.0
**Last Reviewed:** 20 July 2025
**Owner:** Craig

## 1. The Press Release
**Headline: The End of Copy-Paste Frustration: Text Convertor Delivers Perfectly Formatted Text, Instantly.**

For professionals, writers, and developers who regularly move text between applications, Text Convertor is the new, free utility that eliminates the tedious task of manual reformatting. The app provides a simple, one-click solution to convert text from formats like Markdown into clean, universally compatible text, ready for pasting into Google Docs, CMS platforms, or any other application without breaking the layout. It's an essential tool designed to save time and remove friction from your daily workflow.

## 2. Customer FAQ
This section anticipates questions from our end-users to ensure we meet their primary expectations.

* **Q: Is my data safe? Are you storing the text I paste in?**
    * **A:** Your privacy is our top priority. All text processing happens entirely within your browser. No text is ever sent to or stored on our servers.
* **Q: Is there a limit to how much text I can convert at once?**
    * **A:** To guarantee instant performance for the most common use cases, the converter is optimised for notes and articles up to 10,000 characters. Support for larger documents is being considered for future releases.
* **Q: Will this work on my mobile phone's browser?**
    * **A:** Yes. The application is fully responsive and designed to work seamlessly on modern desktop and mobile browsers.

## 3. Internal FAQ
This section anticipates questions from internal stakeholders to ensure the project is well-considered and strategically aligned.

* **Q: How does this small utility project align with our wider business goals?**
    * **A:** This project serves as a low-risk initiative to attract an initial user base. It will test user acquisition funnels via a subtle, non-intrusive link to our commercial products in the page footer, with conversion tracking to validate the funnel's effectiveness.

## 4. Project Goal & High-Level Requirements
The project's goal is framed using the Jobs-to-be-Done (JTBD) framework to maintain a customer-centric focus.

* **JTBD Statement:** When I have AI-generated content or notes formatted in Markdown, I want to quickly convert it into clean, readable plain text, so I can paste it into a Google Doc or another application without spending time on manual reformatting and cleanup. Additionally, when I have plain text that needs markdown formatting, I want to convert it to properly formatted Markdown for documentation or publishing purposes.

## 5. Design & UX Requirements
The design philosophy is one of extreme minimalism and focus, ensuring a frictionless user experience.

* **Design Philosophy**: The design must be **Utilitarian & Focused** with extreme minimalism and mobile-first approach. The aesthetic should create a mood of "quiet efficiency" with generous white space and clean, minimal layout that removes all friction from the user's workflow.
* **Layouts**:
    * **Mobile (Default)**: A single-column, vertical layout with the "Input" area above the "Output" area.
    * **Desktop (>768px)**: A two-column, side-by-side layout that provides a real-time conversion view.
    * **Header Element**: Simple header containing the title ("Text Convertor") and subtitle for improved hierarchy.
* **Typography Requirements**:
    * **Primary Font Family**: `monospace` (required for developer readability and design system alignment)
    * **Base Font Size**: `14px`
    * **Page Title**: Use prominent heading level (`font-size-lg` or `font-size-xl`)
    * **Input/Output Fields**: Default body text style (`font-size-md`) with monospace font for code clarity
    * **Button Labels**: Standard button text style with `font-weight-semibold`
* **Colour Palette** (Design System Compliance):
    * **Primary Button** (`#007bff`): Vibrant blue for maximum visual impact on 'Copy Text' button
    * **Secondary Button** (`#6c757d`): Solid grey background (not outline/ghost) for 'Clear' button
    * **Textarea Border**: `#ccc`
    * **Output Area**: Background `#f8f9fa`, text colour `#333`
    * **Success Feedback**: Green `#28a745` for "Copied!" message
* **Simplified User Flow**:
    1.  User selects conversion mode (Markdown → Text or Text → Markdown) using a toggle switch.
    2.  User pastes or types content into the "Input" area.
    3.  The "Output" area updates automatically in real-time based on selected mode.
    4.  User clicks 'Copy Text' to copy the result, or 'Clear' to reset the fields.
* **Component Specifications**:
    * **Copy Text Button**: `primary` variant with `contained` style for maximum visual emphasis, positioned close to output area
    * **Clear Button**: `secondary` variant with solid style (not ghost) and reduced visual weight
    * **User Feedback**: Use `Toast`/`Snackbar` component for non-blocking "Copied!" confirmation
    * **Error Handling**: `Alert` component with `critical`/`error` status for copy failures
* **Button Hierarchy**: Significant visual distinction required between primary 'Copy Text' button and secondary 'Clear' button to guide users to the primary action.
* **Layout Refinements**:
    * Character counters must be correctly aligned
    * Increased vertical spacing between text areas and action buttons for better visual separation
* **Microcopy**:
    * **Page Title**: Text Convertor | Clean Up Your Text Instantly
    * **Input Placeholder**: "Paste your Markdown, notes, or AI-generated text here..."
    * **Output Placeholder**: "Your clean, plain text will appear here."
    * **Button Labels**: 'Copy Text' and 'Clear'
    * **Copy Success Feedback**: "Copied!"
* **Rich Text Copy Support**: 
    * **Markdown → Text Mode**: Copy rich HTML formatting for paste into applications like Google Docs, preserving headings, bold text, lists, etc.
    * **Text → Markdown Mode**: Copy plain markdown syntax for technical documentation use.

## 6. Success Metrics & Measurement Plan
Success will be measured by a single, clear metric that is easy for all stakeholders to understand.

* **Primary Success Metric:** Total successful conversions per day.
* **Target:** Achieve and maintain a rolling 7-day average of 1,000+ daily conversions by the end of Q1.

## 7. Core Features & Scope
The scope is defined by a User Story Mapping exercise to create a clear, prioritised plan.

### In Scope (V1 MVP)
* **Core Conversion:** Bidirectional conversion between Markdown and plain text.
* **Mode Toggle:** A user-friendly toggle to switch between Markdown→Text and Text→Markdown conversion modes.
* **Copy Functionality:** A single-click button to copy the converted text to the user's clipboard.
* **Responsive UI:** The web application must be fully functional and usable on both desktop and mobile browsers.

### Out of Scope (Future Releases)
* Download as .txt file.
* Advanced conversion utilities: Slugify, snake_case, Capitalise, etc.
* HTML stripping.
* The "Polish Up" feature with its detailed formatting rules.
* **'Intelligent PDF Text Cleaner' Feature**: This complex feature will be developed using a strategic, phased approach, likely beginning with a Regex-based solution.

## 8. Tech Stack & Key Libraries
* **Framework:** SvelteKit
* **Core Markdown Library:** Marked.js

## 9. Architectural Principles & Constraints
This defines the non-negotiable rules the system must follow.

* **Client-Side Processing:** All text processing MUST execute entirely in the user's browser.
* **Output Definition:** 
  * **Markdown→Text Mode:** A 'clean' conversion strips all Markdown syntax (e.g., `*`, `#`, `>`) while preserving paragraph-level line breaks. Numbered and bulleted lists are converted to plain text lines prefixed with their number or a standard hyphen.
  * **Text→Markdown Mode:** Plain text is intelligently converted to appropriate Markdown syntax. Headers are detected and converted to `#` syntax, emphasized text is wrapped in `*` or `**`, and lists are properly formatted.
* **Graceful Error Handling:** The application must handle malformed or non-standard Markdown input without crashing. It should convert recognised syntax and strip unrecognised syntax.
* **Performance:** The application must feel instantaneous for text within the defined character limit.

## 10. Project Assets
This section references key assets created during the research phase.

* **Pre-built Svelte Component**: A pre-built `TextConverter.svelte` component is ready for implementation. Note: This component requires rigorous testing against all defined edge cases and UI requirements before integration to mitigate development delays.

## 11. Development Plan (task_deps.md)
This section will be populated by the development team to provide a checklist of decomposed sub-tasks and their dependencies for implementation.