export default defineNuxtRouteMiddleware(async (to, from) => {
  // issue: URLとして認識していないのがエラーの原因？
  const url = 'http://example.com:3001/api/verify'

  // todo: useFetchに置き換える
  const response = await fetch(
    url,
    {
      method: 'POST',
    }
  )

  console.log(response)

  if (!response.ok) {
    console.log(`ログインしていません。`)
    await navigateTo('/login', { replace: true })
  } else {
    console.log(`ログインしています。`)
    await navigateTo('/')
  }
})
