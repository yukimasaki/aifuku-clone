export default defineNuxtRouteMiddleware(async () => {
  const url = '/api/verify'
  await fetch(
    url,
    {
      method: 'GET',
    }
  )
})
