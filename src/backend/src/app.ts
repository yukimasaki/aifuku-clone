import express from 'express'
import cors from 'cors'
import FirebaseAdmin from 'firebase-admin'
import { initializeApp } from 'firebase/app'

import indexRouter from './routes'
import helloworldRouter from './routes/helloworld'
import userRouter from './routes/users'
import signupRouter from './routes/signup'
import loginRouter from './routes/login'

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
const port = 3000

app.use('/', indexRouter)
app.use('/helloworld', helloworldRouter)
app.use('/users', userRouter)
app.use('/signup', signupRouter)
app.use('/login', loginRouter)

FirebaseAdmin.initializeApp({
  credential: FirebaseAdmin.credential.applicationDefault(),
  databaseURL: process.env.GOOGLE_APPLICATION_DATABASE
})

const firebaseConfig = {
  apiKey: process.env.APP_APIKEY,
  authDomain: process.env.APP_AUTHDOMAIN,
  projectId: process.env.APP_PROJECTID,
  storageBucket: process.env.APP_STORAGEBUCKET,
  messagingSenderId: process.env.APP_MESSAGESENDER,
  appId: process.env.APP_APPID
}

// Firebaseの初期化
initializeApp(firebaseConfig)

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/`)
})
