import React, { useState, useEffect } from 'react'
import { WindowDecorations } from './components/window-decorations'
import { Input } from './components/ui/input' // Assuming Input component path
import { Button } from './components/ui/button' // Assuming Button component path
import { Search, Cog, Shield, Bell, Info } from 'lucide-react' // Example icons

// Match the main window's decoration style
const DECORATION_TYPE: 'macos' | 'windows' | 'windows11' = 'macos'
const DECORATION_POSITION: 'left' | 'right' = 'left'

interface SettingsCategory {
  id: string
  name: string
  icon: React.ElementType
  content: React.ReactNode | ((info: AppVersionInfo | null) => React.ReactNode)
}

import GeneralSettingsPage from './pages/settings/GeneralSettingsPage'
import SecuritySettingsPage from './pages/settings/SecuritySettingsPage'
import NotificationsSettingsPage from './pages/settings/NotificationsSettingsPage'
import AboutSettingsPage, { AppVersionInfo } from './pages/settings/AboutSettingsPage'

const settingsCategoriesData = (appInfo: AppVersionInfo | null): SettingsCategory[] => [
  {
    id: 'general',
    name: 'General',
    icon: Cog,
    content: <GeneralSettingsPage />
  },
  {
    id: 'security',
    name: 'Security & Privacy',
    icon: Shield,
    content: <SecuritySettingsPage />
  },
  {
    id: 'notifications',
    name: 'Notifications',
    icon: Bell,
    content: <NotificationsSettingsPage />
  },
  {
    id: 'about',
    name: 'About',
    icon: Info,
    content: <AboutSettingsPage info={appInfo} />
  }
]

const SettingsApp: React.FC = () => {
  const [appInfo, setAppInfo] = useState<AppVersionInfo | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>(settingsCategoriesData(null)[0].id)
  const [searchTerm, setSearchTerm] = useState<string>('')

  useEffect(() => {
    const fetchAppInfo = async (): Promise<void> => {
      try {
        const info = await window.api.getAppVersionInfo()
        setAppInfo(info)
      } catch (error) {
        console.error('Failed to fetch app version info:', error)
        // Optionally set some default/error state for appInfo
      }
    }
    fetchAppInfo()
  }, [])

  const currentSettingsCategories = settingsCategoriesData(appInfo)

  const handleCategoryClick = (categoryId: string): void => {
    setActiveCategory(categoryId)
  }

  const filteredCategories = currentSettingsCategories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const currentCategory = currentSettingsCategories.find((cat) => cat.id === activeCategory)

  return (
    <>
      {/* Draggable title bar area */}
      <div
        className="fixed top-0 left-0 w-full h-8 flex items-center px-2 z-50 bg-sidebar" // Added z-50
        style={{ WebkitAppRegion: 'drag', userSelect: 'none' } as React.CSSProperties}
      >
        {/* Window Decorations */}
        <div style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <WindowDecorations
            type={DECORATION_TYPE}
            position={DECORATION_POSITION}
            targetWindow="settings"
          />
        </div>
      </div>

      {/* Main content area, below the custom title bar */}
      <div className="pt-8 h-screen flex text-foreground bg-sidebar">
        {/* Sidebar */}
        <div className="w-64 h-full text-card-foreground p-4 space-y-4 border-r border-border bg-sidebar">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search settings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10" // Added padding for icon
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          <nav className="space-y-1">
            {filteredCategories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => handleCategoryClick(category.id)}
              >
                <category.icon className="mr-2 h-4 w-4" />
                {category.name}
              </Button>
            ))}
            {filteredCategories.length === 0 && (
              <p className="text-sm text-muted-foreground text-center">No results found.</p>
            )}
          </nav>
        </div>

        {/* Settings Content Area */}
        <div className="flex-1 p-6 overflow-y-auto bg-sidebar">
          {currentCategory ? (
            <>
              <h1 className="text-2xl font-semibold mb-6">{currentCategory.name}</h1>
              <div>
                {typeof currentCategory.content === 'function'
                  ? currentCategory.content(appInfo)
                  : currentCategory.content}
              </div>
            </>
          ) : (
            <p>Select a category to see the settings.</p>
          )}
        </div>
      </div>
    </>
  )
}

export default SettingsApp
