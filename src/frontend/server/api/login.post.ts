export default defineEventHandler(async (event) => {
  const firebaseApiKey = 'AIzaSyDIraHkuFWYdItWEydce1dbaAwBsRNNMeA'
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`

  const reqData = await readBody(event)
  const body = JSON.stringify({
    email: reqData.email,
    password: reqData.password,
    returnSecureToken: true
  })

  const response = await fetch(
    url,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    }
  )

  if (!response.ok) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Login failed'
    })
  }

  const responseData = await response.json()
  setCookie(
    event,
    'token',
    responseData.idToken,
    {
      httpOnly: true,
      maxAge: responseData.expiresIn
    },
  )
  
  return JSON.stringify({ uid: responseData.localId })
})

