// TurndownService initialization
const turndownService = new TurndownService();

// Custom rules to match Firecrawl-like behavior

// 1. Removing unnecessary elements (scripts, styles, ads, sidebars)
turndownService.addRule('removeScripts', {
  filter: ['script', 'style', 'footer', 'aside', '.ad-banner', '.sidebar'], // Exclude specific tags and classes
  replacement: function(content) {
    return ''; // Remove these elements entirely
  }
});

// 2. Images in Markdown
turndownService.addRule('imagesToMarkdown', {
  filter: 'img',
  replacement: function(content, node) {
    const alt = node.alt || '';
    const src = node.src || '';
    return `![${alt}](${src})`; // Convert images to Markdown
  }
});

// 3. Links in Markdown
turndownService.addRule('linksToMarkdown', {
  filter: 'a',
  replacement: function(content, node) {
    const href = node.getAttribute('href') || '';
    const text = content || href;
    return `[${text}](${href})`; // Convert links to Markdown
  }
});

// Function to scrape content and convert it to Markdown
function scrapeContent() {
  const title = document.title || 'Untitled Page';
  const descriptionMeta = document.querySelector('meta[name="description"]');
  const description = descriptionMeta ? descriptionMeta.getAttribute('content') : '';

  // Add title and description to the final Markdown
  let markdown = `# ${title}\n\n`;
  if (description) {
    markdown += `> ${description}\n\n`;
  }

  // Remove irrelevant sections before converting to Markdown
  const adSections = document.querySelectorAll('.ad-banner, .sidebar'); // Add other selectors as needed
  adSections.forEach(section => section.remove());

  // Convert the remaining body content to Markdown
  const bodyContent = document.body.innerHTML;
  const markdownBody = turndownService.turndown(bodyContent);

  markdown += markdownBody;

  // Log the generated markdown to the console
  //1console.log("Generated Markdown: ", markdown);
   
  return markdown;
}

export { scrapeContent };