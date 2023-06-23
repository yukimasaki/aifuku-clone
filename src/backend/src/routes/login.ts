import express from 'express'
const router = express.Router()

// POST /login
// router.post('/', async (req, res) => {
//   const auth = getAuth()
//   const email = req.body.email
//   const password = req.body.password

//   await signInWithEmailAndPassword(auth, email, password)
//   .then((userCredential) => {
//     const user = userCredential.user
//     res.status(200).json({ message: 'ok', user: user })
//   })
//   .catch((error) => {
//     res.status(401).json({ message: 'ng', error: error })
//   })
// })

export default router
