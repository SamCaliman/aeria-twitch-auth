import { createRouter, Result } from 'aeria'
import { twitchRouter } from './twitch.js'

export const router = createRouter()

router.GET('/test', async (context) => {
  const { error, result: people } = await context.collections.user.functions.getAll()

  if( error ) {
    return Result.error(error)
  }

  return Result.result({
    message: 'Hello, world!',
    people,
  })
})

router.group('/twitch', twitchRouter)
