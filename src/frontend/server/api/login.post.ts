import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'

export default defineEventHandler(async (event) => {
  const req = await readBody(event)
  const { email, password } = req

  const auth = getAuth()
  await signInWithEmailAndPassword(auth, email, password)
  .then(userCredential => {
    console.log(userCredential)
  })
  .then(error => {
    console.log(error)
  })
})
