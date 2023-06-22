import { getAuth, onAuthStateChanged } from 'firebase/auth'

export const useAuth = () => {
  const auth = getAuth()
  onAuthStateChanged(auth, (user) => {
    return user
  })
}
