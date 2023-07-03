import { getAuth, signOut } from 'firebase/auth'
import { H3Event } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const uid = await logout()
    deleteIdTokenFromCookie(event)
    return JSON.stringify({ uid })
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Unexpected Error',
    })
  }
})

const logout = async () => {
  console.log(`logout`)
  const auth = getAuth()
  const user = auth.currentUser

  await signOut(auth)
  return user?.uid
}

const deleteIdTokenFromCookie = (event: H3Event) => {
  console.log(`deleteIdTokenFromCookie`)
  deleteCookie(event, 'token')
}
