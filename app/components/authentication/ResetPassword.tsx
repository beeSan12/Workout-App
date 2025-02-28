import {useEffect, useState} from 'react'
import {useRouter} from 'expo-router'
import {
  getAuth,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from 'firebase/auth'

const FinishSignUp = () => {
  const router = useRouter()
  const [email, setEmail] = useState('')

  useEffect(() => {
    const auth = getAuth()
    const link = window.location.href

    if (isSignInWithEmailLink(auth, link)) {
      const savedEmail = window.localStorage.getItem('emailForSignIn')
      const userEmail = savedEmail || prompt('Please provide your email:')

      if (userEmail) {
        signInWithEmailLink(auth, userEmail, link)
          .then(result => {
            console.log('User signed in successfully:', result.user)
            window.localStorage.removeItem('emailForSignIn')
            router.replace('/components/(inside)/List')
          })
          .catch(error => {
            console.error('Error during sign-in:', error)
          })
      }
    }
  }, [])

  return (
    <div>
      <h1>Completing your sign-up...</h1>
      {email && <p>Signing in with email: {email}</p>}
    </div>
  )
}

export default FinishSignUp
