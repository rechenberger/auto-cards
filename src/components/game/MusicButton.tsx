'use client'

import { useAtom } from 'jotai/react'
import { atomWithStorage } from 'jotai/utils'
import { Music } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Slider } from '../ui/slider'

const musicVolumeAtom = atomWithStorage('musicVolume', 20)

export const MusicButton = () => {
  const ref = useRef<HTMLAudioElement>(null)
  const [volume, setVolume] = useAtom(musicVolumeAtom)
  const [musicPopoverOpen, setMusicPopoverOpen] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    if (volume) {
      ref.current.play()
    } else {
      ref.current.pause()
    }
    ref.current.volume = volume / 100
  }, [volume, musicPopoverOpen])
  return (
    <>
      <audio src="/music/sack-of-secrets.mp3" loop ref={ref} />
      <Popover onOpenChange={setMusicPopoverOpen}>
        <PopoverTrigger>
          <Button variant="ghost" size="icon">
            <Music className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="mx-4">
          <Label className="flex flex-row gap-4 items-center">
            <span className="flex-1">Music</span>
            <Slider
              value={[volume]}
              onValueChange={(v) => setVolume(v[0])}
              max={100}
              step={1}
            />
          </Label>
          {/* <div className="text-xs opacity-60 mt-4">
            <Link
              href="https://suno.com/song/e77a593b-75c2-49cf-8b6b-bbc4ecf17f35"
              target="_blank"
              className="underline"
            >
              https://suno.com/song/e77a593b-75c2-49cf-8b6b-bbc4ecf17f35
            </Link>
          </div> */}
        </PopoverContent>
      </Popover>
    </>
  )
}
