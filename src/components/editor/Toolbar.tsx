'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'

interface ToolbarProps {
  onNew: () => void
  onOpen: () => void
  onImport: () => void
  onDownload: () => void
  onToggleSource: () => void
  onToggleDOMTree: () => void
  onToggleStyles: () => void
  onToggleAttributes: () => void
  onToggleDiff: () => void
  onUndo: () => void
  onRedo: () => void
  isSourceMode: boolean
  isDOMTreeOpen: boolean
  isStylesOpen: boolean
  isAttributesOpen: boolean
  isDiffOpen: boolean
  userLimits: any
}

export default function Toolbar({
  onNew,
  onOpen,
  onImport,
  onDownload,
  onToggleSource,
  onToggleDOMTree,
  onToggleStyles,
  onToggleAttributes,
  onToggleDiff,
  onUndo,
  onRedo,
  isSourceMode,
  isDOMTreeOpen,
  isStylesOpen,
  isAttributesOpen,
  isDiffOpen,
  userLimits,
}: ToolbarProps) {
  const { data: session } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState<string | null>(null)

  const toggleMenu = (menu: string) => {
    setIsMenuOpen(isMenuOpen === menu ? null : menu)
  }

  const MenuItem = ({ 
    label, 
    onClick, 
    disabled = false, 
    isPro = false 
  }: { 
    label: string
    onClick: () => void
    disabled?: boolean
    isPro?: boolean
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed ${
        isPro && !userLimits?.canAccessDOMTree ? 'text-orange-600' : 'text-gray-700'
      }`}
      title={isPro && !userLimits?.canAccessDOMTree ? 'Pro feature - Upgrade to access' : ''}
    >
      {label}
      {isPro && !userLimits?.canAccessDOMTree && (
        <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-1 rounded">PRO</span>
      )}
    </button>
  )

  const MenuDropdown = ({ 
    label, 
    menuKey, 
    children 
  }: { 
    label: string
    menuKey: string
    children: React.ReactNode 
  }) => (
    <div className="relative">
      <button
        onClick={() => toggleMenu(menuKey)}
        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md"
      >
        {label}
      </button>
      {isMenuOpen === menuKey && (
        <div className="absolute left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            {children}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex items-center space-x-1">
        {/* File Menu */}
        <MenuDropdown label="File" menuKey="file">
          <MenuItem label="New" onClick={onNew} />
          <MenuItem label="Open File" onClick={onOpen} />
          <MenuItem label="Import HTML" onClick={onImport} />
          <hr className="my-1" />
          <MenuItem label="Download HTML" onClick={onDownload} />
        </MenuDropdown>

        {/* Edit Menu */}
        <MenuDropdown label="Edit" menuKey="edit">
          <MenuItem label="Undo" onClick={onUndo} />
          <MenuItem label="Redo" onClick={onRedo} />
        </MenuDropdown>

        {/* View Menu */}
        <MenuDropdown label="View" menuKey="view">
          <MenuItem 
            label={isSourceMode ? "Visual Editor" : "Source Code"}
            onClick={onToggleSource}
          />
          <hr className="my-1" />
          <MenuItem 
            label={isDOMTreeOpen ? "Hide DOM Tree" : "Show DOM Tree"}
            onClick={onToggleDOMTree}
            isPro={true}
            disabled={!userLimits?.canAccessDOMTree}
          />
          <MenuItem 
            label={isStylesOpen ? "Hide Styles Panel" : "Show Styles Panel"}
            onClick={onToggleStyles}
            isPro={true}
            disabled={!userLimits?.canEditAttributes}
          />
          <MenuItem 
            label={isAttributesOpen ? "Hide Attributes Panel" : "Show Attributes Panel"}
            onClick={onToggleAttributes}
            isPro={true}
            disabled={!userLimits?.canEditAttributes}
          />
          <MenuItem 
            label={isDiffOpen ? "Hide Diff" : "Show Diff"}
            onClick={onToggleDiff}
            isPro={true}
            disabled={!userLimits?.canUseDiff}
          />
        </MenuDropdown>

        {/* User Info */}
        <div className="flex-1"></div>
        <div className="flex items-center space-x-4">
          {session?.user ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {session.user.name}
              </span>
              <span className={`text-xs px-2 py-1 rounded ${
                userLimits?.canAccessDOMTree 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {userLimits?.canAccessDOMTree ? 'PRO' : 'FREE'}
              </span>
              <a 
                href="/account" 
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Account
              </a>
            </div>
          ) : (
            <a 
              href="/api/auth/signin" 
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Sign In
            </a>
          )}
        </div>
      </div>

      {/* Click outside to close menus */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsMenuOpen(null)}
        />
      )}
    </div>
  )
}