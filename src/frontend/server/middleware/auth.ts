import { useFirebase } from '../../composables/useFirebase'

export default defineEventHandler(async (event) => {
  const method = event.node.req.method
  const path = event.node.req.url

  // トップレベルのif文はmethodとpathがundefinedのまま引数に渡されるのを防ぐための措置
  if (method && path) {
    if (noAuthRequired(method, path)) {
      // リクエスト先URLが認証を必要としない場合はそのままリクエスト先URLへアクセスする
      console.log(`認証不要`)
      console.log(`------------`)
      console.log(`${method} ${path}`)
      return
    } else {
      //リクエスト先URLが認証を必要とする場合は認証状態を取得する
      console.log(`要認証`)
      const idToken = getCookie(event, 'token')
      if (idToken) {
        const user = await isAuthenticated(idToken)
        if (user) {
          // 認証状態であればそのままリクエスト先URLへアクセスする
          console.log(`認証済み`)
          return
        }
      }

      // 未認証状態であれば/loginへリダイレクトする
      // sendRedirect(event, '/login', 302)

      // 未認証状態であれば例外をスローする
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
        message: 'Unauthorized execute API error',
      })
    }
  } else {
    // methodとpathがundefinedになるってどんな時？
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Unexpected error',
    })
  }
})

const noAuthRequired = (method: string, path: string) => {
  const excludeRules = [
    { method: 'POST', path: '/api/login' },
    { method: 'GET', path: '/login' },
  ]

  return excludeRules.some(rule => {
    if (method === rule.method && path === rule.path) {
      return true
    } else {
      return false
    }
  })
}

const isAuthenticated = async (idToken: string) => {
  const { checkAuthState } = useFirebase()
  const response = await checkAuthState(idToken)
  return response
}
