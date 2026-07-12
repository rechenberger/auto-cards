'use client'

import { MatchReplayView } from '@/components/game/MatchReplayView'
import { CatalogResponse } from '@/contracts/catalog'
import { GameViewDto } from '@/contracts/game-api'
import { MatchReplayResponse } from '@/contracts/replay'
import { ItemCardClient } from '@/features/game/ItemCardClient'
import { getDungeon } from '@/game/dungeons/allDungeons'
import { fontLore } from '@/lib/fonts'
import { cn } from '@/lib/utils'
import { capitalCase } from 'change-case'
import { CollectorAdminButtons } from './CollectorAdminButtons'
import { CollectorCommandHandler } from './CollectorCommandButton'
import { NextRoundButtonCollector } from './NextRoundButtonCollector'

export const CollectorDungeonMatch = ({
  view,
  catalog,
  onCommand,
  pending,
}: {
  view: GameViewDto
  catalog: CatalogResponse
  onCommand: CollectorCommandHandler
  pending: boolean
}) => {
  const game = view.game
  const dungeonData = game.data.dungeon
  if (!dungeonData) return null
  const dungeon = getDungeon(dungeonData.name)
  const room = dungeonData.room

  const replay: MatchReplayResponse | undefined =
    room.type === 'fight'
      ? {
          apiVersion: 'v1',
          match: {
            id: `collector-${game.id}-${room.idx}`,
            seed: room.seed,
            gameMode: 'collector',
            createdAt: game.updatedAt,
          },
          rulesetVersion: game.version,
          currentRulesetVersion: catalog.rulesetVersion,
          participants: [
            {
              sideIdx: 0,
              status: dungeonData.status === 'failed' ? 'lost' : 'won',
              displayName: 'You',
              themeId: catalog.imageThemeId,
              loadoutId: `${game.id}-collector-player`,
              loadout: game.data.currentLoadout,
            },
            {
              sideIdx: 1,
              status: dungeonData.status === 'failed' ? 'won' : 'lost',
              displayName: capitalCase(dungeonData.name),
              themeId: catalog.imageThemeId,
              loadoutId: `${game.id}-collector-dungeon-${room.idx}`,
              loadout: room.loadout,
            },
          ],
          assets: {
            itemDefinitions: catalog.items,
            themes: catalog.themes,
            images: catalog.images,
          },
        }
      : undefined

  return (
    <div className="flex w-full flex-1 flex-col gap-4">
      <div className="flex flex-col items-center gap-4">
        <h1 className={cn(fontLore.className, 'text-xl')}>
          {capitalCase(dungeon.name)}
        </h1>
        <CollectorAdminButtons
          isAdmin={view.isAdmin}
          onCommand={onCommand}
          pending={pending}
        />
        {room.type === 'reward' && (
          <>
            <div>Reward</div>
            <div className="flex flex-1 flex-row flex-wrap items-start justify-center gap-1">
              {room.items.map((item, index) => (
                <ItemCardClient
                  key={`${item.name}-${index}`}
                  itemData={item}
                  catalog={catalog}
                  size="200"
                />
              ))}
            </div>
            <NextRoundButtonCollector
              game={game}
              onCommand={onCommand}
              pending={pending}
            />
          </>
        )}
      </div>
      {replay && (
        <MatchReplayView replay={replay} meta={null}>
          <NextRoundButtonCollector
            game={game}
            onCommand={onCommand}
            pending={pending}
          />
        </MatchReplayView>
      )}
    </div>
  )
}
