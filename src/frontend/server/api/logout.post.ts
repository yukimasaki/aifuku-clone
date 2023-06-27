export default defineEventHandler(async (event) => {
  deleteCookie(
    event,
    'token',
    {
    httpOnly: true,
    }
  )
  return true
})