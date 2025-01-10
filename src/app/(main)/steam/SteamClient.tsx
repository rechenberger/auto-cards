'use client'

import { SimpleDataCard } from '@/components/simple/SimpleDataCard'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
// import { ipcMain } from 'electron'
// import Steamworks from 'steamworks.js'

// const steamAppId = 480 // 480 is the test app id for valve's "spacewar"
// const steam = Steamworks.init(steamAppId)

export const SteamClient = () => {
  const [steamState, setSteamState] = useState<any>()
  useEffect(() => {
    // ipcMain.addListener('send-data', (evt, data) => {
    //   alert('Data Retrieved')
    // })
    const electronApi = (window as any).electronAPI
    if (!electronApi) return

    electronApi.onMainEvent('main-to-renderer', (message) => {
      console.log('from main', message)
      setSteamState(message)
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
      <SimpleDataCard data={steamState} />
    </>
  )
}
