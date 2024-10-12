export const isDev = () => process.env.NODE_ENV === 'development'

export const isDevDb = () => process.env.DB_URL?.includes('file:')