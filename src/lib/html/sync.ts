export interface EditorSyncManager {
  onWysiwygChange: (content: string, styles: string[]) => void
  onSourceChange: (content: string) => void
  getWysiwygContent: () => { html: string; styles: string[] }
  getSourceContent: () => string
  setContent: (html: string, styles?: string[]) => void
}

export class HTMLEditorSync {
  private wysiwygEditor: any
  private sourceEditor: any
  private lastWysiwygContent: string = ''
  private lastSourceContent: string = ''
  private syncTimeout: NodeJS.Timeout | null = null
  private isUpdating = false
  private syncDelay = 500 // ms

  constructor(wysiwygEditor?: any, sourceEditor?: any) {
    this.wysiwygEditor = wysiwygEditor
    this.sourceEditor = sourceEditor
  }

  setWysiwygEditor(editor: any) {
    this.wysiwygEditor = editor
    this.setupWysiwygListeners()
  }

  setSourceEditor(editor: any) {
    this.sourceEditor = editor
    this.setupSourceListeners()
  }

  private setupWysiwygListeners() {
    if (!this.wysiwygEditor) return

    // Listen for changes in GrapesJS
    this.wysiwygEditor.on('component:add component:remove component:update', () => {
      this.debouncedSyncFromWysiwyg()
    })

    this.wysiwygEditor.on('style:update', () => {
      this.debouncedSyncFromWysiwyg()
    })
  }

  private setupSourceListeners() {
    if (!this.sourceEditor) return

    // Listen for changes in Monaco editor
    this.sourceEditor.onDidChangeModelContent(() => {
      this.debouncedSyncFromSource()
    })
  }

  private debouncedSyncFromWysiwyg() {
    if (this.isUpdating) return

    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout)
    }

    this.syncTimeout = setTimeout(() => {
      this.syncFromWysiwyg()
    }, this.syncDelay)
  }

  private debouncedSyncFromSource() {
    if (this.isUpdating) return

    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout)
    }

    this.syncTimeout = setTimeout(() => {
      this.syncFromSource()
    }, this.syncDelay)
  }

  private syncFromWysiwyg() {
    if (!this.wysiwygEditor || !this.sourceEditor || this.isUpdating) return

    try {
      this.isUpdating = true

      // Get content from GrapesJS
      const htmlContent = this.wysiwygEditor.getHtml()
      const cssContent = this.wysiwygEditor.getCss()

      // Build complete HTML document
      const fullHTML = this.buildCompleteHTML(htmlContent, cssContent)

      // Update source editor if content changed
      if (fullHTML !== this.lastSourceContent) {
        this.sourceEditor.setValue(fullHTML)
        this.lastSourceContent = fullHTML
        this.lastWysiwygContent = htmlContent
      }
    } catch (error) {
      console.error('Error syncing from WYSIWYG to source:', error)
    } finally {
      this.isUpdating = false
    }
  }

  private syncFromSource() {
    if (!this.wysiwygEditor || !this.sourceEditor || this.isUpdating) return

    try {
      this.isUpdating = true

      const sourceContent = this.sourceEditor.getValue()

      // Update WYSIWYG editor if content changed
      if (sourceContent !== this.lastSourceContent) {
        this.updateWysiwygFromSource(sourceContent)
        this.lastSourceContent = sourceContent
      }
    } catch (error) {
      console.error('Error syncing from source to WYSIWYG:', error)
    } finally {
      this.isUpdating = false
    }
  }

  private updateWysiwygFromSource(htmlContent: string) {
    try {
      // Parse the HTML to extract head and body content
      const parser = new DOMParser()
      const doc = parser.parseFromString(htmlContent, 'text/html')

      // Extract body content for GrapesJS
      const bodyHTML = doc.body?.innerHTML || ''

      // Extract CSS from style tags
      const styleElements = doc.querySelectorAll('style')
      let css = ''
      styleElements.forEach(style => {
        css += style.textContent || ''
      })

      // Update GrapesJS content
      if (this.wysiwygEditor) {
        this.wysiwygEditor.setComponents(bodyHTML)
        if (css) {
          this.wysiwygEditor.setStyle(css)
        }
        this.lastWysiwygContent = bodyHTML
      }
    } catch (error) {
      console.error('Error updating WYSIWYG from source:', error)
    }
  }

  private buildCompleteHTML(bodyHTML: string, css: string): string {
    const head = `<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>${css ? `
    <style>
${css}
    </style>` : ''}
</head>`

    return `<!DOCTYPE html>
<html lang="en">
${head}
<body>
${bodyHTML}
</body>
</html>`
  }

  public setInitialContent(html: string, css?: string) {
    if (this.wysiwygEditor) {
      // Parse HTML to get body content
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')
      const bodyHTML = doc.body?.innerHTML || html

      this.wysiwygEditor.setComponents(bodyHTML)
      if (css) {
        this.wysiwygEditor.setStyle(css)
      }
    }

    if (this.sourceEditor) {
      this.sourceEditor.setValue(html)
    }

    this.lastWysiwygContent = html
    this.lastSourceContent = html
  }

  public getCurrentContent(): { html: string; css: string; fullHTML: string } {
    let html = ''
    let css = ''

    if (this.wysiwygEditor) {
      html = this.wysiwygEditor.getHtml()
      css = this.wysiwygEditor.getCss()
    }

    const fullHTML = this.buildCompleteHTML(html, css)

    return { html, css, fullHTML }
  }

  public dispose() {
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout)
    }
  }
}