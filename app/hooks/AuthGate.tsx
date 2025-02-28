/**
 * This module provides a component that checks if the user is authenticated.
 *
 * @module AuthGate
 * @version 1.0.0
 * @author Beatriz Sanssi <bs222eh@student.lnu.se>
 */

import {useRouter, useSegments} from 'expo-router'
import {useEffect} from 'react'
import {ActivityIndicator, View} from 'react-native'
import {useAuth} from './AuthCheck'
import React, {ReactNode} from 'react'

interface AuthGateProps {
  children: ReactNode
}

export const AuthGate = ({children}: AuthGateProps) => {
  const {user, uid, loading} = useAuth()
  const router = useRouter()
  const segments = useSegments() as string[]

  useEffect(() => {
    if (!loading) {
      if (!uid && !user) {
        router.replace('/Login')
      } else if (uid && segments?.[0] === 'sign-in') {
        router.replace('/components/(inside)/List')
      }
    }
  }, [uid, user, loading, segments, router])

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return <>{children}</>
}
