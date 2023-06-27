export const useAuth = () => {
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
      return navigateTo('/')
    }
  }

  return {
    verify,
    login,
    logout,
  }
}
