export default defineEventHandler((event) => {
  const method = event.node.req.method
  const path = event.node.req.url

  // トップレベルのif文はmethodとpathがundefinedのまま引数に渡されるのを防ぐための措置
  if (method && path) {
    if (noAuthRequired(method, path)) {
      // リクエスト先URLが認証を必要としない場合はそのままリクエスト先URLへアクセスする
      console.log(`認証不要`)
      return
    } else {
      //リクエスト先URLが認証を必要とする場合は認証状態を取得する
      console.log(`要認証`)
      // if (isAuthenticated()) {
      //   // 認証状態であればそのままリクエスト先URLへアクセスする
      //   console.log(`認証中`)
      //   return
      // } else {
      //   // 未認証状態であれば/loginへリダイレクトする
      //   console.log(`未認証`)
      //   return sendRedirect(event, '/api/login', 302)
      // }
      return
    }
  } else {
    // methodとpathがundefinedになるってどんな時？
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Unexpected error'
    })
  }
})

const noAuthRequired = (method: string, path: string) => {
  const excludeRules = [
    { method: 'POST', path: '/api/login' },
  ]

  return excludeRules.some(rule => {
    if (method === rule.method && path === rule.path) {
      return true
    } else {
      return false
    }
  })
}
