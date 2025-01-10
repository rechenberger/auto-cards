'use client'

import { Button } from '@/components/ui/button'
import { useEffect } from 'react'
// import { ipcMain } from 'electron'
// import Steamworks from 'steamworks.js'

// const steamAppId = 480 // 480 is the test app id for valve's "spacewar"
// const steam = Steamworks.init(steamAppId)

export const SteamClient = () => {
  useEffect(() => {
    // ipcMain.addListener('send-data', (evt, data) => {
    //   alert('Data Retrieved')
    // })
    const electronApi = (window as any).electronAPI
    if (!electronApi) return

    electronApi.onMainEvent('main-to-renderer', (message) => {
      console.log('from main', message)
    })
  }, [])
  return (
    <>
      <Button
        onClick={() => {
          // alert(steam.localplayer.getName())
          ;(window as any).electronAPI.setTitle('Title from client')
        }}
      >
        Test Steam Clientam
      </Button>
    </>
  )
}
