declare global {
  namespace NodeJS {
    interface ProcessEnv extends Record<
      | 'API_URL'
      | 'APPLICATION_SECRET'
      | 'MONGODB_URL'
      | 'GODMODE_USERNAME'
      | 'GODMODE_PASSWORD'
      | 'STORAGE_PATH'
      | 'STORAGE_TEMP_PATH'
      | 'TWITCH_CLIENT_ID'
      | 'TWITCH_CLIENT_SECRET',
      string
    > {}
  }
}

export {}
