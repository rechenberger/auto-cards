import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createApiTokenSecret,
  hashApiToken,
  hasRequiredApiTokenScopes,
  isApiTokenActive,
  parseBearerApiToken,
} from './apiToken'

test('personal API token secrets are only represented by a stable SHA-256 hash', () => {
  const token = createApiTokenSecret()

  assert.match(token.secret, /^acp_[A-Za-z0-9_-]{43}$/)
  assert.match(token.hash, /^[a-f0-9]{64}$/)
  assert.equal(token.hash, hashApiToken(token.secret))
  assert.notEqual(token.hash, token.secret)
  assert.equal(token.prefix, token.secret.slice(0, 12))
  assert.equal(parseBearerApiToken(`Bearer ${token.secret}`), token.secret)
})

test('malformed bearer credentials are rejected before hashing', () => {
  assert.equal(parseBearerApiToken(null), null)
  assert.equal(parseBearerApiToken('Basic abc'), undefined)
  assert.equal(parseBearerApiToken('Bearer not-an-auto-cards-token'), undefined)
})

test('all required scopes must be explicitly granted', () => {
  assert.equal(
    hasRequiredApiTokenScopes({
      granted: ['game:read', 'game:write'],
      required: ['game:read'],
    }),
    true,
  )
  assert.equal(
    hasRequiredApiTokenScopes({
      granted: ['game:write'],
      required: ['game:read'],
    }),
    false,
  )
  assert.equal(
    hasRequiredApiTokenScopes({
      granted: ['admin'],
      required: ['admin', 'game:write'],
    }),
    false,
  )
})

test('revoked, expired, and malformed expiry values are inactive', () => {
  const now = new Date('2026-07-12T12:00:00.000Z')
  assert.equal(
    isApiTokenActive({ revokedAt: null, expiresAt: null }, now),
    true,
  )
  assert.equal(
    isApiTokenActive(
      { revokedAt: null, expiresAt: '2026-07-12T12:00:01.000Z' },
      now,
    ),
    true,
  )
  assert.equal(
    isApiTokenActive(
      { revokedAt: null, expiresAt: '2026-07-12T12:00:00.000Z' },
      now,
    ),
    false,
  )
  assert.equal(
    isApiTokenActive({ revokedAt: null, expiresAt: 'invalid' }, now),
    false,
  )
  assert.equal(
    isApiTokenActive(
      {
        revokedAt: '2026-07-12T11:00:00.000Z',
        expiresAt: '2027-01-01T00:00:00.000Z',
      },
      now,
    ),
    false,
  )
})
