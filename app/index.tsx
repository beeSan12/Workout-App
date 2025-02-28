/**
 * The index screen for the app.
 * @component Home
 * @version 1.0.0
 * @author Beatriz Sanssi <bs222eh@student.lnu.se>
 */

import React, {useEffect} from 'react'
import {View, Text, ActivityIndicator} from 'react-native'
import {useAuth} from './hooks/AuthCheck'
import {useRouter, useRootNavigationState} from 'expo-router'
import {appSignOut} from './hooks/store'

/**
 * Home page
 *
 * @return {JSX.Element} - Home page
 */
export default function Home() {
  appSignOut()
  const {uid, loading} = useAuth()
  const router = useRouter()
  const navigationState = useRootNavigationState() // Check if root layout has mounted

  // This effect logs the user out once Firebase auth state is initialized
  useEffect(() => {
    if (!loading && navigationState?.key) {
      if (uid) {
      } else {
        router.replace('/Login')
      }
    }
  }, [loading, uid, navigationState?.key, router])

  if (loading || !navigationState?.key) {
    // Wait for both auth state and layout to load
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    )
  }

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>Redirecting to login...</Text>
    </View>
  )
}
