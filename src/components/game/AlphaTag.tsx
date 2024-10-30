import { cn } from '@/lib/utils'
import { Info } from 'lucide-react'
import { SimpleTooltipButton } from '../simple/SimpleTooltipButton'

export const AlphaTag = () => {
  return (
    <>
      <SimpleTooltipButton
        hideIcon
        variant="vanilla"
        size="vanilla"
        tooltip={
          <>
            <div>👨‍💻 This game mode is still in development.</div>
            <br />
            <div>🐛 Things may break.</div>
            <div>💨 Things may get deleted.</div>
            <div>❤️‍🩹 Dont get too attached to your collection (just yet).</div>
            <br />
            <div>🙏 Very thankful for any feedback.</div>
          </>
        }
      >
        <div
          className={cn(
            'rounded-full px-2.5 py-0.5 text-xs font-semibold inline-flex items-center',
            'bg-green-700 text-green-300',
            'font-mono',
          )}
        >
          <div>In Development</div>
          <Info className="size-3 ml-1" />
        </div>
      </SimpleTooltipButton>
    </>
  )
}
