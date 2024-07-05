import { ACError, createRouter, Result, successfulAuthentication } from 'aeria'

export const twitchRouter = createRouter()

const TWITCH_TOKEN_URL = 'https://id.twitch.tv/oauth2/token'

const TWITCH_USER_URL = 'https://api.twitch.tv/helix/users'

//exchange twitch temporary code for an Access Token so we can access user data
async function exchangeCodeForAccessToken(code: string) {
  if(!process.env.TWITCH_CLIENT_ID || !process.env.TWITCH_CLIENT_SECRET){
    throw new Error('INVALID ENV FILES')
  }

  const CLIENT_ID = process.env.TWITCH_CLIENT_ID
  const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET

  const body = {
    code: code,
    grant_type: 'authorization_code',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: 'http://localhost:8080/redirect'
  }
  const twitchResponse = await fetch(TWITCH_TOKEN_URL,{
    method: 'POST',
    body: new URLSearchParams(body),
    headers: {
      Accept: 'application/json',
    },
  })
  const responseObject = await twitchResponse.json()
  return responseObject
}
//get twitch user data with Access Token
async function fetchUser(token: string) {
  if(!process.env.TWITCH_CLIENT_ID){
    throw new Error('INVALID ENV FILES')
  }
  const CLIENT_ID = process.env.TWITCH_CLIENT_ID

  const userResponse = await fetch(TWITCH_USER_URL,{
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Client-ID': CLIENT_ID,
      'Accept': 'application/vnd.twitchtv.v5+json',
    },
  })
  const response = await userResponse.json()
  return response.data[0]
}

twitchRouter.POST('/twitchAuth', async(context)=>{

  const twitchTempToken = await exchangeCodeForAccessToken(context.request.payload.code) //swap code for access token
  const twitchTempUser = await fetchUser(twitchTempToken.access_token) // get twitch user data

  //checks if there's an user with a twitch account on the database.
  const { error: userError ,result: user } = await context.collections.user.functions.get({
    filters: {
      twitch_id: twitchTempUser.id.toString(),
    },
  })
  
  if(userError){
    
    //Check what user error returns
    switch(userError.code){
      case ACError.ResourceNotFound:{
        //if there's no user on database, create one.
        const { error: userInsertError, result: userInsertResult } = await context.collections.user.functions.insert({
          what: {
            name: twitchTempUser.login,
            active: true,
            twitch_id: twitchTempUser.id.toString(),
            roles: ['root'],
            email: `${twitchTempUser.login}@user.twitch.com`,
          },
        })
        if (userInsertError){
          return Result.error(userInsertError)
        }
        //Authenticate if successful, and return result to web
        return Result.result(await successfulAuthentication(userInsertResult._id, context))
      }
      default: 
        return Result.error(userError)
    }
  }
  //if user already exists in database just authenticate and return result to web
  return Result.result(await successfulAuthentication(user._id, context))
})
