## **Visual Inspiration Brief**

Here are three examples of existing applications that align with the minimalist, frictionless, and utility-focused ethos outlined in your PRD.

| **Inspiration** | **Analysis** |
| :--- | :--- |
| **1. Diffchecker** | This example directly reflects the core two-column layout required for the desktop view of the Text Convertor. Its strength lies in its simplicity; there is no unnecessary decoration, and the focus is entirely on the input and output fields. The use of a single, prominent accent colour for the primary action is a pattern we should adopt. |
| **2. Remove Line Breaks Online** | While visually basic, this tool exemplifies the "extreme minimalism" mentioned in the PRD. It features a single input, a single output, and two clear action buttons. This aligns perfectly with the simplified user flow you have defined. We can draw inspiration from its straightforward, no-frills presentation. |
| **3. Quill** (Markdown Editor) | Quill showcases a clean, modern, and slightly more stylised approach to a text-editing interface. Note the excellent use of typography to create a clear hierarchy and the subtle visual cues on interaction. This is a good reference for achieving a polished feel without adding complexity, ensuring the final product feels professional and trustworthy. |

***

## **Conceptual Design Brief**

This brief translates the PRD requirements into a tangible design direction, using the established standards from our Core Component Design System.

* **Recommended Mood & Aesthetic:**
    The aesthetic should be **Utilitarian & Focused**. The design must be clean, minimal, and completely centred on the task of text conversion. We will use generous white space to reduce cognitive load and guide the user's focus naturally between the input, output, and action areas. The overall mood should be one of quiet efficiency.

* **Suggested Colour Palette:**
    To align with the minimalist philosophy, the palette should be restrained and adhere to our established tokens.
    * **Background:** Use a neutral background colour token (e.g., `color-background-default`).
    * **Text:** Employ the standard body and heading text colour tokens for maximum readability (e.g., `color-text-primary`).
    * **Primary Accent:** The `primary` colour token should be reserved for the main call-to-action, specifically the 'Copy Text' button, and for success feedback states.
    * **Secondary/Subtle:** A `secondary` or `ghost` variant colour token should be used for the 'Clear' button to de-emphasise it in relation to the primary action.

* **Typography Recommendations:**
    Clarity and hierarchy are paramount. The typographic scale from the design system should be applied as follows:
    * **Page Title ("Text Convertor | Clean Up Your Text Instantly"):** Use a prominent but not distracting heading level (e.g., `font-size-lg` or `font-size-xl`).
    * **Input/Output Fields:** Use the default body text style (e.g., `font-size-md`) to ensure readability for paragraphs of text. A monospaced font token could be considered to improve the clarity of code snippets or structured text if available in the system.
    * **Button Labels:** Use the standard button text style, ensuring a weight that provides sufficient contrast and legibility (e.g., `font-weight-semibold`).

* **UI & Interaction Style Notes:**
    We will leverage our core components to ensure consistency, accessibility, and efficiency in development.
    * **Action Buttons:**
        * The 'Copy Text' button should be the `Button` component using the `primary` and `contained` variants to give it the most visual emphasis.
        * The 'Clear' button should also use the `Button` component, but with the `secondary` or `ghost` variant to make it a less prominent, alternative action.
    * **User Feedback:**
        * For the 'Copied!' confirmation message, a `Toast` / `Snackbar` component is ideal. It provides crucial, non-blocking feedback that confirms the action was successful without interrupting the user's workflow.
        * For displaying an error if the copy action fails, an `Alert` component with a `critical` or `error` status should appear, providing clear and actionable information.
    * **Input/Output Areas:** While these are custom elements, they should adhere to the design principles of our standard `Text Inputs`, featuring a clear focus indicator (like a highlighted border) when a user is typing.

***

I have provided the Visual Inspiration and Conceptual Design Briefs. Now that you have this direction, how would you like to proceed with the design prototyping?

I can assist you by:

A) **Briefing `Architect Pro`**: To create a Master