export default defineEventHandler(async (event) => {
  const firebaseApiKey = 'AIzaSyDIraHkuFWYdItWEydce1dbaAwBsRNNMeA'
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`

  const reqData = await readBody(event)
  const body = JSON.stringify({
    email: reqData.email,
    password: reqData.password,
    returnSecureToken: true
  })

  // todo: useFetchに置き換える
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
    return await response.json()
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
  return response.ok
})

