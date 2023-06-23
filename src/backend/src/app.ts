import express from 'express'
import cors from 'cors'
import FirebaseAdmin from 'firebase-admin'

import indexRouter from './routes'
import helloworldRouter from './routes/helloworld'
import userRouter from './routes/users'
import loginRouter from './routes/login'

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
const port = 3000

app.use('/', indexRouter)
app.use('/helloworld', helloworldRouter)
app.use('/users', userRouter)
app.use('/login', loginRouter)

FirebaseAdmin.initializeApp({
  credential: FirebaseAdmin.credential.applicationDefault(),
  databaseURL: process.env.GOOGLE_APPLICATION_DATABASE
})

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/`)
})
