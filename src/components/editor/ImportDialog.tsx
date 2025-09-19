'use client'

import { useState, useRef } from 'react'
import { defaultHTMLTemplate } from '@/lib/html/import'

interface ImportDialogProps {
  isOpen: boolean
  onClose: () => void
  onImport: (html: string, filename?: string) => void
  userLimits: any
}

export default function ImportDialog({
  isOpen,
  onClose,
  onImport,
  userLimits,
}: ImportDialogProps) {
  const [activeTab, setActiveTab] = useState<'file' | 'paste' | 'new'>('new')
  const [pastedHTML, setPastedHTML] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileUpload = (file: File) => {
    if (!file) return

    // Check file size
    if (file.size > userLimits.maxFileSize) {
      alert(`File size (${(file.size / 1024).toFixed(1)} KB) exceeds limit (${(userLimits.maxFileSize / 1024).toFixed(1)} KB). ${
        userLimits.maxFileSize < 1024 * 1024 ? 'Upgrade to Pro for larger files.' : ''
      }`)
      return
    }

    // Check file type
    if (!file.name.toLowerCase().endsWith('.html') && file.type !== 'text/html') {
      alert('Please select an HTML file (.html)')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      if (content) {
        onImport(content, file.name)
        onClose()
      }
    }
    reader.readAsText(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    const htmlFile = files.find(file => 
      file.name.toLowerCase().endsWith('.html') || file.type === 'text/html'
    )
    
    if (htmlFile) {
      handleFileUpload(htmlFile)
    } else {
      alert('Please drop an HTML file')
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handlePasteImport = () => {
    if (!pastedHTML.trim()) {
      alert('Please paste some HTML content')
      return
    }
    
    // Check content size
    const contentSize = new Blob([pastedHTML]).size
    if (contentSize > userLimits.maxFileSize) {
      alert(`Content size (${(contentSize / 1024).toFixed(1)} KB) exceeds limit (${(userLimits.maxFileSize / 1024).toFixed(1)} KB). ${
        userLimits.maxFileSize < 1024 * 1024 ? 'Upgrade to Pro for larger content.' : ''
      }`)
      return
    }

    onImport(pastedHTML, 'pasted-content.html')
    onClose()
  }

  const handleNewDocument = () => {
    onImport(defaultHTMLTemplate, 'new-document.html')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Import HTML</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { key: 'new', label: 'New Document' },
              { key: 'file', label: 'Upload File' },
              { key: 'paste', label: 'Paste HTML' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto">
          {activeTab === 'new' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Create New HTML Document
                </h3>
                <p className="text-gray-600 mb-4">
                  Start with a clean HTML5 template with basic structure and styling.
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded p-4">
                  <pre className="text-sm text-gray-700 overflow-auto">
                    {defaultHTMLTemplate.substring(0, 300)}...
                  </pre>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleNewDocument}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Create New Document
                </button>
              </div>
            </div>
          )}

          {activeTab === 'file' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Upload HTML File
                </h3>
                <p className="text-gray-600 mb-4">
                  Upload an existing HTML file from your computer. 
                  Maximum size: {(userLimits.maxFileSize / 1024).toFixed(0)} KB
                  {userLimits.maxFileSize < 1024 * 1024 && (
                    <span className="text-orange-600 ml-2">
                      (Upgrade to Pro for 5MB limit)
                    </span>
                  )}
                </p>
              </div>

              {/* Drag and Drop Area */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="space-y-2">
                  <div className="text-gray-400 text-4xl">📄</div>
                  <div>
                    <p className="text-lg font-medium text-gray-700">
                      Drop your HTML file here
                    </p>
                    <p className="text-gray-500">or</p>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
                  >
                    Choose File
                  </button>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".html,text/html"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file)
                }}
                className="hidden"
              />
            </div>
          )}

          {activeTab === 'paste' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Paste HTML Content
                </h3>
                <p className="text-gray-600 mb-4">
                  Paste your HTML code directly into the text area below.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  HTML Content
                </label>
                <textarea
                  value={pastedHTML}
                  onChange={(e) => setPastedHTML(e.target.value)}
                  placeholder="Paste your HTML content here..."
                  className="w-full h-64 p-3 border border-gray-300 rounded-md font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Size limit: {(userLimits.maxFileSize / 1024).toFixed(0)} KB
                  {pastedHTML && (
                    <span className="ml-2">
                      Current: {(new Blob([pastedHTML]).size / 1024).toFixed(1)} KB
                    </span>
                  )}
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setPastedHTML('')}
                  className="text-gray-600 px-4 py-2 rounded-md hover:bg-gray-100"
                >
                  Clear
                </button>
                <button
                  onClick={handlePasteImport}
                  disabled={!pastedHTML.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Import HTML
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}