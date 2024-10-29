import { MatchViewFake } from '@/components/game/MatchViewFake'
import { PlaygroundOptions } from './playgroundHref'

export const PlaygroundMatchView = ({
  options,
}: {
  options: PlaygroundOptions
}) => {
  return <MatchViewFake seed={options.seed} loadouts={options.loadouts} />
}
