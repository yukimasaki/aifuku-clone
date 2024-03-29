export const useAuth = () => {
  const verify = async () => {
    const firebaseApiKey = 'AIzaSyDIraHkuFWYdItWEydce1dbaAwBsRNNMeA'
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseApiKey}`

    const tokenCookie = useCookie('token')
    if (!tokenCookie.value) return false

    const body = JSON.stringify({ idToken: tokenCookie.value})
    const response = await fetch(url,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    })

    const user = await response.json()

    return user
  }

  const login = async (email: String, password: String) => {
    const url = '/api/auth/signin'

    const { data } = await useFetch(url,{
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { email, password }
    })

    if (data.value) {
      // ログイン成功
      return navigateTo('/')
    }
  }

  const logout = async () => {
    const url = '/api/login'
    const tokenCookie = useCookie('token')

    const { data } = await useFetch(url,{
      method: 'DELETE',
      headers: {
        'Authorization': tokenCookie.value || ''
      }
    })

    if (data.value) {
      // ログアウト成功
      return navigateTo('/login')
    }
  }

  return {
    verify,
    login,
    logout,
  }
}
