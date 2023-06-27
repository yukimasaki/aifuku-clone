import { useAuth } from "../../composables/useAuth"

export default defineEventHandler(async (event) => {
  const { fetchUserWithToken } = useAuth()
  const response = await fetchUserWithToken(event)

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
