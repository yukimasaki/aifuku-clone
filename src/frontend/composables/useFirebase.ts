export const useFirebase = () => {
  const apiKey = 'AIzaSyDIraHkuFWYdItWEydce1dbaAwBsRNNMeA'
  const baseUrl = `https://identitytoolkit.googleapis.com/v1`

  const signUp = async (email: string, password: string) => {
    const endPoint = `accounts:signUp`
    const url = `${baseUrl}/${endPoint}?key=${apiKey}`

    const body = {
      email,
      password,
      returnSecureToken: true,
    }

    const response = await fetch(url,{
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    return await response.json()
  }

  const deleteUser = async (idToken: string) => {
    const endPoint = `accounts:delete`
    const url = `${baseUrl}/${endPoint}?key=${apiKey}`

    const body = {
      idToken
    }

    const response = await fetch(url,{
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    return await response.json()
  }

  const signInWithEmailAndPassword = async (email: string, password: string) => {
    const endPoint = `accounts:signInWithPassword`
    const url = `${baseUrl}/${endPoint}?key=${apiKey}`

    const body = {
      email,
      password,
      returnSecureToken: true,
    }

    const response = await fetch(url,{
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    return await response.json()
  }

  return {
    signUp,
    deleteUser,
    signInWithEmailAndPassword,
  }
}
