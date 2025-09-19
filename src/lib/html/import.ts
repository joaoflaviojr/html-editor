import DOMPurify from 'dompurify'

export interface SanitizationOptions {
  preserveScripts?: boolean
  allowDataAttributes?: boolean
  allowStyles?: boolean
}

export interface ParsedHTML {
  html: string
  head: string
  body: string
  styles: string[]
  links: string[]
  scripts: string[]
  title: string
}

export function createSanitizationConfig(options: SanitizationOptions = {}) {
  const config: any = {
    ALLOWED_TAGS: [
      'html', 'head', 'body', 'title', 'meta', 'link', 'style',
      'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'a', 'img', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th',
      'thead', 'tbody', 'form', 'input', 'textarea', 'select', 'option',
      'button', 'section', 'article', 'header', 'footer', 'nav', 'main',
      'aside', 'br', 'hr', 'strong', 'em', 'b', 'i', 'u', 'small',
      'blockquote', 'pre', 'code', 'iframe', 'video', 'audio', 'source'
    ],
    ALLOWED_ATTR: [
      'id', 'class', 'style', 'src', 'href', 'alt', 'title', 'width', 'height',
      'type', 'name', 'value', 'placeholder', 'required', 'disabled',
      'target', 'rel', 'role', 'aria-*', 'tabindex'
    ],
    ALLOW_DATA_ATTR: options.allowDataAttributes !== false,
    FORBID_TAGS: options.preserveScripts ? [] : ['script'],
    FORBID_ATTR: options.preserveScripts ? [] : ['on*']
  }

  return config
}

export function parseHTMLStructure(htmlContent: string): ParsedHTML {
  // Create a DOM parser
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlContent, 'text/html')

  // Extract components
  const htmlElement = doc.documentElement
  const head = doc.head
  const body = doc.body
  
  // Extract styles
  const styleElements = Array.from(head?.querySelectorAll('style') || [])
  const styles = styleElements.map(style => style.innerHTML)
  
  // Extract link stylesheets
  const linkElements = Array.from(head?.querySelectorAll('link[rel="stylesheet"]') || [])
  const links = linkElements.map(link => link.getAttribute('href')).filter(Boolean) as string[]
  
  // Extract scripts
  const scriptElements = Array.from(doc.querySelectorAll('script') || [])
  const scripts = scriptElements.map(script => script.innerHTML || script.src).filter(Boolean)
  
  // Get title
  const title = head?.querySelector('title')?.textContent || 'Untitled'

  return {
    html: htmlElement.outerHTML,
    head: head?.outerHTML || '',
    body: body?.outerHTML || '',
    styles,
    links,
    scripts,
    title
  }
}

export function sanitizeHTML(
  htmlContent: string, 
  options: SanitizationOptions = {}
): string {
  // Configure DOMPurify
  const config = createSanitizationConfig(options)
  
  // Create a clean version for browser environment
  if (typeof window !== 'undefined') {
    return DOMPurify.sanitize(htmlContent, config)
  }
  
  // For server-side, we'll need to use a server-safe version
  // For now, return the content as-is (implement server-side sanitization as needed)
  return htmlContent
}

export function importHTMLForEditor(
  htmlContent: string,
  options: SanitizationOptions = {}
): ParsedHTML {
  // First sanitize
  const sanitized = sanitizeHTML(htmlContent, options)
  
  // Then parse
  return parseHTMLStructure(sanitized)
}

export const defaultHTMLTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Untitled Document</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <h1>Welcome to Your HTML Document</h1>
    <p>Start editing your content here...</p>
</body>
</html>`