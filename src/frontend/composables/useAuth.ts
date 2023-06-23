import { getAuth, onAuthStateChanged } from 'firebase/auth'

export const useAuth = () => {
  const checkAuthState = () => {
    const auth = getAuth()
    onAuthStateChanged(auth, (user) => {
      console.log(user)
      return user
    })
  }

  return {
    checkAuthState
  }
}
