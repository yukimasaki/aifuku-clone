import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'

export default defineEventHandler(async (event) => {
  const req = await readBody(event)
  const { email, password } = req

  const auth = getAuth()
  signInWithEmailAndPassword(auth, email, password)
  .then(userCredential => {
    console.log(userCredential.user)
    return JSON.stringify(userCredential.user)
  })
  .catch(error => {
    const errorCode = error.code
    if (errorCode === 'auth/user-not-found') {
      throw createError({
        statusCode: 400,
        statusMessage: errorCode
      })
    }
  })
})
