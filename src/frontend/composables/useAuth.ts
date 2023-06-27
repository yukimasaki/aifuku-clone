export const useAuth = () => {
  const verify = async () => {
    const url = '/api/verify'

    const { data: uid } =  await useFetch(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    return uid.value
  }

  const login = async (email: String, password: String) => {
    const url = '/api/login'

    await useFetch(
      url,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { email, password }
      }
    )    
  }

  return {
    verify,
    login,
  }
}
