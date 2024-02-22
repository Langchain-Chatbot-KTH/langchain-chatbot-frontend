/**
 * Parses text by replacing certain characters and patterns with HTML elements.
 * @param {string} text - The text to be parsed
 * @returns {string} The parsed text
 */
export function parseText(text) {
    // Replace newline characters with <br> tags
    text = text.replace(/\\n/g, '<br>');
    // Replace backslashes with double quotes
    text = text.replace(/\\/g, '"');
    // Replace inline code blocks (enclosed in triple backticks) with <code> tags
    text = text.replace(/```([\s\S]*?)```/g, (match, code) => {
        return `<code>${code}</code>`;
    });
    return text;
}
