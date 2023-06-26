export default defineNuxtRouteMiddleware(async (to, from) => {
  const url = '/api/verify'
  const response = await fetch(
    url,
    {
      method: 'GET',
    }
  )

  console.log(response)

  if (!response.ok) {
    console.log(`ログインしていません。`)
    // return navigateTo('/login', { replace: true })
  } else {
    console.log(`ログインしています。`)
    // return navigateTo('/test')
  }
})
