/**
 * Converts Markdown formatted text to HTML
 * Handles various Markdown elements including:
 *  - Headers (# ## ### ####)
 *  - Bold and Italic (**bold**, *italic*, ***bold-italic***)
 *  - Lists (- item, * item, 1. item)
 *  - Links ([text](url))
 *  - Code blocks (```code```) and inline code (`code`)
 *  - Line breaks
 * 
 * @param {string} markdown - The markdown text to convert
 * @returns {string} The HTML representation of the markdown
 */
export const convertMarkdownToHtml = (markdown) => {
  if (!markdown) return '';
  
  // Process the markdown in multiple steps
  let html = markdown
    // Handle paragraphs (must be done before lists)
    .replace(/\n\n/g, '</p><p>')
    
    // Headers
    .replace(/# (.*?)(\n|$)/g, '<h1>$1</h1>')
    .replace(/## (.*?)(\n|$)/g, '<h2>$1</h2>')
    .replace(/### (.*?)(\n|$)/g, '<h3>$1</h3>')
    .replace(/#### (.*?)(\n|$)/g, '<h4>$1</h4>')
    
    // Bold and Italic
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>') // Bold + Italic
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
    .replace(/__(.*?)__/g, '<strong>$1</strong>') // Alternative Bold
    .replace(/_(.*?)_/g, '<em>$1</em>') // Alternative Italic
    
    // Lists (must handle unordered and ordered)
    .replace(/^\s*[\-\*]\s+(.*?)$/gm, '<li>$1</li>') // Unordered lists
    .replace(/^\s*(\d+)\.\s+(.*?)$/gm, '<li>$2</li>') // Ordered lists

    // Links
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    
    // Code blocks and inline code
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>') // Code blocks
    .replace(/`([^`]+)`/g, '<code>$1</code>') // Inline code
    
    // Line breaks
    .replace(/\n/g, '<br />');
  
  // Wrap with paragraph if needed
  if (!html.startsWith('<h') && !html.startsWith('<li') && !html.startsWith('<pre')) {
    html = '<p>' + html + '</p>';
  }
  
  // Find and wrap lists properly
  html = html
    .replace(/<li>(.*?)<\/li><li>/g, '<li>$1</li><li>') // Clean up any line breaks between list items
    .replace(/<br \/><li>/g, '<li>') // Remove breaks before list items
    .replace(/<li>(.*?)(<br \/>)/g, '<li>$1'); // Remove breaks after list items
    
  // Properly wrap lists with ul/ol tags
  // We'll add a placeholder to mark the beginning of lists
  html = html.replace(/<li>/g, '{{LIST_START}}<li>');
  
  // Find all list blocks and wrap them
  const listBlocks = html.match(/{{LIST_START}}<li>.*?(<\/li>)/g);
  if (listBlocks) {
    listBlocks.forEach(block => {
      const wrappedBlock = '<ul>' + block.replace('{{LIST_START}}', '') + '</ul>';
      html = html.replace(block, wrappedBlock);
    });
  }
  
  return html;
}; 