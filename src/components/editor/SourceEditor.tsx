'use client'

import { useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'

interface SourceEditorProps {
  value: string
  onChange: (value: string) => void
  onEditorReady: (editor: any) => void
  isDiffMode?: boolean
  originalValue?: string
  userLimits: any
  className?: string
}

export default function SourceEditor({
  value,
  onChange,
  onEditorReady,
  isDiffMode = false,
  originalValue = '',
  userLimits,
  className = '',
}: SourceEditorProps) {
  const editorRef = useRef<any>(null)
  const diffEditorRef = useRef<any>(null)

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor
    onEditorReady(editor)

    // Configure HTML language features
    monaco.languages.html.htmlDefaults.setOptions({
      format: {
        tabSize: 2,
        insertSpaces: true,
        wrapLineLength: 120,
        unformatted: 'default": "a,abbr,acronym,b,bdo,big,br,button,cite,code,dfn,em,i,kbd,label,map,object,q,samp,small,span,strong,sub,sup,textarea,tt,var',
        indentInnerHtml: true,
        preserveNewLines: true,
        maxPreserveNewLines: 2,
        indentHandlebars: false,
        endWithNewline: false,
        extraLiners: 'head,body,/html',
        wrapAttributes: 'auto'
      },
      suggest: {
        html5: true,
      },
      validate: true,
    })

    // Add custom HTML snippets for better editing
    monaco.languages.registerCompletionItemProvider('html', {
      provideCompletionItems: (model: any, position: any) => {
        const suggestions = [
          {
            label: 'html5-template',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              '<!DOCTYPE html>',
              '<html lang="en">',
              '<head>',
              '    <meta charset="UTF-8">',
              '    <meta name="viewport" content="width=device-width, initial-scale=1.0">',
              '    <title>$1</title>',
              '</head>',
              '<body>',
              '    $2',
              '</body>',
              '</html>',
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'HTML5 template',
          },
          {
            label: 'div-container',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '<div class="$1">$2</div>',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Div with class',
          },
        ]
        return { suggestions }
      },
    })

    // Format document shortcut
    editor.addAction({
      id: 'format-document',
      label: 'Format Document',
      keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF,
      ],
      run: () => {
        editor.trigger('', 'editor.action.formatDocument', {})
      },
    })
  }

  const handleDiffEditorDidMount = (diffEditor: any, monaco: any) => {
    diffEditorRef.current = diffEditor
    onEditorReady(diffEditor)
  }

  if (!userLimits?.canUseDiff && isDiffMode) {
    return (
      <div className={`flex items-center justify-center h-full bg-gray-50 ${className}`}>
        <div className="text-center p-8">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-medium text-orange-800 mb-2">Pro Feature</h3>
            <p className="text-orange-700 mb-4">
              Diff view is available with Pro subscription
            </p>
            <a 
              href="/upgrade"
              className="inline-block bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
            >
              Upgrade to Pro
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (isDiffMode && userLimits?.canUseDiff) {
    return (
      <div className={`h-full ${className}`}>
        <div className="bg-gray-100 border-b border-gray-300 px-4 py-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-700">
              Diff View - Compare Changes (Simplified)
            </h3>
            <div className="text-xs text-gray-500">
              Showing current version only - full diff coming soon
            </div>
          </div>
        </div>
        <Editor
          height="100%"
          language="html"
          theme="vs"
          value={value}
          onChange={(newValue) => onChange(newValue || '')}
          onMount={handleEditorDidMount}
          options={{
            readOnly: false,
            minimap: { enabled: false },
            wordWrap: 'on',
            lineNumbers: 'on',
            folding: true,
            automaticLayout: true,
          }}
        />
      </div>
    )
  }

  return (
    <div className={`h-full ${className}`}>
      <div className="bg-gray-100 border-b border-gray-300 px-4 py-2">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-700">HTML Source Code</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => editorRef.current?.trigger('', 'editor.action.formatDocument', {})}
              className="text-xs text-gray-600 hover:text-gray-900 bg-gray-200 px-2 py-1 rounded"
            >
              Format (Ctrl+Shift+F)
            </button>
            <button
              onClick={() => editorRef.current?.trigger('', 'editor.action.quickCommand', {})}
              className="text-xs text-gray-600 hover:text-gray-900 bg-gray-200 px-2 py-1 rounded"
            >
              Command Palette (Ctrl+Shift+P)
            </button>
          </div>
        </div>
      </div>
      <Editor
        height="100%"
        language="html"
        theme="vs"
        value={value}
        onChange={(newValue) => onChange(newValue || '')}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          wordWrap: 'on',
          lineNumbers: 'on',
          folding: true,
          tabSize: 2,
          insertSpaces: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  )
}