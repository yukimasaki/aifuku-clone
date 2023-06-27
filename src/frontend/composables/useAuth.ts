import { H3Event } from 'h3'

export const useAuth = () => {
  const fetchUserWithToken = async (event: H3Event) => {
    const firebaseApiKey = 'AIzaSyDIraHkuFWYdItWEydce1dbaAwBsRNNMeA'
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseApiKey}`

    const idToken = getCookie(event, 'token')
    const body = JSON.stringify({ idToken })

    const response = await fetch(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      }
    )

    return response
  }

  const verify = async () => {
    const url = '/api/verify'

    const { data } =  await useFetch(
      url,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (data.value) {
      const uid = JSON.parse(data.value)
      return uid
    }
  }

  const login = async (email: String, password: String) => {
    const url = '/api/login'

    const { data } = await useFetch(
      url,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { email, password }
      }
    )

    if (data.value) {
      // ログイン成功
      return navigateTo('/')
    }
  }

  const logout = async () => {
    const url = '/api/logout'

    const { data } = await useFetch(
      url,
      {
        method: 'POST',
      }
    )

    if (data.value) {
      // ログアウト成功
      console.log(data.value)
      return navigateTo('/login')
    }
  }

  return {
    fetchUserWithToken,
    verify,
    login,
    logout,
  }
}
