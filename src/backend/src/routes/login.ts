import express from 'express'
const router = express.Router()

// POST /login
router.post('/', async (req, res) => {
  const firebaseApiKey = 'AIzaSyDIraHkuFWYdItWEydce1dbaAwBsRNNMeA'
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`
  const { email, password } = req.body
  const body = JSON.stringify({
    email,
    password,
    returnSecureToken: true
  })

  await fetch(
    url,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    }
  )
  .then(result => {
    console.log(result)
  })
  .catch(error => {
    console.log(error)
  })
})

//   const auth = getAuth()

//   await signInWithEmailAndPassword(auth, email, password)
//   .then((userCredential) => {
//     const user = userCredential.user
//     res.status(200).json({ message: 'ok', user: user })
//   })
//   .catch((error) => {
//     res.status(401).json({ message: 'ng', error: error })
//   })

export default router
