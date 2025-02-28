/**
 * The store hook that handles authentication functions.
 *
 * @module Store
 * @version 1.0.0
 * @author Beatriz Sanssi <bs222eh@student.lnu.se>
 */

import {Store, registerInDevtools} from 'pullstate'
import React from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
  sendPasswordResetEmail,
  getAuth,
} from 'firebase/auth'
import {FIREBASE_AUTH, FIREBASE_STORE} from '../../FirebaseConfig'
import {
  doc,
  setDoc,
  getDocs,
  query,
  where,
  collection,
} from 'firebase/firestore'

interface AuthState {
  isLoggedIn: boolean
  initialized: boolean
  user: User | null
  error: string | null
  loading: boolean
}
export const AuthStore = new Store<AuthState>({
  isLoggedIn: false,
  initialized: false,
  user: null,
  error: null,
  loading: true,
})

onAuthStateChanged(FIREBASE_AUTH, (user: User | null) => {
  console.log('onAuthStateChanged:', user)

  AuthStore.update(store => {
    store.loading = true // Start loading when checking auth state
  })

  AuthStore.update(store => {
    store.user = user
    store.isLoggedIn = user ? true : false
    store.initialized = true
    store.loading = false // Stop loading once auth state is determined
  })
})

export const appSignIn = async (
  email: string,
  password: string,
): Promise<{user?: User | null; error?: string | null}> => {
  try {
    const response = await signInWithEmailAndPassword(
      FIREBASE_AUTH,
      email,
      password,
    )

    AuthStore.update(store => {
      store.isLoggedIn = response.user ? true : false
      store.user = response.user
      store.loading = false
    })
    return {user: response.user}
  } catch (error: unknown) {
    // Explicitly typing the error as unknown
    let errorMessage = 'Unknown error occurred'

    if (error instanceof Error) {
      errorMessage = error.message // Safely access message property if error is of type Error
    }

    AuthStore.update(store => {
      store.error = errorMessage
      store.loading = false
    })
    console.error('signIn error:', errorMessage)
    return {error: errorMessage}
  }
}

export const appSignOut = async () => {
  try {
    AuthStore.update(store => {
      store.loading = true // Start loading at the beginning of sign-out
    })

    await signOut(FIREBASE_AUTH)

    AuthStore.update(store => {
      store.isLoggedIn = false
      store.user = null
      store.loading = false
    })
  } catch (error) {
    console.error('signOut error:', error)
    return {error}
  }
}

/**
 * Method to check if a user already exists before creating a new account.
 *
 * @param {string} email - The email of the user.
 * @return {Promise<{userExists: boolean}>} - An object indicating if the username, email, or phone already exists.
 */
export const checkForExistingUser = async (email: string) => {
  try {
    const usersCollection = collection(FIREBASE_STORE, 'users')

    // Check if the username, email, or phone already exists
    const emailQuery = query(usersCollection, where('email', '==', email))
    const [emailSnapshot] = await Promise.all([getDocs(emailQuery)])

    const userExists = !emailSnapshot.empty

    return {userExists}
  } catch (error) {
    console.error('Error checking for existing user:', error)
    throw new Error('Failed to check if user exists')
  }
}

export const appSignUp = async (
  email: string,
  password: string,
  username: string,
  firstName: string,
  lastName: string,
  address: string,
  phoneNumber: string,
  birthDate: string,
  role: string,
) => {
  try {
    AuthStore.update(store => {
      store.loading = true // Start loading
      store.error = null // Clear any existing error
    })

    console.log('Signing up user with email:', email)

    // // Check if the user already exists
    // const {userExists} = await checkForExistingUser(email)

    // if (userExists) {
    //   return {
    //     error: 'This user alredy exists, please try again or Log In',
    //   }
    // }

    const response = await createUserWithEmailAndPassword(
      FIREBASE_AUTH,
      email,
      password,
    )
    console.log('User created successfully:', response.user)

    await updateProfile(response.user, {displayName: username})

    const userRef = doc(FIREBASE_STORE, 'users', response.user.uid)
    await setDoc(userRef, {
      email,
      password,
      displayName: username,
      firstName,
      lastName,
      address,
      phoneNumber,
      birthDate,
      role,
      createdAt: new Date(),
    })

    AuthStore.update(store => {
      store.isLoggedIn = true
      store.user = response.user
      store.loading = false
    })

    return {user: response.user}
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Registration error'

    AuthStore.update(store => {
      store.error = errorMessage
      store.loading = false
    })

    return {error: errorMessage}
  }
}

/**
 * Method to reset the password of a user.
 *
 * @param {string} email - The email of the user.
 * @returns {Promise<void>} - A promise that resolves when the password reset email is sent.
 */
export const resetPassword = async (email: string): Promise<void> => {
  const FIREBASE_AUTH = getAuth()

  const actionCodeSettings = {
    url: 'https://mynewworkoutapp.web.app/finishSignUp',
    handleCodeInApp: true,
    dynamicLinkDomain: 'mynewworkoutapp.page.link',
  }

  try {
    if (!email) {
      throw new Error('Email address is required.')
    }
    await sendPasswordResetEmail(FIREBASE_AUTH, email, actionCodeSettings)
    console.log('Password reset email sent to:', email)
    window.localStorage.setItem('emailForSignIn', email)
  } catch (error) {
    console.error('Error sending password reset email:', error)
    throw new Error(
      error instanceof Error ? error.message : 'Failed to send reset email.',
    )
  }
}

registerInDevtools({AuthStore})
