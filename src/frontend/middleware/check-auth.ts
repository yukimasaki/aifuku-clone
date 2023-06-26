export default defineNuxtRouteMiddleware(async (to, from) => {
  // issue: URLとして認識していないのがエラーの原因？
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
    await navigateTo('/login', { replace: true })
  } else {
    console.log(`ログインしています。`)
    await navigateTo('/test')
  }
})
