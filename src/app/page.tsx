'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Toolbar from '@/components/editor/Toolbar'
import EditorCanvas from '@/components/editor/EditorCanvas'
import SourceEditor from '@/components/editor/SourceEditor'
import ImportDialog from '@/components/editor/ImportDialog'
import { HTMLEditorSync } from '@/lib/html/sync'
import { importHTMLForEditor, defaultHTMLTemplate } from '@/lib/html/import'
import { exportHTML, downloadHTML } from '@/lib/html/export'
import { FeatureGate, UsageLimitWarning } from '@/components/ui/Paywall'

interface UserLimits {
  maxFileSize: number
  maxDailyDownloads: number
  canAccessDOMTree: boolean
  canEditAttributes: boolean
  canUseDiff: boolean
  canInlineCSS: boolean
  canPreserveScripts: boolean
}

export default function Home() {
  const { data: session } = useSession()
  
  // Editor state
  const [grapesjsEditor, setGrapesjsEditor] = useState<any>(null)
  const [monacoEditor, setMonacoEditor] = useState<any>(null)
  const [syncManager, setSyncManager] = useState<HTMLEditorSync | null>(null)
  
  // UI state
  const [isSourceMode, setIsSourceMode] = useState(false)
  const [isDOMTreeOpen, setIsDOMTreeOpen] = useState(false)
  const [isStylesOpen, setIsStylesOpen] = useState(false)
  const [isAttributesOpen, setIsAttributesOpen] = useState(false)
  const [isDiffOpen, setIsDiffOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  
  // Content state
  const [currentHTML, setCurrentHTML] = useState('')
  const [originalHTML, setOriginalHTML] = useState('')
  const [currentFilename, setCurrentFilename] = useState('document.html')
  
  // User limits
  const [userLimits, setUserLimits] = useState<UserLimits>({
    maxFileSize: 100 * 1024, // 100KB for free
    maxDailyDownloads: 2,
    canAccessDOMTree: false,
    canEditAttributes: false,
    canUseDiff: false,
    canInlineCSS: false,
    canPreserveScripts: false,
  })

  // Fetch user subscription status
  useEffect(() => {
    const fetchUserLimits = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/subscription/status')
          if (response.ok) {
            const data = await response.json()
            setUserLimits(data.limits)
          }
        } catch (error) {
          console.error('Failed to fetch user limits:', error)
        }
      }
    }

    fetchUserLimits()
  }, [session])

  // Initialize sync manager when both editors are ready
  useEffect(() => {
    if (grapesjsEditor && monacoEditor) {
      const sync = new HTMLEditorSync()
      sync.setWysiwygEditor(grapesjsEditor)
      sync.setSourceEditor(monacoEditor)
      setSyncManager(sync)

      return () => {
        sync.dispose()
      }
    }
  }, [grapesjsEditor, monacoEditor])

  // Initialize with default template
  useEffect(() => {
    if (syncManager) {
      syncManager.setInitialContent(defaultHTMLTemplate)
      setCurrentHTML(defaultHTMLTemplate)
      setOriginalHTML(defaultHTMLTemplate)
    }
  }, [syncManager])

  const handleEditorReady = (editor: any) => {
    setGrapesjsEditor(editor)
  }

  const handleSourceEditorReady = (editor: any) => {
    setMonacoEditor(editor)
  }

  const handleSourceChange = useCallback((value: string) => {
    setCurrentHTML(value)
  }, [])

  // Toolbar handlers
  const handleNew = () => {
    if (syncManager) {
      syncManager.setInitialContent(defaultHTMLTemplate)
      setCurrentHTML(defaultHTMLTemplate)
      setOriginalHTML(defaultHTMLTemplate)
      setCurrentFilename('new-document.html')
    }
  }

  const handleOpen = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.html'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        handleFileImport(file)
      }
    }
    input.click()
  }

  const handleFileImport = (file: File) => {
    if (file.size > userLimits.maxFileSize) {
      alert(`File size exceeds limit of ${(userLimits.maxFileSize / 1024).toFixed(0)} KB`)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      if (content) {
        handleImport(content, file.name)
      }
    }
    reader.readAsText(file)
  }

  const handleImport = (html: string, filename?: string) => {
    try {
      // Sanitize and parse the HTML
      const parsed = importHTMLForEditor(html, {
        preserveScripts: userLimits.canPreserveScripts,
      })

      if (syncManager) {
        syncManager.setInitialContent(parsed.html, parsed.styles.join('\n'))
        setCurrentHTML(parsed.html)
        setOriginalHTML(parsed.html)
        setCurrentFilename(filename || 'imported-document.html')
      }

      // Log the import
      if (session?.user?.id) {
        fetch('/api/usage/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'import',
            fileSize: new Blob([html]).size,
          }),
        })
      }
    } catch (error) {
      console.error('Import failed:', error)
      alert('Failed to import HTML. Please check the file format.')
    }
  }

  const handleDownload = async () => {
    try {
      // Check download limits
      if (session?.user?.id) {
        const response = await fetch('/api/usage/check-download')
        if (!response.ok) {
          const data = await response.json()
          alert(data.error || 'Download limit exceeded')
          return
        }
      }

      if (syncManager) {
        const content = syncManager.getCurrentContent()
        const exportedHTML = exportHTML(content.fullHTML, [], {
          preserveScripts: userLimits.canPreserveScripts,
          inlineCSS: userLimits.canInlineCSS && false, // TODO: Add UI toggle
        })

        downloadHTML(exportedHTML, currentFilename)

        // Log the download
        if (session?.user?.id) {
          fetch('/api/usage/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'download',
              fileSize: new Blob([exportedHTML]).size,
            }),
          })
        }
      }
    } catch (error) {
      console.error('Download failed:', error)
      alert('Failed to download file')
    }
  }

  const handleUndo = () => {
    grapesjsEditor?.UndoManager?.undo()
  }

  const handleRedo = () => {
    grapesjsEditor?.UndoManager?.redo()
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">HTML Editor Pro</h1>
          <p className="text-gray-600 mb-6">
            Sign in to start creating and editing HTML documents with our powerful online editor.
          </p>
          <a
            href="/api/auth/signin"
            className="inline-block w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Sign In with Google
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Toolbar */}
      <Toolbar
        onNew={handleNew}
        onOpen={handleOpen}
        onImport={() => setIsImportDialogOpen(true)}
        onDownload={handleDownload}
        onToggleSource={() => setIsSourceMode(!isSourceMode)}
        onToggleDOMTree={() => setIsDOMTreeOpen(!isDOMTreeOpen)}
        onToggleStyles={() => setIsStylesOpen(!isStylesOpen)}
        onToggleAttributes={() => setIsAttributesOpen(!isAttributesOpen)}
        onToggleDiff={() => setIsDiffOpen(!isDiffOpen)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        isSourceMode={isSourceMode}
        isDOMTreeOpen={isDOMTreeOpen}
        isStylesOpen={isStylesOpen}
        isAttributesOpen={isAttributesOpen}
        isDiffOpen={isDiffOpen}
        userLimits={userLimits}
      />

      {/* Usage warnings */}
      {currentHTML && (
        <div className="px-4 py-2">
          <UsageLimitWarning
            currentUsage={new Blob([currentHTML]).size}
            limit={userLimits.maxFileSize}
            type="fileSize"
          />
        </div>
      )}

      {/* Main Editor Area */}
      <div className="flex-1 overflow-hidden">
        {isSourceMode ? (
          <SourceEditor
            value={currentHTML}
            onChange={handleSourceChange}
            onEditorReady={handleSourceEditorReady}
            isDiffMode={isDiffOpen}
            originalValue={originalHTML}
            userLimits={userLimits}
          />
        ) : (
          <EditorCanvas
            onEditorReady={handleEditorReady}
            isDOMTreeOpen={isDOMTreeOpen}
            isStylesOpen={isStylesOpen}
            isAttributesOpen={isAttributesOpen}
            userLimits={userLimits}
          />
        )}
      </div>

      {/* Import Dialog */}
      <ImportDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onImport={handleImport}
        userLimits={userLimits}
      />
    </div>
  )
}