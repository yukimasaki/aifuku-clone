import { H3Event } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    console.log(`logout`)
    deleteIdTokenFromCookie(event)
    return {}
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Unexpected error',
    })
  }
})

const deleteIdTokenFromCookie = (event: H3Event) => {
  console.log(`deleteIdTokenFromCookie`)
  deleteCookie(event, 'token')
}
