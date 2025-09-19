'use client'

import { useEffect, useRef, useCallback } from 'react'
import grapesjs from 'grapesjs'
import 'grapesjs/dist/css/grapes.min.css'

// Import GrapesJS plugins
import gjsPresetWebpage from 'grapesjs-preset-webpage'
import gjsBlocksBasic from 'grapesjs-blocks-basic'
import gjsPluginForms from 'grapesjs-plugin-forms'
import gjsPluginExport from 'grapesjs-plugin-export'

interface EditorCanvasProps {
  onEditorReady: (editor: any) => void
  isDOMTreeOpen: boolean
  isStylesOpen: boolean
  isAttributesOpen: boolean
  userLimits: any
  className?: string
}

export default function EditorCanvas({
  onEditorReady,
  isDOMTreeOpen,
  isStylesOpen,
  isAttributesOpen,
  userLimits,
  className = '',
}: EditorCanvasProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const grapesRef = useRef<any>(null)

  const initEditor = useCallback(() => {
    if (!editorRef.current) return

    // Clean up existing editor
    if (grapesRef.current) {
      grapesRef.current.destroy()
    }

    const editor = grapesjs.init({
      container: editorRef.current,
      height: '100%',
      width: '100%',
      plugins: [
        gjsPresetWebpage,
        gjsBlocksBasic,
        gjsPluginForms,
        gjsPluginExport,
      ],
      pluginsOpts: {
        'grapesjs-preset-webpage': {
          blocks: ['link-block', 'quote', 'text-basic'],
        },
      },
      storageManager: false,
      blockManager: {
        appendTo: '.blocks-container',
      },
      layerManager: {
        appendTo: '.layers-container',
      },
      selectorManager: {
        appendTo: '.styles-container',
      },
      styleManager: {
        appendTo: '.styles-container',
      },
      traitManager: {
        appendTo: '.traits-container',
      },
    })

    // Customize toolbar
    const panelManager = editor.Panels
    
    // Remove default panels that we handle with custom toolbar
    panelManager.removePanel('commands')
    panelManager.removePanel('options')
    panelManager.removePanel('views')

    // Add custom commands
    editor.Commands.add('toggle-layers', {
      run: (editor) => {
        const layersPanel = document.querySelector('.layers-container')
        if (layersPanel) {
          layersPanel.parentElement!.style.display = 
            layersPanel.parentElement!.style.display === 'none' ? 'block' : 'none'
        }
      },
    })

    // Set initial content
    editor.setComponents(`
      <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold mb-6">Welcome to HTML Editor</h1>
        <p class="text-lg text-gray-600 mb-4">
          Start creating your HTML content here. You can drag and drop components 
          from the left panel or edit this text directly.
        </p>
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p class="text-blue-800">
            This is a sample content block. Click to edit or select it to see 
            styling options in the right panel.
          </p>
        </div>
      </div>
    `)

    editor.setStyle(`
      .container {
        max-width: 1200px;
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        margin: 0;
        padding: 0;
        line-height: 1.6;
        color: #333;
      }
    `)

    grapesRef.current = editor
    onEditorReady(editor)

    return editor
  }, [onEditorReady])

  useEffect(() => {
    const editor = initEditor()
    
    return () => {
      if (editor) {
        editor.destroy()
      }
    }
  }, [initEditor])

  // Update panel visibility based on props
  useEffect(() => {
    if (!grapesRef.current) return

    const layersContainer = document.querySelector('.layers-container')?.parentElement
    const stylesContainer = document.querySelector('.styles-container')?.parentElement  
    const traitsContainer = document.querySelector('.traits-container')?.parentElement

    if (layersContainer) {
      layersContainer.style.display = isDOMTreeOpen && userLimits?.canAccessDOMTree ? 'block' : 'none'
    }
    
    if (stylesContainer) {
      stylesContainer.style.display = isStylesOpen && userLimits?.canEditAttributes ? 'block' : 'none'
    }
    
    if (traitsContainer) {
      traitsContainer.style.display = isAttributesOpen && userLimits?.canEditAttributes ? 'block' : 'none'
    }
  }, [isDOMTreeOpen, isStylesOpen, isAttributesOpen, userLimits])

  return (
    <div className={`flex h-full ${className}`}>
      {/* Left Panel - Blocks */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 overflow-auto">
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Components</h3>
          <div className="blocks-container"></div>
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 relative">
        <div ref={editorRef} className="h-full" />
      </div>

      {/* Right Panel - Layers, Styles, Traits */}
      <div className="w-80 bg-gray-50 border-l border-gray-200 overflow-auto">
        <div className="panel__right">
          {/* DOM Tree / Layers */}
          {isDOMTreeOpen && userLimits?.canAccessDOMTree && (
            <div className="border-b border-gray-200">
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">DOM Tree</h3>
                <div className="layers-container"></div>
              </div>
            </div>
          )}

          {/* Styles Panel */}
          {isStylesOpen && userLimits?.canEditAttributes && (
            <div className="border-b border-gray-200">
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Styles</h3>
                <div className="styles-container"></div>
              </div>
            </div>
          )}

          {/* Attributes Panel */}
          {isAttributesOpen && userLimits?.canEditAttributes && (
            <div className="border-b border-gray-200">
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Attributes</h3>
                <div className="traits-container"></div>
              </div>
            </div>
          )}

          {/* Pro features locked message */}
          {(!userLimits?.canAccessDOMTree || !userLimits?.canEditAttributes) && (
            <div className="p-4 text-center">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm text-orange-800 mb-2">
                  Advanced editing features are available with Pro
                </p>
                <a 
                  href="/upgrade" 
                  className="text-sm text-orange-600 hover:text-orange-800 underline"
                >
                  Upgrade to Pro
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}