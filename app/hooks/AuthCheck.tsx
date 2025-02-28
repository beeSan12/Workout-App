/**
 * This module provides a context for the authentication status of the user.
 *
 * @module AuthCheck
 * @version 1.0.0
 * @author Beatriz Sanssi <bs222eh@student.lnu.se>
 */

import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from 'react'
import {ActivityIndicator, View} from 'react-native'
import {onAuthStateChanged, User} from 'firebase/auth'
import {FIREBASE_AUTH} from '../../FirebaseConfig'

interface AuthContextValue {
  uid: string | null
  user: User | null
  loading: boolean
}

const AuthCheck = createContext<AuthContextValue>({
  uid: null,
  user: null,
  loading: true,
})

export const useAuth = () => useContext(AuthCheck)

export const AuthProvider = ({children}: {children: ReactNode}) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      FIREBASE_AUTH,
      (user: User | null) => {
        if (user) {
          setUser(user)
        } else {
          setUser(null)
        }
        setLoading(false)
      },
    )

    return unsubscribe
  }, [])

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
    <AuthCheck.Provider value={{uid: user?.uid || null, user, loading}}>
      {children}
    </AuthCheck.Provider>
  )
}
