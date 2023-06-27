export default defineEventHandler(async (event) => {
  const firebaseApiKey = 'AIzaSyDIraHkuFWYdItWEydce1dbaAwBsRNNMeA'
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseApiKey}`

  const idToken = getCookie(event, 'token')
  const body = JSON.stringify({ idToken })

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
    const result = await response.json()
    const { error } = result
    throw createError({
      statusCode: error.code,
      statusMessage: error.message,
    })
  } else {
    const result  = await response.json()
    const uid = result.users[0].localId
    return JSON.stringify({ uid })
  }
})
