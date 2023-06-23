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
  .then(response => {
    return response.json()
  })
  .then(data => {
    if (data.error) {
      res.status(400).json({ message: 'ng', error: data.error })
    } else {
      console.log(`本当はcookieに保存できてるはず・・・`)
      res.cookie('token', data.idToken, { httpOnly: true })
      .status(200).json({ message: 'ok', data })
    }
  })
  .catch(error => {
    res.status(401).json({ message: 'ng', error })
  })
})

export default router
