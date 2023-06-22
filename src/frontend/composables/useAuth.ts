import { getAuth, onAuthStateChanged } from 'firebase/auth'

export const useAuth = () => {
  const checkAuthState = async () => {
    const auth = await getAuth()
    await onAuthStateChanged(auth, (user) => {
      return user
    })
  }

  return {
    checkAuthState
  }
}
