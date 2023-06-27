import { useAuth } from '../../composables/useAuth'

export default defineEventHandler(async (event) => {
  const { fetchUserWithToken } = useAuth()
  const response = await fetchUserWithToken(event)

  if (!response.ok) {
    return false
  } else {
    deleteCookie(
      event,
      'token',
      {
      httpOnly: true,
      }
    )
    return true
  }
})
