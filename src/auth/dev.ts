export const isDev = () => process.env.NODE_ENV === 'development'

export const isLocalDb = () => process.env.DB_URL?.includes('file:')
