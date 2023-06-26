export default defineEventHandler(async (event) => {
  const firebaseApiKey = 'AIzaSyDIraHkuFWYdItWEydce1dbaAwBsRNNMeA'
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`

  const reqData = await readBody(event)
  const body = JSON.stringify({
    email: reqData.email,
    password: reqData.password,
    returnSecureToken: true
  })

  await fetch(
    url,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    }
  )
  .then(response => {
    return response.json()
  })
  .then(data => {
    setCookie(event, 'token', data.idToken, { secure: true, httpOnly: true })
  })
  .catch(error => {
    throw createError({
      statusCode: 400,
      statusMessage: 'Authentication failed.',
      message: error
    })
  })
})

