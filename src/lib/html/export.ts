import DOMPurify from 'dompurify'
import { SanitizationOptions, createSanitizationConfig } from './import'

export interface ExportOptions extends SanitizationOptions {
  inlineCSS?: boolean
  formatHTML?: boolean
  includeComments?: boolean
}

export function exportHTML(
  htmlContent: string,
  styles: string[] = [],
  options: ExportOptions = {}
): string {
  try {
    // Parse the HTML
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlContent, 'text/html')
    
    // Process styles
    if (styles.length > 0) {
      const head = doc.head || doc.createElement('head')
      if (!doc.head) {
        doc.documentElement.insertBefore(head, doc.body)
      }
      
      // Remove existing style tags if we're replacing them
      const existingStyles = head.querySelectorAll('style')
      existingStyles.forEach(style => style.remove())
      
      // Add new styles
      styles.forEach(styleContent => {
        if (styleContent.trim()) {
          const styleElement = doc.createElement('style')
          styleElement.textContent = styleContent
          head.appendChild(styleElement)
        }
      })
    }
    
    // Inline CSS if requested (Pro feature)
    if (options.inlineCSS) {
      inlineCSS(doc)
    }
    
    // Get the final HTML
    let finalHTML = doc.documentElement.outerHTML
    
    // Add DOCTYPE if missing
    if (!finalHTML.toLowerCase().includes('<!doctype')) {
      finalHTML = '<!DOCTYPE html>\n' + finalHTML
    }
    
    // Format HTML if requested
    if (options.formatHTML) {
      finalHTML = formatHTML(finalHTML)
    }
    
    // Final sanitization
    const config = createSanitizationConfig(options)
    if (typeof window !== 'undefined') {
      finalHTML = String(DOMPurify.sanitize(finalHTML, config))
    }
    
    return finalHTML
    
  } catch (error) {
    console.error('Export error:', error)
    throw new Error('Failed to export HTML')
  }
}

function inlineCSS(doc: Document): void {
  // This is a basic implementation - in production, you might want to use a library like 'inline-css'
  const styleSheets = doc.querySelectorAll('style')
  const cssRules: { selector: string; rules: string }[] = []
  
  // Extract CSS rules
  styleSheets.forEach(styleSheet => {
    const content = styleSheet.textContent || ''
    const rules = parseCSSRules(content)
    cssRules.push(...rules)
  })
  
  // Apply rules to elements
  cssRules.forEach(rule => {
    try {
      const elements = doc.querySelectorAll(rule.selector)
      elements.forEach(element => {
        const currentStyle = (element as HTMLElement).style.cssText
        const newStyle = currentStyle ? `${currentStyle}; ${rule.rules}` : rule.rules
        ;(element as HTMLElement).style.cssText = newStyle
      })
    } catch (error) {
      // Ignore invalid selectors
    }
  })
  
  // Remove style tags after inlining
  styleSheets.forEach(styleSheet => styleSheet.remove())
}

function parseCSSRules(css: string): { selector: string; rules: string }[] {
  const rules: { selector: string; rules: string }[] = []
  
  // Simple CSS parser - this could be improved with a proper CSS parser
  const ruleRegex = /([^{]+)\{([^}]+)\}/g
  let match
  
  while ((match = ruleRegex.exec(css)) !== null) {
    const selector = match[1].trim()
    const declarations = match[2].trim()
    
    if (selector && declarations) {
      rules.push({ selector, rules: declarations })
    }
  }
  
  return rules
}

function formatHTML(html: string): string {
  // Basic HTML formatting - could be improved with a proper formatter
  let formatted = html
  
  // Add newlines after closing tags
  formatted = formatted.replace(/></g, '>\n<')
  
  // Basic indentation
  const lines = formatted.split('\n')
  let indentLevel = 0
  const indentSize = 2
  
  const formattedLines = lines.map(line => {
    const trimmed = line.trim()
    if (!trimmed) return ''
    
    // Decrease indent for closing tags
    if (trimmed.startsWith('</') && !trimmed.includes('/>')) {
      indentLevel = Math.max(0, indentLevel - 1)
    }
    
    const indented = ' '.repeat(indentLevel * indentSize) + trimmed
    
    // Increase indent for opening tags (but not self-closing or closing tags)
    if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.includes('/>') && !trimmed.includes('<!')) {
      indentLevel++
    }
    
    return indented
  })
  
  return formattedLines.join('\n')
}

export function downloadHTML(content: string, filename: string = 'document.html'): void {
  if (typeof window === 'undefined') return
  
  const blob = new Blob([content], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.html') ? filename : `${filename}.html`
  
  // Append to body, click, and remove
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  // Clean up
  URL.revokeObjectURL(url)
}