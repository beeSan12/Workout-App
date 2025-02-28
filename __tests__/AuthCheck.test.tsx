/**
 * This is a test file for the Auth check component.
 * @test {AuthCheck}
 * @version 1.0.0
 * @author Beatriz Sanssi <bs222eh@student.lnu.se>
 */

import React from 'react'
import {render, waitFor} from '@testing-library/react-native'
import {AuthProvider, useAuth} from '../app/hooks/AuthCheck'
import {onAuthStateChanged} from 'firebase/auth'
import {FIREBASE_AUTH} from '../FirebaseConfig'
import {View, Text} from 'react-native'
import {User} from 'firebase/auth'

// Mock Firebase Auth functions
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
}))

jest.mock('../FirebaseConfig', () => ({
  FIREBASE_AUTH: jest.fn(),
}))

const MockChildComponent = () => {
  const {uid, user, loading} = useAuth()

  if (loading) {
    return <Text>Loading...</Text>
  }

  return (
    <View>
      <Text>{user ? `User ID: ${uid}` : 'No User Logged In'}</Text>
    </View>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers() // Use fake timers
  })

  afterEach(() => {
    jest.useRealTimers() // Restore real timers after each test
  })

  it('should show loading indicator while loading', async () => {
    // Mock the onAuthStateChanged to simulate loading with a delay
    ;(onAuthStateChanged as jest.Mock).mockImplementation(
      (_auth: typeof FIREBASE_AUTH, callback: (user: User | null) => void) => {
        setTimeout(() => callback(null), 2000) // Delay the callback to simulate loading
        return jest.fn() // Mock unsubscribe function
      },
    )

    const {getByText, getByTestId} = render(
      <AuthProvider>
        <MockChildComponent />
      </AuthProvider>,
    )

    // Move time forward to simulate the timeout
    expect(getByTestId('loading-spinner')).toBeTruthy() // Assert "Loading..." is present

    // Advance the timers to simulate the loading state ending
    jest.advanceTimersByTime(2000)

    // After the timer finishes, we expect "No User Logged In"
    await waitFor(() => {
      expect(getByText('No User Logged In')).toBeTruthy()
    })
  })

  it('should display user information when authenticated', async () => {
    // Mock the onAuthStateChanged to simulate a logged-in user
    const mockUser = {uid: '12345'} as User // Ensure mockUser is typed as User
    ;(onAuthStateChanged as jest.Mock).mockImplementation(
      (_auth: typeof FIREBASE_AUTH, callback: (user: User | null) => void) => {
        callback(mockUser)
        return jest.fn() // Mock unsubscribe function
      },
    )

    const {getByText} = render(
      <AuthProvider>
        <MockChildComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      // Expect the User ID to be displayed
      expect(getByText('User ID: 12345')).toBeTruthy()
    })
  })

  it('should display no user information when not authenticated', async () => {
    // Mock the onAuthStateChanged to simulate no logged-in user
    ;(onAuthStateChanged as jest.Mock).mockImplementation(
      (_auth: typeof FIREBASE_AUTH, callback: (user: User | null) => void) => {
        callback(null)
        return jest.fn() // Mock unsubscribe function
      },
    )

    const {getByText} = render(
      <AuthProvider>
        <MockChildComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      // Expect the "No User Logged In" text to be displayed
      expect(getByText('No User Logged In')).toBeTruthy()
    })
  })
})
