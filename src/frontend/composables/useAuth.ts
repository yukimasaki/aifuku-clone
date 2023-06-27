export const useAuth = () => {
  const verify = async () => {
    const url = '/api/verify'

    const { data } =  await useFetch(
      url,
      {
        method: 'POST',
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
