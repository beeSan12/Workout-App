/**
 * This is a test file for the Login component.
 * @test {Login}
 * @version 1.0.0
 * @author Beatriz Sanssi <bs222eh@student.lnu.se>
 */

import React from 'react'
import {render, fireEvent, waitFor} from '@testing-library/react-native'
import Login from '../app/Login'
import {appSignIn, resetPassword} from '../app/hooks/store'
import {FIREBASE_STORE} from '../FirebaseConfig'
import {setDoc, doc} from 'firebase/firestore'

beforeEach(() => {
  jest.useFakeTimers()
  jest.clearAllMocks()
})

afterEach(() => {
  jest.useRealTimers()
  jest.restoreAllMocks()
})

// Mock appSignIn
jest.mock('../app/hooks/store', () => ({
  resetPassword: jest.fn(),
  appSignIn: jest.fn(() =>
    Promise.resolve({
      user: {uid: '12345', email: 'test@example.com'},
    }),
  ),
}))

// Mock useRouter from expo-router
const mockPush = jest.fn()
const mockReplace = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
    replace: mockReplace,
    back: jest.fn(),
  })),
}))

jest.mock('../FirebaseConfig', () => ({
  FIREBASE_STORE: {
    collection: jest.fn(),
    doc: jest.fn((collectionPath, uid) => ({
      path: `${collectionPath}/${uid}`,
    })),
    setDoc: jest.fn().mockResolvedValue(null),
  },
  FIREBASE_AUTH: {
    currentUser: {uid: '12345'},
  },
}))

jest.mock('../FirebaseConfig', () =>
  require('../__mocks__/FirebaseConfig.mock'),
)

jest.mock('firebase/firestore', () => ({
  doc: jest.fn((store, collection, id) => ({id, path: `${collection}/${id}`})),
  setDoc: jest.fn().mockResolvedValue(null),
}))

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

describe('Login Component', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should show error on invalid login credentials', async () => {
    ;(appSignIn as jest.Mock).mockResolvedValue({error: 'Invalid credentials'})

    const {getByText, getByPlaceholderText} = render(<Login />)

    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com')
    fireEvent.changeText(getByPlaceholderText('Password'), 'wrongpassword')

    fireEvent.press(getByText('Login'))

    await waitFor(() => {
      expect(getByText('Login error: Invalid credentials')).toBeTruthy()
    })
  })

  it('should show loading spinner during login process', async () => {
    ;(appSignIn as jest.Mock).mockImplementation(
      () =>
        new Promise(resolve =>
          setTimeout(() => resolve({user: {uid: '12345'}}), 100),
        ),
    )

    const {getByTestId, getByText, getByPlaceholderText} = render(<Login />)

    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com')
    fireEvent.changeText(getByPlaceholderText('Password'), 'correctpassword')

    fireEvent.press(getByText('Login'))

    // Check if the loading spinner appears
    expect(getByTestId('loading-spinner')).toBeTruthy()

    // Wait for the login process to finish
    await waitFor(() => {
      expect(getByText('Login')).toBeTruthy()
    })
  })

  it('should display error if email or password is missing', async () => {
    ;(appSignIn as jest.Mock).mockResolvedValue({
      error: 'Email and password are required',
    })

    const {getByText, getByPlaceholderText} = render(<Login />)

    // Test with missing password
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com')
    fireEvent.press(getByText('Login'))

    await waitFor(() => {
      expect(
        getByText('Login error: Email and password are required'),
      ).toBeTruthy()
    })

    // Test with missing email
    fireEvent.changeText(getByPlaceholderText('Email'), '')
    fireEvent.changeText(getByPlaceholderText('Password'), 'somepassword')
    fireEvent.press(getByText('Login'))

    await waitFor(() => {
      expect(
        getByText('Login error: Email and password are required'),
      ).toBeTruthy()
    })
  })

  it('should successfully log in with valid credentials', async () => {
    ;(appSignIn as jest.Mock).mockResolvedValue({
      user: {uid: '12345', email: 'test@example.com'},
    })

    const {getByText, getByPlaceholderText} = render(<Login />)

    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com')
    fireEvent.changeText(getByPlaceholderText('Password'), 'correctpassword')
    fireEvent.press(getByText('Login'))

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/components/(inside)/List')
    })
  })

  it('should update Firestore with last login on successful login', async () => {
    ;(appSignIn as jest.Mock).mockResolvedValue({
      user: {uid: '12345', email: 'test@example.com'},
    })

    const {getByText, getByPlaceholderText} = render(<Login />)

    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com')
    fireEvent.changeText(getByPlaceholderText('Password'), 'correctpassword')
    fireEvent.press(getByText('Login'))

    await waitFor(() => {
      expect(setDoc).toHaveBeenCalledWith(
        expect.any(Object),
        {lastLogin: expect.any(String)},
        {merge: true},
      )
    })
  })

  it('should handle Firestore update errors gracefully', async () => {
    ;(appSignIn as jest.Mock).mockResolvedValue({
      user: {uid: '12345', email: 'test@example.com'},
    })

    const {getByText, getByPlaceholderText} = render(<Login />)

    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com')
    fireEvent.changeText(getByPlaceholderText('Password'), 'correctpassword')
    fireEvent.press(getByText('Login'))

    await waitFor(() => {
      expect(setDoc).toHaveBeenCalledWith(
        expect.any(Object),
        {lastLogin: expect.any(String)},
        {merge: true},
      )
    })
  })

  it('should display an error message if reset password fails', async () => {
    ;(resetPassword as jest.Mock).mockRejectedValue(
      new Error('Failed to send password reset email.'),
    )

    const {getByPlaceholderText, getByText, getByTestId} = render(<Login />)

    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com')
    fireEvent.press(getByTestId('reset-password-button'))

    await waitFor(() => {
      expect(getByTestId('error-message').props.children).toContain('Failed to send password reset email.')
    })
  })

  it('should display an error message if email is missing for password reset', async () => {
    const {getByPlaceholderText, getByTestId, getByText} = render(<Login />)

    fireEvent.changeText(getByPlaceholderText('Email'), '')
    fireEvent.changeText(getByPlaceholderText('Password'), '')
    fireEvent.press(getByTestId('reset-password-button'))

    await waitFor(() => {
      expect(getByTestId('error-message').props.children).toContain('Please enter your email address to reset the password.')
    })
  })

  it('should navigate to the registration page when clicking on Register', async () => {
    const {getByTestId} = render(<Login />)

    const registerButton = await waitFor(() => getByTestId('register-button'))
    expect(registerButton).toBeTruthy()

    // Simulate the "Don't have an account? Register" button press
    fireEvent.press(registerButton)

    // Check that the mock push function was called with the registration page route
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        './components/authentication/register-index',
      )
    })
  })
})
