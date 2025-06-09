import React from 'react'

interface AppVersionInfo {
  electron?: string
  chrome?: string
  node?: string
  v8?: string
  gitBranch?: string
  appName?: string
  appVersion?: string
}

interface AboutSettingsPageProps {
  info: AppVersionInfo | null
}

const AboutSettingsPage: React.FC<AboutSettingsPageProps> = ({ info }) => {
  if (!info) {
    return <p>Loading application information...</p>
  }
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">{info.appName || 'Browser'}</h2>
      <p className="text-sm text-muted-foreground mb-1">
        Version: {info.appVersion || 'N/A'} (Branch: {info.gitBranch || 'N/A'})
      </p>
      <p className="text-sm text-muted-foreground mb-4">
        A modern web browser built with Electron and React.
      </p>
      <div className="space-y-1 text-xs text-muted-foreground">
        <p>Electron: {info.electron || 'N/A'}</p>
        <p>Chromium: {info.chrome || 'N/A'}</p>
        <p>Node.js: {info.node || 'N/A'}</p>
        <p>V8: {info.v8 || 'N/A'}</p>
      </div>
      <p className="text-xs text-muted-foreground mt-4">
        © {new Date().getFullYear()} All rights reserved.
      </p>
    </div>
  )
}

export default AboutSettingsPage
export type { AppVersionInfo }
