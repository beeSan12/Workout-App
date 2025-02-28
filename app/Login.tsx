/**
 * The login screen.
 * @component Login
 * @version 1.0.0
 * @author Beatriz Sanssi <bs222eh@student.lnu.se>
 */

import React, {useState} from 'react'
import {useRouter} from 'expo-router'
import DumbBells from './Pictures/DumbBells.png'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ImageBackground,
  TouchableOpacity,
  KeyboardAvoidingView,
  ActivityIndicator,
  Dimensions,
} from 'react-native'
import {doc, setDoc} from 'firebase/firestore'
import {FIREBASE_STORE} from '../FirebaseConfig'
import {appSignIn, resetPassword} from './hooks/store'

const {width} = Dimensions.get('window')
const Login = () => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
    setLoading(true)
    setError(null)

    const {user, error} = await appSignIn(email, password)
    console.log('appSignIn result:', user, error)

    if (user && user.uid) {
      console.log('User logged in!', user, email)
      console.log('appSignIn result:', user, error)
      try {
        if (user.uid) {
          const userRef = doc(FIREBASE_STORE, 'users', user.uid ?? '')

          console.log('Attempting to write to Firestore path:', userRef.path)
          await setDoc(
            userRef,
            {
              lastLogin: new Date().toISOString(),
            },
            {merge: true},
          )
          console.log('User last login updated in Firestore')
          console.log('Login successful, navigating to List...')
          router.replace('/components/(inside)/List')
        } else {
          console.error('User UID is undefined')
          console.error(
            'Router navigation not triggered. User:',
            user,
            'Error:',
            error,
          )
        }
      } catch (firestoreError) {
        console.error(
          'Error updating user document in Firestore: ',
          firestoreError,
        )
      }
    } else if (error) {
      console.error('Login error:', error)
      setError(error)
    }
    setLoading(false)
  }

  const handleResetPassword = async () => {
    try {
      if (!email) {
        setError('Please enter your email address to reset the password.')
        return
      }
      setError(null)
      await resetPassword(email)
      Alert.alert('Success', 'Password reset email sent!')
    } catch (error: any) {
      setError(error.message || 'Failed to send password reset email.')
      Alert.alert('Error', error.message)
    }
  }

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator
          testID="loading-spinner"
          size="large"
          color="#0000ff"
        />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={DumbBells}
        style={styles.backgroundImage}
        imageStyle={styles.imageStyle}
      >
        <KeyboardAvoidingView behavior="padding" style={styles.innerContainer}>
          <TextInput
            placeholder="Email"
            style={styles.input}
            value={email}
            autoCapitalize="none"
            onChangeText={setEmail}
          />
          <TextInput
            placeholder="Password"
            secureTextEntry={true}
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />
          {/* Display error message if there's an error */}
          {error && (
            <Text testID="error-message" style={styles.error}>
              Login error: {error}
            </Text>
          )}

          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <>
              <TouchableOpacity
                testID="login-button"
                style={styles.button}
                onPress={handleLogin}
              >
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="reset-password-button"
                style={styles.button}
                onPress={handleResetPassword}
              >
                <Text style={styles.buttonText}>Reset Password</Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="register-button"
                style={styles.button}
                onPress={() =>
                  router.push('./components/authentication/register-index')
                }
              >
                <Text style={styles.buttonText}>
                  Don´t have an account? Register
                </Text>
              </TouchableOpacity>
            </>
          )}
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  input: {
    marginBottom: 10,
    margin: 20,
    borderWidth: 1,
    padding: 10,
    backgroundColor: '#FFF',
    borderColor: '#EBECF4',
    shadowColor: '#454D65',
    shadowOffset: {height: 5, width: 0},
    shadowRadius: 15,
    shadowOpacity: 0.2,
    borderRadius: 5,
    width: width * 0.8,
    alignSelf: 'center',
    maxWidth: 400,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#778899',
    padding: 10,
    margin: 20,
    marginBottom: 0,
    borderRadius: 5,
    alignItems: 'center',
    width: width * 0.8,
    maxWidth: 400,
    alignSelf: 'center',
    fontSize: 20,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 20,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  imageStyle: {
    opacity: 0.3,
    objectFit: 'cover',
  },
})

export default Login
