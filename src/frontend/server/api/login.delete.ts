import { getAuth, signOut } from 'firebase/auth'

export default defineEventHandler(async () => {
  try {
    const auth = getAuth()
    const user = auth.currentUser
    await signOut(auth)
    if (user) {
      console.log(`here`)
      return JSON.stringify({
        uid: user.uid
      })
    } else {
      // user === null (既にログアウトしている)
    }
  } catch (error) {
    // 例外
    console.log(error)
  }
})
