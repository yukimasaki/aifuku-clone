import express from 'express'
import FirebaseAdmin from 'firebase-admin'

const router = express.Router()

// GET /users
router.post('/', async (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
    displayName: req.body.displayName,
  }
  await FirebaseAdmin.auth().createUser(user)
  .then((userRecord) => {
    res.status(200).json({ message: 'ok', uid: userRecord.uid })
  })
  .catch((error) => {
    res.status(400).json({ message: 'ng', error: error })
  })
})

export default router
