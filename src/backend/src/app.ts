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
app.use(cors())
app.use(cookieParser())

app.use('/users', userRouter)
app.use('/login', loginRouter)
app.use('/verify', verifyRouter)

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/`)
})
