const json = (
  schema: Record<string, unknown>,
  description = 'Successful response',
) => ({
  description,
  content: { 'application/json': { schema } },
})

const data = (schema: Record<string, unknown>) => ({
  type: 'object',
  required: ['data'],
  properties: { data: schema },
})

const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` })

const secured = (scope: string) => ({
  security: [{ bearerAuth: [] }, { sessionCookie: [] }],
  'x-required-token-scopes': [scope],
})

const errors = {
  '400': json(ref('ApiError'), 'Invalid request'),
  '401': json(ref('ApiError'), 'Missing or invalid authentication'),
  '403': json(ref('ApiError'), 'Insufficient permissions or token scopes'),
  '409': json(
    ref('ApiError'),
    'Conflict, stale revision, or reused idempotency key',
  ),
}

const idempotencyHeader = {
  name: 'Idempotency-Key',
  in: 'header',
  required: true,
  description:
    'Unique client-generated key. Retrying the identical command with the same key returns the stored response.',
  schema: { type: 'string', maxLength: 200 },
}

const pathId = (name: string, description: string) => ({
  name,
  in: 'path',
  required: true,
  description,
  schema: { type: 'string' },
})

export const openApiDocument = {
  openapi: '3.1.0',
  info: {
    title: 'Auto Cards API',
    version: '1.0.0',
    description:
      'JSON API for Auto Cards clients and agents. Combat replays remain compact: the replay endpoint returns the seed, loadouts, ruleset version, and assets; clients deterministically generate combat logs locally. Gameplay and admin command endpoints require an Idempotency-Key.',
  },
  servers: [{ url: '/', description: 'Current Auto Cards deployment' }],
  tags: [
    { name: 'Discovery' },
    { name: 'Games' },
    { name: 'Live matches' },
    { name: 'Replays' },
    { name: 'Watch' },
    { name: 'Account' },
    { name: 'API tokens' },
    { name: 'Admin' },
  ],
  paths: {
    '/api/v1/meta': {
      get: {
        tags: ['Discovery'],
        operationId: 'getMeta',
        summary: 'Get API and active ruleset metadata',
        responses: { '200': json(data(ref('Meta'))) },
      },
    },
    '/api/v1/catalog': {
      get: {
        tags: ['Discovery'],
        operationId: 'getCatalog',
        summary: 'Get item definitions, themes, and image URLs',
        parameters: [
          {
            name: 'themeId',
            in: 'query',
            required: false,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': json(data({ type: 'object', additionalProperties: true })),
          '400': errors['400'],
        },
      },
    },
    '/api/v1/games': {
      get: {
        tags: ['Games'],
        operationId: 'listMyGames',
        summary: 'List the authenticated player’s current games',
        ...secured('game:read'),
        responses: {
          '200': json(
            data({
              type: 'object',
              required: ['games', 'isAdmin'],
              properties: {
                games: { type: 'array', items: ref('GameView') },
                isAdmin: { type: 'boolean' },
              },
            }),
          ),
          '401': errors['401'],
          '403': errors['403'],
        },
      },
      post: {
        tags: ['Games'],
        operationId: 'createGame',
        summary: 'Create a game',
        ...secured('game:write'),
        parameters: [idempotencyHeader],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: ref('CreateGameRequest') } },
        },
        responses: {
          '201': json(data(ref('GameView')), 'Game created'),
          ...errors,
        },
      },
    },
    '/api/v1/games/{gameId}': {
      get: {
        tags: ['Games'],
        operationId: 'getGame',
        summary: 'Get authoritative game state and revision',
        ...secured('game:read'),
        parameters: [pathId('gameId', 'Game id')],
        responses: {
          '200': json(data(ref('GameView'))),
          '401': errors['401'],
          '403': errors['403'],
          '404': json(ref('ApiError'), 'Game not found'),
        },
      },
      delete: {
        tags: ['Admin'],
        operationId: 'deleteGame',
        summary: 'Delete a game (admin only)',
        ...secured('admin'),
        parameters: [pathId('gameId', 'Game id')],
        responses: {
          '204': { description: 'Game deleted' },
          '401': errors['401'],
          '403': errors['403'],
        },
      },
    },
    '/api/v1/games/{gameId}/commands': {
      post: {
        tags: ['Games'],
        operationId: 'executeGameCommand',
        summary: 'Apply a shopper game command',
        description:
          'Use the latest revision from GameView as expectedRevision. A stale revision returns HTTP 409 with details.currentRevision.',
        ...secured('game:write'),
        parameters: [pathId('gameId', 'Game id'), idempotencyHeader],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: ref('GameCommandRequest') },
          },
        },
        responses: {
          '200': json(data({ type: 'object', additionalProperties: true })),
          ...errors,
          '422': json(
            ref('ApiError'),
            'Command is invalid for the current phase',
          ),
        },
      },
    },
    '/api/v1/games/{gameId}/collector/commands': {
      post: {
        tags: ['Games'],
        operationId: 'executeCollectorCommand',
        summary: 'Apply an endless/collector command',
        ...secured('game:write'),
        parameters: [pathId('gameId', 'Game id'), idempotencyHeader],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: ref('CollectorCommandRequest') },
          },
        },
        responses: {
          '200': json(data({ type: 'object', additionalProperties: true })),
          ...errors,
          '422': json(ref('ApiError'), 'Invalid collector command'),
        },
      },
    },
    '/api/v1/live-matches': {
      get: {
        tags: ['Live matches'],
        operationId: 'listLiveMatches',
        summary: 'List recent live matches',
        responses: {
          '200': json(data({ type: 'object', additionalProperties: true })),
        },
      },
      post: {
        tags: ['Live matches'],
        operationId: 'createLiveMatch',
        summary: 'Create and host a live match',
        ...secured('live:write'),
        parameters: [idempotencyHeader],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object' } } },
        },
        responses: {
          '201': json(data(ref('LiveMatchView'))),
          ...errors,
        },
      },
    },
    '/api/v1/live-matches/{liveMatchId}': {
      get: {
        tags: ['Live matches'],
        operationId: 'getLiveMatch',
        summary: 'Get lobby state for the authenticated player',
        ...secured('live:read'),
        parameters: [pathId('liveMatchId', 'Live match id')],
        responses: {
          '200': json(data(ref('LiveMatchView'))),
          '401': errors['401'],
          '403': errors['403'],
          '404': json(ref('ApiError'), 'Live match not found'),
        },
      },
    },
    '/api/v1/live-matches/{liveMatchId}/commands': {
      post: {
        tags: ['Live matches'],
        operationId: 'executeLiveMatchCommand',
        summary: 'Join, start a game, ready up, or start matches',
        ...secured('live:write'),
        parameters: [pathId('liveMatchId', 'Live match id'), idempotencyHeader],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: ref('LiveMatchCommand') },
          },
        },
        responses: {
          '200': json(data({ type: 'object', additionalProperties: true })),
          ...errors,
          '422': json(ref('ApiError'), 'Invalid command'),
        },
      },
    },
    '/api/v1/live-matches/{liveMatchId}/results': {
      get: {
        tags: ['Live matches'],
        operationId: 'getLiveMatchResults',
        summary: 'Get public live match standings and round results',
        parameters: [pathId('liveMatchId', 'Live match id')],
        responses: {
          '200': json(data(ref('LiveMatchResults'))),
          '404': json(ref('ApiError'), 'Live match not found'),
        },
      },
    },
    '/api/v1/matches/{matchId}/replay': {
      get: {
        tags: ['Replays'],
        operationId: 'getMatchReplay',
        summary: 'Get deterministic seed-only replay input',
        description:
          'Combat logs are intentionally not transferred. Re-run the matching ruleset with the returned seed and loadouts.',
        parameters: [pathId('matchId', 'Match id')],
        responses: {
          '200': json(data(ref('Replay'))),
          '404': json(ref('ApiError'), 'Match not found'),
        },
      },
    },
    '/api/v1/watch/recent-matches': {
      get: {
        tags: ['Watch'],
        operationId: 'getRecentMatches',
        summary: 'Get recent public matches',
        responses: {
          '200': json(data({ type: 'object', additionalProperties: true })),
        },
      },
    },
    '/api/v1/watch/recent-games': {
      get: {
        tags: ['Watch'],
        operationId: 'getRecentGames',
        summary: 'Get recent public games',
        responses: {
          '200': json(data(ref('RecentGames'))),
        },
      },
    },
    '/api/v1/watch/leaderboard': {
      get: {
        tags: ['Watch'],
        operationId: 'getLeaderboard',
        summary: 'Get a leaderboard round',
        parameters: [
          {
            name: 'round',
            in: 'query',
            schema: { type: 'integer', minimum: 1 },
          },
          { name: 'type', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          '200': json(data({ type: 'object', additionalProperties: true })),
          '400': errors['400'],
        },
      },
    },
    '/api/v1/me/tokens': {
      get: {
        tags: ['API tokens'],
        operationId: 'listApiTokens',
        summary: 'List personal token metadata',
        description:
          'Requires an interactive Auth.js session; bearer tokens cannot manage other tokens.',
        security: [{ sessionCookie: [] }],
        responses: {
          '200': json(data(ref('ApiTokenList'))),
          '401': errors['401'],
        },
      },
      post: {
        tags: ['API tokens'],
        operationId: 'createApiToken',
        summary: 'Create a personal token and return its secret once',
        description:
          'Requires an interactive Auth.js session. The raw secret is never stored and appears only in this response.',
        security: [{ sessionCookie: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: ref('CreateApiTokenRequest') },
          },
        },
        responses: {
          '201': json(data(ref('CreatedApiToken'))),
          '400': errors['400'],
          '401': errors['401'],
          '403': errors['403'],
        },
      },
    },
    '/api/v1/auth/register': {
      post: {
        tags: ['Account'],
        operationId: 'registerUser',
        summary: 'Create a credentials account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: [
                  'email',
                  'password',
                  'confirmPassword',
                  'acceptTerms',
                ],
                properties: {
                  email: { type: 'string', format: 'email', maxLength: 320 },
                  password: { type: 'string', minLength: 1, maxLength: 256 },
                  confirmPassword: {
                    type: 'string',
                    minLength: 1,
                    maxLength: 256,
                  },
                  acceptTerms: { const: true },
                },
              },
            },
          },
        },
        responses: {
          '201': json(
            data({
              type: 'object',
              required: ['email'],
              properties: { email: { type: 'string', format: 'email' } },
            }),
          ),
          '400': errors['400'],
          '409': errors['409'],
        },
      },
    },
    '/api/v1/me': {
      get: {
        tags: ['Account'],
        operationId: 'getMe',
        summary: 'Get the current interactive session user or null',
        description:
          'This browser-oriented endpoint uses an Auth.js session. Bearer agents should use their scoped game/live APIs.',
        security: [{}, { sessionCookie: [] }],
        responses: {
          '200': json(data({ anyOf: [ref('Me'), { type: 'null' }] })),
        },
      },
      patch: {
        tags: ['Account'],
        operationId: 'updateMe',
        summary: 'Change username, password, or theme',
        security: [{ sessionCookie: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                oneOf: [
                  {
                    type: 'object',
                    required: ['type', 'username'],
                    properties: {
                      type: { const: 'username' },
                      username: { type: 'string', minLength: 1, maxLength: 64 },
                    },
                  },
                  {
                    type: 'object',
                    required: ['type', 'password', 'confirmPassword'],
                    properties: {
                      type: { const: 'password' },
                      password: {
                        type: 'string',
                        minLength: 1,
                        maxLength: 256,
                      },
                      confirmPassword: {
                        type: 'string',
                        minLength: 1,
                        maxLength: 256,
                      },
                    },
                  },
                  {
                    type: 'object',
                    required: ['type', 'themeId'],
                    properties: {
                      type: { const: 'theme' },
                      themeId: { type: 'string' },
                    },
                  },
                ],
              },
            },
          },
        },
        responses: {
          '200': json(data(ref('Me'))),
          '400': errors['400'],
          '401': errors['401'],
        },
      },
    },
    '/api/v1/me/tokens/{tokenId}': {
      delete: {
        tags: ['API tokens'],
        operationId: 'revokeApiToken',
        summary: 'Revoke a personal token immediately',
        security: [{ sessionCookie: [] }],
        parameters: [pathId('tokenId', 'Personal API token id')],
        responses: {
          '200': json(
            data({
              type: 'object',
              required: ['revoked'],
              properties: { revoked: { const: true } },
            }),
          ),
          '401': errors['401'],
          '404': json(ref('ApiError'), 'Token not found'),
        },
      },
    },
    '/api/v1/auth/impersonate': {
      post: {
        tags: ['Admin'],
        operationId: 'createImpersonationGrant',
        summary:
          'Create a short-lived impersonation sign-in grant (admin session only)',
        security: [{ sessionCookie: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId'],
                properties: { userId: { type: 'string' } },
              },
            },
          },
        },
        responses: {
          '200': json(
            data({
              type: 'object',
              required: ['token', 'expiresAt'],
              properties: {
                token: { type: 'string' },
                expiresAt: { type: 'string', format: 'date-time' },
              },
            }),
          ),
          '400': errors['400'],
          '401': errors['401'],
          '403': errors['403'],
          '404': json(ref('ApiError'), 'User not found'),
        },
      },
    },
    '/api/v1/admin/users': {
      get: {
        tags: ['Admin'],
        operationId: 'listAdminUsers',
        summary: 'List users (admin only)',
        ...secured('admin'),
        parameters: [
          {
            name: 'filter',
            in: 'query',
            schema: { type: 'string', enum: ['admins'] },
          },
        ],
        responses: {
          '200': json(
            data({
              type: 'object',
              required: ['users'],
              properties: {
                users: {
                  type: 'array',
                  items: { type: 'object', additionalProperties: true },
                },
              },
            }),
          ),
          '401': errors['401'],
          '403': errors['403'],
        },
      },
      post: {
        tags: ['Admin'],
        operationId: 'createAdminUser',
        summary: 'Create a credentials user (admin only)',
        ...secured('admin'),
        parameters: [idempotencyHeader],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8, maxLength: 200 },
                },
              },
            },
          },
        },
        responses: {
          '201': json(data(ref('AdminMutationResult'))),
          ...errors,
        },
      },
    },
    '/api/v1/admin/users/{userId}': {
      patch: {
        tags: ['Admin'],
        operationId: 'updateAdminUser',
        summary: 'Change a user’s admin status',
        ...secured('admin'),
        parameters: [pathId('userId', 'User id'), idempotencyHeader],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['isAdmin'],
                properties: { isAdmin: { type: 'boolean' } },
              },
            },
          },
        },
        responses: {
          '200': json(data(ref('AdminMutationResult'))),
          ...errors,
          '404': json(ref('ApiError'), 'User not found'),
        },
      },
      delete: {
        tags: ['Admin'],
        operationId: 'deleteAdminUser',
        summary: 'Delete a user',
        ...secured('admin'),
        parameters: [pathId('userId', 'User id'), idempotencyHeader],
        responses: {
          '200': json(data(ref('AdminMutationResult'))),
          ...errors,
          '404': json(ref('ApiError'), 'User not found'),
        },
      },
    },
    '/api/v1/admin/bots': {
      get: {
        tags: ['Admin'],
        operationId: 'listAdminBots',
        summary: 'List persisted bot loadouts by round',
        ...secured('admin'),
        responses: {
          '200': json(data({ type: 'object', additionalProperties: true })),
          '401': errors['401'],
          '403': errors['403'],
        },
      },
    },
    '/api/v1/admin/bots/commands': {
      post: {
        tags: ['Admin'],
        operationId: 'queueBotGeneration',
        summary: 'Queue durable bot-generation jobs',
        ...secured('admin'),
        parameters: [idempotencyHeader],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['roundNos'],
                properties: {
                  roundNos: {
                    type: 'array',
                    minItems: 1,
                    maxItems: 20,
                    items: { type: 'integer', minimum: 0 },
                  },
                },
              },
            },
          },
        },
        responses: {
          '202': json(data(ref('AdminJobBatch'))),
          ...errors,
        },
      },
    },
    '/api/v1/admin/simulations': {
      post: {
        tags: ['Admin'],
        operationId: 'queueAdminSimulation',
        summary: 'Queue one to four durable balance simulations',
        ...secured('admin'),
        parameters: [idempotencyHeader],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['inputs'],
                properties: {
                  inputs: {
                    type: 'array',
                    minItems: 1,
                    maxItems: 4,
                    items: { type: 'object', additionalProperties: true },
                  },
                },
              },
            },
          },
        },
        responses: {
          '202': json(data(ref('AdminJobBatch'))),
          ...errors,
        },
      },
    },
    '/api/v1/admin/jobs': {
      get: {
        tags: ['Admin'],
        operationId: 'listAdminJobs',
        summary: 'Poll durable jobs and optional results',
        ...secured('admin'),
        parameters: [
          {
            name: 'ids',
            in: 'query',
            description: 'Comma-separated job ids (maximum 100)',
            schema: { type: 'string' },
          },
          {
            name: 'includeResult',
            in: 'query',
            schema: { type: 'boolean', default: false },
          },
        ],
        responses: {
          '200': json(
            data({
              type: 'object',
              required: ['jobs'],
              properties: {
                jobs: { type: 'array', items: ref('AdminJob') },
              },
            }),
          ),
          '400': errors['400'],
          '401': errors['401'],
          '403': errors['403'],
        },
      },
    },
    '/api/v1/admin/migrations': {
      get: {
        tags: ['Admin'],
        operationId: 'getAdminMigrationStatus',
        summary: 'Inspect known data backfill status',
        ...secured('admin'),
        responses: {
          '200': json(data({ type: 'object', additionalProperties: true })),
          '401': errors['401'],
          '403': errors['403'],
        },
      },
      post: {
        tags: ['Admin'],
        operationId: 'runAdminDataMigration',
        summary: 'Run an idempotent data backfill',
        ...secured('admin'),
        parameters: [idempotencyHeader],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['type'],
                properties: {
                  type: { const: 'backfill-leaderboard-game-id' },
                },
              },
            },
          },
        },
        responses: {
          '200': json(data({ type: 'object', additionalProperties: true })),
          ...errors,
        },
      },
    },
    '/api/v1/ai-images': {
      get: {
        tags: ['Discovery'],
        operationId: 'listAiImages',
        summary: 'Search generated item and background images',
        parameters: [
          { name: 'itemId', in: 'query', schema: { type: 'string' } },
          { name: 'themeId', in: 'query', schema: { type: 'string' } },
          { name: 'prompt', in: 'query', schema: { type: 'string' } },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 500, default: 12 },
          },
        ],
        responses: {
          '200': json(data({ type: 'object', additionalProperties: true })),
          '400': errors['400'],
        },
      },
      post: {
        tags: ['Admin'],
        operationId: 'queueAiImageGeneration',
        summary: 'Queue durable AI image generation',
        ...secured('admin'),
        parameters: [idempotencyHeader],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: ref('AiImageCommand') },
          },
        },
        responses: {
          '202': json(data(ref('AdminJobBatch'))),
          ...errors,
        },
      },
    },
    '/api/v1/ai-images/{imageId}': {
      patch: {
        tags: ['Admin'],
        operationId: 'activateAiImage',
        summary: 'Make an existing image the newest active choice',
        ...secured('admin'),
        parameters: [pathId('imageId', 'AI image id'), idempotencyHeader],
        responses: {
          '200': json(data({ type: 'object', additionalProperties: true })),
          ...errors,
          '404': json(ref('ApiError'), 'Image not found'),
        },
      },
    },
    '/api/v1/admin/leaderboard': {
      post: {
        tags: ['Admin'],
        operationId: 'executeLeaderboardAdminCommand',
        summary: 'Queue or clean leaderboard work (admin only)',
        ...secured('admin'),
        parameters: [idempotencyHeader],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                oneOf: [
                  {
                    type: 'object',
                    required: ['type'],
                    properties: { type: { const: 'refresh' } },
                  },
                  {
                    type: 'object',
                    required: ['type'],
                    properties: { type: { const: 'clean-duplicates' } },
                  },
                  {
                    type: 'object',
                    required: ['type', 'loadoutId'],
                    properties: {
                      type: { const: 'score-loadout' },
                      loadoutId: { type: 'string' },
                    },
                  },
                ],
              },
            },
          },
        },
        responses: {
          '200': json(data({ type: 'object' })),
          '202': json(data({ type: 'object' })),
          ...errors,
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'AutoCards personal API token (acp_…)',
        description:
          'Create a scoped personal token on /auth/me and send it as Authorization: Bearer acp_…',
      },
      sessionCookie: {
        type: 'apiKey',
        in: 'cookie',
        name: 'authjs.session-token',
        description:
          'Interactive Auth.js browser session. Secure deployments may use a __Secure- cookie prefix.',
      },
    },
    schemas: {
      ApiError: {
        type: 'object',
        required: ['error'],
        properties: {
          error: {
            type: 'object',
            required: ['code', 'message', 'requestId'],
            properties: {
              code: {
                type: 'string',
                enum: [
                  'BAD_REQUEST',
                  'UNAUTHENTICATED',
                  'FORBIDDEN',
                  'NOT_FOUND',
                  'CONFLICT',
                  'STALE_REVISION',
                  'INVALID_COMMAND',
                  'INTERNAL_ERROR',
                ],
              },
              message: { type: 'string' },
              requestId: { type: 'string' },
              details: {},
            },
          },
        },
      },
      Meta: {
        type: 'object',
        required: [
          'apiVersion',
          'openApiUrl',
          'rulesetVersion',
          'numberOfRounds',
          'replay',
          'viewer',
        ],
        properties: {
          apiVersion: { const: 'v1' },
          openApiUrl: { const: '/api/openapi.json' },
          rulesetVersion: { type: 'integer', minimum: 0 },
          numberOfRounds: { type: 'integer', minimum: 1 },
          replay: {
            type: 'object',
            properties: {
              format: { const: 'seed-loadouts' },
              logsIncluded: { const: false },
            },
          },
          viewer: { type: ['object', 'null'], additionalProperties: true },
        },
      },
      Me: {
        type: 'object',
        required: [
          'id',
          'displayName',
          'name',
          'email',
          'emailVerified',
          'image',
          'isAdmin',
          'themeId',
          'hasPassword',
          'providers',
        ],
        properties: {
          id: { type: 'string' },
          displayName: { type: 'string' },
          name: { type: ['string', 'null'] },
          email: { type: 'string', format: 'email' },
          emailVerified: { type: ['string', 'null'], format: 'date-time' },
          image: { type: ['string', 'null'] },
          isAdmin: { type: 'boolean' },
          themeId: { type: 'string' },
          hasPassword: { type: 'boolean' },
          providers: { type: 'array', items: { type: 'string' } },
        },
      },
      GameView: {
        type: 'object',
        required: [
          'game',
          'phase',
          'currentMatchId',
          'rounds',
          'latestLoadoutId',
          'leaderboard',
          'isAdmin',
          'isOldVersion',
        ],
        properties: {
          game: {
            type: 'object',
            required: [
              'id',
              'userId',
              'data',
              'version',
              'revision',
              'gameMode',
            ],
            properties: {
              id: { type: 'string' },
              userId: { type: 'string' },
              data: { type: 'object', additionalProperties: true },
              liveMatchId: { type: ['string', 'null'] },
              version: { type: 'integer' },
              revision: { type: 'integer', minimum: 0 },
              gameMode: { type: 'string', enum: ['shopper', 'collector'] },
              createdAt: { type: ['string', 'null'] },
              updatedAt: { type: ['string', 'null'] },
            },
          },
          phase: {
            type: 'string',
            enum: ['shop', 'match', 'ended', 'collector'],
          },
          currentMatchId: { type: ['string', 'null'] },
          rounds: {
            type: 'array',
            items: { type: 'object', additionalProperties: true },
          },
          latestLoadoutId: { type: ['string', 'null'] },
          leaderboard: {
            anyOf: [ref('LeaderboardSummary'), { type: 'null' }],
          },
          isAdmin: { type: 'boolean' },
          isOldVersion: { type: 'boolean' },
        },
      },
      LeaderboardSummary: {
        type: 'object',
        required: ['rank', 'score', 'isTop'],
        properties: {
          rank: {
            type: 'integer',
            minimum: 1,
            description:
              'Rank in the current top leaderboard, or 99 for a scored entry outside that list.',
          },
          score: { type: 'number' },
          isTop: {
            type: 'boolean',
            description:
              'Whether rank is a position in the active top leaderboard.',
          },
        },
      },
      RecentGames: {
        type: 'object',
        required: ['games'],
        properties: {
          games: { type: 'array', items: ref('RecentGame') },
        },
      },
      RecentGame: {
        type: 'object',
        required: [
          'id',
          'displayName',
          'updatedAt',
          'version',
          'gameMode',
          'rounds',
          'leaderboard',
        ],
        properties: {
          id: { type: 'string' },
          displayName: { type: 'string' },
          updatedAt: { type: ['string', 'null'] },
          version: { type: 'integer' },
          gameMode: { type: 'string', enum: ['shopper', 'collector'] },
          dungeonAccesses: {
            type: 'array',
            items: {
              type: 'object',
              required: ['name', 'levelMin', 'levelMax', 'levelCurrent'],
              properties: {
                name: {
                  type: 'string',
                  enum: ['trainingGrounds', 'adventureTrail'],
                },
                levelMin: { type: 'number' },
                levelMax: { type: 'number' },
                levelCurrent: { type: 'number' },
              },
            },
          },
          rounds: {
            type: 'array',
            items: {
              type: 'object',
              required: ['roundNo', 'status', 'matchId'],
              properties: {
                roundNo: { type: 'integer', minimum: 0 },
                status: {
                  type: ['string', 'null'],
                  enum: ['won', 'lost', null],
                },
                matchId: { type: ['string', 'null'] },
              },
            },
          },
          leaderboard: {
            anyOf: [ref('LeaderboardSummary'), { type: 'null' }],
          },
        },
      },
      CreateGameRequest: {
        type: 'object',
        properties: {
          gameMode: {
            type: 'string',
            enum: ['shopper', 'collector'],
            default: 'shopper',
          },
        },
      },
      GameCommandRequest: {
        type: 'object',
        required: ['expectedRevision', 'command'],
        properties: {
          expectedRevision: { type: 'integer', minimum: 0 },
          command: {
            oneOf: [
              {
                type: 'object',
                required: ['type', 'shopItemIndex'],
                properties: {
                  type: { const: 'buy' },
                  shopItemIndex: { type: 'integer', minimum: 0 },
                },
              },
              {
                type: 'object',
                required: ['type', 'shopItemIndex'],
                properties: {
                  type: { const: 'toggle-reserve' },
                  shopItemIndex: { type: 'integer', minimum: 0 },
                },
              },
              {
                type: 'object',
                required: ['type'],
                properties: { type: { const: 'reroll' } },
              },
              {
                type: 'object',
                required: ['type', 'itemName'],
                properties: {
                  type: { const: 'sell' },
                  itemName: { type: 'string' },
                  aspects: { type: 'array', items: { type: 'string' } },
                },
              },
              {
                type: 'object',
                required: ['type', 'recipeIndex'],
                properties: {
                  type: { const: 'craft' },
                  recipeIndex: { type: 'integer', minimum: 0 },
                },
              },
              {
                type: 'object',
                required: ['type'],
                properties: { type: { const: 'fight' } },
              },
              {
                type: 'object',
                required: ['type'],
                properties: { type: { const: 'next-round' } },
              },
              {
                type: 'object',
                required: ['type', 'amount'],
                properties: {
                  type: { const: 'admin-add-gold' },
                  amount: { type: 'integer', minimum: 1, maximum: 10000 },
                },
              },
            ],
          },
        },
      },
      CollectorCommandRequest: {
        type: 'object',
        required: ['expectedRevision', 'rulesetVersion', 'command'],
        properties: {
          expectedRevision: { type: 'integer', minimum: 0 },
          rulesetVersion: { type: 'integer', minimum: 1 },
          command: {
            type: 'object',
            required: ['type'],
            description:
              'Discriminated collector command. See the current game state for stable item and dungeon ids.',
            properties: { type: { type: 'string' } },
            additionalProperties: true,
          },
        },
      },
      LiveMatchView: {
        type: 'object',
        required: [
          'id',
          'status',
          'rulesetVersion',
          'participants',
          'me',
          'allReady',
          'canStartMatches',
        ],
        properties: {
          id: { type: 'string' },
          status: { type: 'string', enum: ['open', 'locked'] },
          rulesetVersion: { type: 'integer', minimum: 1 },
          createdAt: { type: ['string', 'null'] },
          updatedAt: { type: ['string', 'null'] },
          participants: {
            type: 'array',
            items: { type: 'object', additionalProperties: true },
          },
          me: { type: ['object', 'null'], additionalProperties: true },
          allReady: { type: 'boolean' },
          canStartMatches: { type: 'boolean' },
        },
      },
      LiveMatchCommand: {
        oneOf: ['join', 'start-game', 'ready', 'start-matches'].map((type) => ({
          type: 'object',
          required: ['type'],
          properties: { type: { const: type } },
        })),
      },
      LiveMatchResults: {
        type: 'object',
        required: ['liveMatchId', 'rulesetVersion', 'entries'],
        properties: {
          liveMatchId: { type: 'string' },
          rulesetVersion: { type: 'integer', minimum: 1 },
          entries: {
            type: 'array',
            items: ref('LiveMatchResultEntry'),
          },
        },
      },
      LiveMatchResultEntry: {
        type: 'object',
        required: [
          'participationId',
          'displayName',
          'gameId',
          'rank',
          'score',
          'currentRoundNo',
          'rounds',
          'latestLoadout',
          'leaderboard',
        ],
        properties: {
          participationId: { type: 'string' },
          displayName: { type: 'string' },
          gameId: { type: 'string' },
          rank: { type: 'integer', minimum: 1 },
          score: { type: 'integer', minimum: 0 },
          currentRoundNo: { type: 'integer', minimum: 0 },
          rounds: {
            type: 'array',
            items: ref('LiveMatchRoundResult'),
          },
          latestLoadout: {
            anyOf: [ref('LiveMatchLatestLoadout'), { type: 'null' }],
          },
          leaderboard: {
            anyOf: [ref('LeaderboardSummary'), { type: 'null' }],
            description:
              'Active-season leaderboard summary. Null for legacy rulesets and unscored loadouts.',
          },
        },
      },
      LiveMatchRoundResult: {
        type: 'object',
        required: ['roundNo', 'status', 'matchId', 'points'],
        properties: {
          roundNo: { type: 'integer', minimum: 0 },
          status: {
            type: ['string', 'null'],
            enum: ['won', 'lost', null],
          },
          matchId: { type: ['string', 'null'] },
          points: { type: 'integer', minimum: 0 },
        },
      },
      LiveMatchLatestLoadout: {
        type: 'object',
        required: ['id', 'roundNo', 'items'],
        properties: {
          id: { type: 'string' },
          roundNo: { type: 'integer', minimum: 0 },
          items: { type: 'array', items: ref('ItemData') },
        },
      },
      ItemData: {
        type: 'object',
        required: ['name'],
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          count: { type: 'number' },
          aspects: {
            type: 'array',
            items: ref('ItemAspect'),
          },
          rarity: {
            type: 'string',
            enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
          },
          favorite: { type: 'boolean' },
          createdAt: { type: 'string' },
        },
      },
      ItemAspect: {
        type: 'object',
        required: ['name', 'rnd'],
        properties: {
          name: { type: 'string' },
          rnd: { type: 'number' },
          multiplier: { type: 'number' },
        },
      },
      Replay: {
        type: 'object',
        required: [
          'apiVersion',
          'match',
          'rulesetVersion',
          'currentRulesetVersion',
          'participants',
          'assets',
        ],
        properties: {
          apiVersion: { const: 'v1' },
          match: {
            type: 'object',
            required: ['id', 'seed', 'gameMode'],
            properties: {
              id: { type: 'string' },
              seed: { type: 'string' },
              gameMode: { type: 'string', enum: ['shopper', 'collector'] },
              createdAt: { type: ['string', 'null'] },
            },
          },
          rulesetVersion: { type: 'integer' },
          currentRulesetVersion: { type: 'integer' },
          participants: {
            type: 'array',
            minItems: 2,
            maxItems: 2,
            items: { type: 'object', additionalProperties: true },
          },
          assets: { type: 'object', additionalProperties: true },
        },
      },
      ApiToken: {
        type: 'object',
        required: [
          'id',
          'name',
          'prefix',
          'scopes',
          'createdAt',
          'expiresAt',
          'lastUsedAt',
          'revokedAt',
        ],
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          prefix: { type: 'string' },
          scopes: {
            type: 'array',
            items: {
              type: 'string',
              enum: [
                'game:read',
                'game:write',
                'live:read',
                'live:write',
                'admin',
              ],
            },
          },
          createdAt: { type: 'string', format: 'date-time' },
          expiresAt: { type: ['string', 'null'], format: 'date-time' },
          lastUsedAt: { type: ['string', 'null'], format: 'date-time' },
          revokedAt: { type: ['string', 'null'], format: 'date-time' },
        },
      },
      ApiTokenList: {
        type: 'object',
        required: ['tokens', 'availableScopes'],
        properties: {
          tokens: { type: 'array', items: ref('ApiToken') },
          availableScopes: {
            type: 'array',
            items: {
              type: 'string',
              enum: [
                'game:read',
                'game:write',
                'live:read',
                'live:write',
                'admin',
              ],
            },
          },
        },
      },
      CreateApiTokenRequest: {
        type: 'object',
        required: ['name', 'scopes'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 64 },
          scopes: {
            type: 'array',
            minItems: 1,
            uniqueItems: true,
            items: {
              type: 'string',
              enum: [
                'game:read',
                'game:write',
                'live:read',
                'live:write',
                'admin',
              ],
            },
          },
          expiresAt: { type: ['string', 'null'], format: 'date-time' },
        },
      },
      CreatedApiToken: {
        type: 'object',
        required: ['token', 'secret'],
        properties: {
          token: ref('ApiToken'),
          secret: {
            type: 'string',
            pattern: '^acp_[A-Za-z0-9_-]{43}$',
            description: 'Returned once. Never persisted by Auto Cards.',
          },
        },
      },
      AdminMutationResult: {
        type: 'object',
        required: ['message'],
        properties: { message: { type: 'string' } },
      },
      AdminJob: {
        type: 'object',
        required: [
          'id',
          'type',
          'status',
          'attempts',
          'error',
          'createdAt',
          'updatedAt',
        ],
        properties: {
          id: { type: 'string' },
          type: { type: 'string' },
          status: {
            type: 'string',
            enum: ['queued', 'running', 'completed', 'failed'],
          },
          attempts: { type: 'integer', minimum: 0 },
          error: { type: ['string', 'null'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          result: {},
        },
      },
      AdminJobBatch: {
        type: 'object',
        required: ['jobs', 'queued'],
        properties: {
          jobs: { type: 'array', items: ref('AdminJob') },
          queued: { type: 'integer', minimum: 0 },
          skipped: { type: 'integer', minimum: 0 },
        },
      },
      AiImageCommand: {
        oneOf: [
          {
            type: 'object',
            required: ['type', 'prompt'],
            properties: {
              type: { const: 'generate' },
              prompt: { type: 'string', minLength: 1, maxLength: 20000 },
              itemId: { type: 'string' },
              themeId: { type: 'string' },
              count: { type: 'integer', minimum: 1, maximum: 10, default: 1 },
              force: { type: 'boolean', default: true },
            },
          },
          {
            type: 'object',
            required: ['type', 'mode'],
            properties: {
              type: { const: 'generate-batch' },
              itemId: { type: 'string' },
              themeId: { type: 'string' },
              mode: { type: 'string', enum: ['missing', 'prompt', 'all'] },
            },
          },
        ],
      },
    },
  },
} as const
