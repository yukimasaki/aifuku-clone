import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import userRouter from './routes/users'
import loginRouter from './routes/login'
import verifyRouter from './routes/verify'

const app = express()
const port = 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// CORS設定あり
app.use(cors({ credentials: true, origin: 'http://nuxt-container.local:3001' }))
app.use(cookieParser())

app.use('/users', userRouter)
app.use('/login', loginRouter)
app.use('/verify', verifyRouter)

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/`)
})
