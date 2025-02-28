/**
 * This component is responsible for rendering the registration form.
 *
 * @component RegisterScreen
 * @version 1.0.0
 * @author Beatriz Sanssi <bs222eh@student.lnu.se>
 */

import React, {useState, useEffect} from 'react'
import {useRouter} from 'expo-router'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ImageBackground,
  KeyboardAvoidingView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native'
import {appSignUp, checkForExistingUser, resetPassword} from '../../hooks/store'
import GirlBack from '../../Pictures/GirlBack.jpg'

const {width} = Dimensions.get('window')

// Utility function to validate email format
export const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Utility function to validate birth date (ÅÅMMDD format)
export const isValidBirthDate = (birthDate: string) => {
  const birthDateRegex = /^\d{8}$/ // Must be exactly 6 digits
  return birthDateRegex.test(birthDate)
}

// Utility function to validate phone number (10 digits)
export const isValidPhoneNumber = (phoneNumber: string) => {
  const phoneNumberRegex = /^\d{10}$/ // Must be exactly 10 digits
  return phoneNumberRegex.test(phoneNumber)
}

// Utility function to validate address (not empty)
export const isValidAddress = (address: string) => {
  return address.trim().length > 1 // Ensure it's not an empty string
}

const isMatchingPasswords = (password: string, confirmPassword: string) => {
  return password === confirmPassword
}

const RegisterScreen = () => {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [address, setAddress] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [isUserValid, setIsUserValid] = useState(false)
  const [role, setRole] = useState('user')

  useEffect(() => {
    console.log('isUserValid changed:', isUserValid)
  }, [isUserValid])

  const handleCheckPassword = async () => {
    setLoading(true)
    setError(null)
    console.log('is user valid?', isUserValid)
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError('Please fill out all fields correctly')
      setLoading(false)
      return
    }

    if (!isMatchingPasswords(password, confirmPassword)) {
      console.log('Setting error: Passwords do not match')
      setError('Passwords do not match')
      console.log('is user valid?', isUserValid)
      setLoading(false)
      return false
    }
    console.log('Passwords match!')

    await handleCheckUser()

    console.log('Validation passed.')
    setLoading(false)
    return true
    // console.log('is user valid?', isUserValid)
    // return true
  }

  // Handle the first step of checking if the user exists
  const handleCheckUser = async () => {
    console.log('is user valid?', isUserValid)
    setLoading(true)
    setError(null)

    console.log('Checking user existence...')

    if (!isValidEmail(email)) {
      setError('Invalid email format')
      setLoading(false)
      return
    }

    try {
      const {userExists} = await checkForExistingUser(
        // const userExists = await checkForExistingUser(
        email,
      )
      // console.log('is user valid?', isUserValid)
      // console.log('user exists?', email, userExists)
      if (userExists) {
        setError('User already exists. Please log in or get a reset password.')
        setLoading(false)
        // console.log('is user valid?', isUserValid)
        // console.log('user exists?', email, userExists)
        return
      } else {
        console.log('Setting user as valid...')
        setIsUserValid(true)
        console.log('is user valid?', isUserValid)
        console.log('user exists?', email, userExists)
        setTimeout(() => {}, 100)
      }
    } catch (error) {
      setError('Failed to check if user exists')
    } finally {
      setLoading(false)
    }
  }

  // Handle the registration process after the user is validated
  const handleRegister = async () => {
    console.log('is user valid?', isUserValid)
    setLoading(true)
    setError(null)
    console.log('Setting loading to true')
    const role = 'user'

    if (!username || !birthDate || !address || !phoneNumber) {
      setError('Please fill out all fields correctly')
      setLoading(false)
      return
    }

    if (!isValidBirthDate(birthDate)) {
      setError('Invalid birth date format')
      setLoading(false)
      return
    }

    if (!isValidPhoneNumber(phoneNumber)) {
      setError('Invalid phone number format')
      setLoading(false)
      return
    }

    if (!isValidAddress(address)) {
      setError('Invalid address format')
      setLoading(false)
      return
    }

    try {
      console.log('is user valid?', isUserValid)
      console.log('Calling appSignUp')
      const response = await appSignUp(
        email,
        password,
        username,
        firstName,
        lastName,
        address,
        phoneNumber,
        birthDate,
        role,
      )

      if (response?.user) {
        router.replace('../(inside)/List')
      } else if (response?.error) {
        setError(response.error)
        Alert.alert('Registration Error', response.error)
        setLoading(false)
      }
    } catch (error) {
      console.error('Registration failed:', error)
      setError('Registration failed. Please try again later.')
    } finally {
      console.log('Setting loading to false')
      setLoading(false) // Ensure loading is set to false at the end
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          testID="loading-spinner"
          size="large"
          color="#0000ff"
        />
        <Text>Loading...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={GirlBack}
        style={styles.backgroundImage}
        imageStyle={styles.imageStyle}
      >
        <KeyboardAvoidingView behavior="padding" style={styles.innerContainer}>
          {!isUserValid ? (
            <>
              {error && <Text style={styles.error}>{error}</Text>}
              <TextInput
                placeholder="First Name"
                autoCapitalize="none"
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
              />
              <TextInput
                placeholder="Last Name"
                autoCapitalize="none"
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
              />
              <TextInput
                placeholder="Email"
                style={styles.input}
                value={email}
                autoCapitalize="none"
                onChangeText={setEmail}
              />
              <TextInput
                placeholder="Password"
                secureTextEntry
                style={styles.input}
                value={password}
                onChangeText={setPassword}
              />
              <TextInput
                placeholder="Confirm Password"
                secureTextEntry
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                style={styles.button}
                testID="check-user-button"
                onPress={handleCheckPassword}
              >
                <Text style={styles.buttonText}>Register</Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="login-button"
                style={styles.button}
                onPress={() => router.push('../../Login')}
              >
                <Text style={styles.buttonText}>
                  Already have an account? Login
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TextInput
                placeholder="User Name"
                testID="username-input"
                style={styles.input}
                value={username}
                onChangeText={setUsername}
              />
              <TextInput
                placeholder="Birth Date (YYYY-MM-DD)"
                style={styles.input}
                value={birthDate}
                onChangeText={setBirthDate}
              />
              <TextInput
                placeholder="Adress"
                style={styles.input}
                value={address}
                onChangeText={setAddress}
              />
              <TextInput
                placeholder="Phone Number"
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />
              <TouchableOpacity
                testID="register-button"
                style={styles.button}
                onPress={handleRegister}
              >
                <Text style={styles.buttonText}>Create Account</Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="login-button"
                style={styles.button}
                onPress={() => router.push('../../Login')}
              >
                <Text style={styles.buttonText}>
                  Already have an account? Login
                </Text>
              </TouchableOpacity>
              {error && <Text style={styles.error}>{error}</Text>}
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
    backgroundColor: 'transparent',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: width * 0.6,
    maxWidth: 300,
  },
  error: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
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
  loginLink: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 30,
    fontSize: 25,
    textShadowColor: '#778899',
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  imageStyle: {
    objectFit: 'cover',
  },
})

export default RegisterScreen
