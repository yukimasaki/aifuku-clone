
import { initializeApp } from 'firebase/app'

export default defineNitroPlugin(() => {
  const firebaseConfig = {
    apiKey: 'AIzaSyDIraHkuFWYdItWEydce1dbaAwBsRNNMeA',
    authDomain: 'aifuku-40052.firebaseapp.com',
    databaseURL: 'https://aifuku-40052-default-rtdb.firebaseio.com',
    projectId: 'aifuku-40052',
    storageBucket: 'aifuku-40052.appspot.com',
    messagingSenderId: '1003164880518',
    appId: '1:1003164880518:web:c2a6b0b17662da52c00b07',
  }

  initializeApp(firebaseConfig)
})
