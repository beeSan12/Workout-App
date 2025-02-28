/**
 * This is a test file for the Register screen component.
 * @test {Register}
 * @version 1.0.0
 * @author Beatriz Sanssi <bs222eh@student.lnu.se>
 */

import React from 'react'
import {render, fireEvent, waitFor, act} from '@testing-library/react-native'
import RegisterScreen from '../app/components/authentication/Register' // Adjust the path to your RegisterScreen component
import {appSignUp, checkForExistingUser} from '../app/hooks/store'
import {
  isValidBirthDate,
  isValidPhoneNumber,
  isValidAddress,
} from '../app/components/authentication/Register'

beforeEach(() => {
  jest.useFakeTimers()
})

afterEach(() => {
  jest.useRealTimers()
})

// Mock appSignUp explicitly as a Jest mock
jest.mock('../app/hooks/store', () => ({
  checkForExistingUser: jest.fn(),
  appSignUp: jest.fn(),
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

jest.mock('../FirebaseConfig', () =>
  require('../__mocks__/FirebaseConfig.mock'),
)

describe('isValidBirthDate', () => {
  it('returns true for valid birth dates in YYYYMMDD format', () => {
    expect(isValidBirthDate('19900101')).toBe(true)
    expect(isValidBirthDate('20001231')).toBe(true)
  })

  it('returns false for invalid birth dates', () => {
    expect(isValidBirthDate('900101')).toBe(false)
    expect(isValidBirthDate('123456789')).toBe(false)
    expect(isValidBirthDate('abcdefgh')).toBe(false)
    expect(isValidBirthDate('')).toBe(false)
  })
})

describe('isValidPhoneNumber', () => {
  it('returns true for valid phone numbers with 10 digits', () => {
    expect(isValidPhoneNumber('1234567890')).toBe(true)
    expect(isValidPhoneNumber('0987654321')).toBe(true)
  })

  it('returns false for invalid phone numbers', () => {
    expect(isValidPhoneNumber('12345')).toBe(false)
    expect(isValidPhoneNumber('12345678901')).toBe(false)
    expect(isValidPhoneNumber('abcdefghij')).toBe(false)
    expect(isValidPhoneNumber('')).toBe(false)
  })
})

describe('isValidAddress', () => {
  it('returns true for non-empty addresses', () => {
    expect(isValidAddress('123 Street')).toBe(true)
    expect(isValidAddress('Apartment 456')).toBe(true)
  })

  it('returns false for empty or invalid addresses', () => {
    expect(isValidAddress('')).toBe(false)
    expect(isValidAddress('   ')).toBe(false)
  })
})

describe('RegisterScreen Component', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders all input fields and buttons correctly', () => {
    const {getByPlaceholderText, getByText} = render(<RegisterScreen />)

    expect(getByPlaceholderText('First Name')).toBeTruthy()
    expect(getByPlaceholderText('Last Name')).toBeTruthy()
    expect(getByPlaceholderText('Email')).toBeTruthy()
    expect(getByPlaceholderText('Password')).toBeTruthy()
    expect(getByPlaceholderText('Confirm Password')).toBeTruthy()
    expect(getByText('Register')).toBeTruthy()
    expect(getByText('Already have an account? Login')).toBeTruthy()
  })

  it('shows validation errors for invalid email format', async () => {
    const {getByPlaceholderText, getByText, getByTestId} = render(
      <RegisterScreen />,
    )

    fireEvent.changeText(getByPlaceholderText('First Name'), 'John')
    fireEvent.changeText(getByPlaceholderText('Last Name'), 'Doe')
    fireEvent.changeText(getByPlaceholderText('Email'), 'invalid-email')
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123')
    fireEvent.changeText(
      getByPlaceholderText('Confirm Password'),
      'password123',
    )
    fireEvent.press(getByTestId('check-user-button'))

    await waitFor(() => {
      expect(getByText('Invalid email format')).toBeTruthy()
    })
  })

  it('shows validation errors for mismatched passwords', async () => {
    const {getByPlaceholderText, getByText, getByTestId} = render(
      <RegisterScreen />,
    )
    fireEvent.changeText(getByPlaceholderText('First Name'), 'John')
    fireEvent.changeText(getByPlaceholderText('Last Name'), 'Doe')
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com')
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123')
    fireEvent.changeText(
      getByPlaceholderText('Confirm Password'),
      'wrongPassword',
    )

    fireEvent.press(getByTestId('check-user-button'))

    await waitFor(() => {
      expect(getByText('Passwords do not match')).toBeTruthy()
    })
  })

  it('shows a loading spinner while checking user existence', async () => {
    const {getByTestId, getByPlaceholderText} = render(<RegisterScreen />)

    fireEvent.changeText(getByPlaceholderText('First Name'), 'John')
    fireEvent.changeText(getByPlaceholderText('Last Name'), 'Doe')
    fireEvent.changeText(getByPlaceholderText('Email'), 'valid@email.com')
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123')
    fireEvent.changeText(
      getByPlaceholderText('Confirm Password'),
      'password123',
    )
    fireEvent.press(getByTestId('check-user-button'))

    expect(getByTestId('loading-spinner')).toBeTruthy()
  })

  it('shows error if user already exists', async () => {
    ;(checkForExistingUser as jest.Mock).mockResolvedValueOnce({
      userExists: true,
    })

    const {getByPlaceholderText, getByText, getByTestId} = render(
      <RegisterScreen />,
    )

    fireEvent.changeText(getByPlaceholderText('First Name'), 'John')
    fireEvent.changeText(getByPlaceholderText('Last Name'), 'Doe')
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com')
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123')
    fireEvent.changeText(
      getByPlaceholderText('Confirm Password'),
      'password123',
    )

    const registerButton = getByTestId('check-user-button')
    fireEvent.press(registerButton)

    await waitFor(() => {
      expect(checkForExistingUser).toHaveBeenCalledWith('test@example.com')
      expect(
        getByText(
          'User already exists. Please log in or get a reset password.',
        ),
      ).toBeTruthy()
    })
  })

  it('shows error when check for existing user fails', async () => {
    ;(checkForExistingUser as jest.Mock).mockRejectedValue(
      new Error('Network error'),
    )

    const {getByPlaceholderText, getByText, getByTestId} = render(
      <RegisterScreen />,
    )

    fireEvent.changeText(getByPlaceholderText('First Name'), 'John')
    fireEvent.changeText(getByPlaceholderText('Last Name'), 'Doe')
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com')
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123')
    fireEvent.changeText(
      getByPlaceholderText('Confirm Password'),
      'password123',
    )
    fireEvent.press(getByTestId('check-user-button'))

    await waitFor(() => {
      expect(checkForExistingUser).toHaveBeenCalledWith('test@example.com')
      expect(getByText('Failed to check if user exists')).toBeTruthy()
    })
  })

  it('shows validation errors for invalid birth dates', async () => {
    ;(checkForExistingUser as jest.Mock).mockResolvedValue(false)
    const {getByPlaceholderText, getByTestId, getByText} = render(
      <RegisterScreen />,
    )

    fireEvent.changeText(getByPlaceholderText('First Name'), 'John')
    fireEvent.changeText(getByPlaceholderText('Last Name'), 'Doe')
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com')
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123')
    fireEvent.changeText(
      getByPlaceholderText('Confirm Password'),
      'password123',
    )
    fireEvent.press(getByTestId('check-user-button'))
    await waitFor(() =>
      expect(checkForExistingUser).toHaveBeenCalledWith('test@example.com'),
    )

    fireEvent.changeText(getByPlaceholderText('User Name'), 'JohnDoe')
    fireEvent.changeText(
      getByPlaceholderText('Birth Date (YYYY-MM-DD)'),
      '900101',
    )
    fireEvent.changeText(getByPlaceholderText('Adress'), '123 Street')
    fireEvent.changeText(getByPlaceholderText('Phone Number'), '1234567890')
    fireEvent.press(getByTestId('register-button'))
    // Fill the second form
    await waitFor(() => {
      expect(getByText('Invalid birth date format')).toBeTruthy()
    })
  })

  it('shows an error when Phone Number is not valid', async () => {
    ;(checkForExistingUser as jest.Mock).mockResolvedValue(false)
    const {getByPlaceholderText, getByTestId, getByText} = render(
      <RegisterScreen />,
    )

    fireEvent.changeText(getByPlaceholderText('First Name'), 'John')
    fireEvent.changeText(getByPlaceholderText('Last Name'), 'Doe')
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com')
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123')
    fireEvent.changeText(
      getByPlaceholderText('Confirm Password'),
      'password123',
    )
    fireEvent.press(getByTestId('check-user-button'))
    await waitFor(() =>
      expect(checkForExistingUser).toHaveBeenCalledWith('test@example.com'),
    )

    fireEvent.changeText(getByPlaceholderText('User Name'), 'JohnDoe')
    fireEvent.changeText(
      getByPlaceholderText('Birth Date (YYYY-MM-DD)'),
      '19900101',
    )
    fireEvent.changeText(getByPlaceholderText('Adress'), '123 Street')
    fireEvent.changeText(getByPlaceholderText('Phone Number'), '12345678')
    fireEvent.press(getByTestId('register-button'))
    // Fill the second form
    await waitFor(() => {
      expect(getByText('Invalid phone number format')).toBeTruthy()
    })
  })

  it('shows an error when Adress is not valid', async () => {
    ;(checkForExistingUser as jest.Mock).mockResolvedValue(false)
    const {getByPlaceholderText, getByTestId, getByText} = render(
      <RegisterScreen />,
    )

    fireEvent.changeText(getByPlaceholderText('First Name'), 'John')
    fireEvent.changeText(getByPlaceholderText('Last Name'), 'Doe')
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com')
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123')
    fireEvent.changeText(
      getByPlaceholderText('Confirm Password'),
      'password123',
    )
    fireEvent.press(getByTestId('check-user-button'))
    await waitFor(() =>
      expect(checkForExistingUser).toHaveBeenCalledWith('test@example.com'),
    )

    fireEvent.changeText(getByPlaceholderText('User Name'), 'JohnDoe')
    fireEvent.changeText(
      getByPlaceholderText('Birth Date (YYYY-MM-DD)'),
      '19900101',
    )
    fireEvent.changeText(getByPlaceholderText('Adress'), '1')
    fireEvent.changeText(getByPlaceholderText('Phone Number'), '1234567890')
    fireEvent.press(getByTestId('register-button'))
    // Fill the second form
    await waitFor(() => {
      expect(getByText('Invalid address format')).toBeTruthy()
    })
  })

  it('shows an error when required fields are empty', async () => {
    ;(checkForExistingUser as jest.Mock).mockResolvedValue(false)
    const {getByText, getByTestId, getByPlaceholderText} = render(
      <RegisterScreen />,
    )

    fireEvent.changeText(getByPlaceholderText('First Name'), 'John')
    fireEvent.changeText(getByPlaceholderText('Last Name'), 'Doe')
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com')
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123')
    fireEvent.changeText(
      getByPlaceholderText('Confirm Password'),
      'password123',
    )
    fireEvent.press(getByTestId('check-user-button'))
    await waitFor(() =>
      expect(checkForExistingUser).toHaveBeenCalledWith('test@example.com'),
    )

    fireEvent.changeText(getByPlaceholderText('User Name'), '')
    fireEvent.changeText(
      getByPlaceholderText('Birth Date (YYYY-MM-DD)'),
      '19900101',
    )
    fireEvent.changeText(getByPlaceholderText('Adress'), '123 Street')
    fireEvent.changeText(getByPlaceholderText('Phone Number'), '1234567890')
    fireEvent.press(getByTestId('register-button'))

    await waitFor(() => {
      expect(getByText('Please fill out all fields correctly')).toBeTruthy()
    })
  })

  it('calls appSignUp when form is valid and user does not exist', async () => {
    ;(checkForExistingUser as jest.Mock).mockResolvedValue(false)
    ;(appSignUp as jest.Mock).mockResolvedValue({
      user: {uid: '12345', email: 'test@example.com'},
    })

    const {getByPlaceholderText, getByText, getByTestId} = render(
      <RegisterScreen />,
    )

    fireEvent.changeText(getByPlaceholderText('First Name'), 'John')
    fireEvent.changeText(getByPlaceholderText('Last Name'), 'Doe')
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com')
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123')
    fireEvent.changeText(
      getByPlaceholderText('Confirm Password'),
      'password123',
    )
    fireEvent.press(getByTestId('check-user-button'))
    await waitFor(() =>
      expect(checkForExistingUser).toHaveBeenCalledWith('test@example.com'),
    )

    fireEvent.changeText(getByPlaceholderText('User Name'), 'JohnDoe')
    fireEvent.changeText(
      getByPlaceholderText('Birth Date (YYYY-MM-DD)'),
      '19900101',
    )
    fireEvent.changeText(getByPlaceholderText('Adress'), '123 Street')
    fireEvent.changeText(getByPlaceholderText('Phone Number'), '1234567890')
    fireEvent.press(getByTestId('register-button'))

    await waitFor(() =>
      expect(appSignUp).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
        'JohnDoe',
        'John',
        'Doe',
        '123 Street',
        '1234567890',
        '19900101',
        'user',
      ),
    )
  })

  it('shows an error when appSignUp fails', async () => {
    // Mock appSignUp to reject with an error
    ;(appSignUp as jest.Mock).mockRejectedValueOnce(new Error('Test Error'))

    const {getByPlaceholderText, getByTestId, getByText} = render(
      <RegisterScreen />,
    )

    // Fill the form with valid data
    fireEvent.changeText(getByPlaceholderText('First Name'), 'John')
    fireEvent.changeText(getByPlaceholderText('Last Name'), 'Doe')
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com')
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123')
    fireEvent.changeText(
      getByPlaceholderText('Confirm Password'),
      'password123',
    )
    fireEvent.press(getByTestId('check-user-button'))

    // Wait for transition to the second form
    await waitFor(() => {
      fireEvent.changeText(getByPlaceholderText('User Name'), 'JohnDoe')
      fireEvent.changeText(
        getByPlaceholderText('Birth Date (YYYY-MM-DD)'),
        '19900101',
      )
      fireEvent.changeText(getByPlaceholderText('Adress'), '123 Street')
      fireEvent.changeText(getByPlaceholderText('Phone Number'), '1234567890')
      fireEvent.press(getByTestId('register-button'))
    })

    // Verify that the error message is displayed
    await waitFor(() => {
      expect(
        getByText('Registration failed. Please try again later.'),
      ).toBeTruthy()
    })

    // Ensure appSignUp was called with the correct arguments
    expect(appSignUp).toHaveBeenCalledWith(
      'test@example.com',
      'password123',
      'JohnDoe',
      'John',
      'Doe',
      '123 Street',
      '1234567890',
      '19900101',
      'user',
    )
  })

  it('navigates to the List screen after successful signup', async () => {
    ;(checkForExistingUser as jest.Mock).mockResolvedValue(false)
    ;(appSignUp as jest.Mock).mockResolvedValue({
      user: {uid: '12345', email: 'test@example.com'},
    })

    const {getByPlaceholderText, getByTestId} = render(<RegisterScreen />)

    fireEvent.changeText(getByPlaceholderText('First Name'), 'John')
    fireEvent.changeText(getByPlaceholderText('Last Name'), 'Doe')
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com')
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123')
    fireEvent.changeText(
      getByPlaceholderText('Confirm Password'),
      'password123',
    )
    fireEvent.press(getByTestId('check-user-button'))

    await waitFor(() =>
      expect(checkForExistingUser).toHaveBeenCalledWith('test@example.com'),
    )

    fireEvent.changeText(getByPlaceholderText('User Name'), 'JohnDoe')
    fireEvent.changeText(
      getByPlaceholderText('Birth Date (YYYY-MM-DD)'),
      '19900101',
    )
    fireEvent.changeText(getByPlaceholderText('Adress'), '123 Street')
    fireEvent.changeText(getByPlaceholderText('Phone Number'), '1234567890')
    fireEvent.press(getByTestId('register-button'))

    await waitFor(() => {
      expect(appSignUp).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
        'JohnDoe',
        'John',
        'Doe',
        '123 Street',
        '1234567890',
        '19900101',
        'user',
      )
    })

    expect(mockReplace).toHaveBeenCalledWith('../(inside)/List')
  })

  it('navigates to the Login screen when clicking on login-button', async () => {
    const {getByPlaceholderText, getByTestId} = render(<RegisterScreen />)

    fireEvent.changeText(getByPlaceholderText('First Name'), 'John')
    fireEvent.changeText(getByPlaceholderText('Last Name'), 'Doe')
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com')
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123')
    fireEvent.changeText(
      getByPlaceholderText('Confirm Password'),
      'password123',
    )
    fireEvent.press(getByTestId('login-button'))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('../../Login')
    })
  })

  it('navigates to the Login screen when clicking on login-button on second form', async () => {
    ;(checkForExistingUser as jest.Mock).mockResolvedValue(false)
    const {getByPlaceholderText, getByTestId} = render(<RegisterScreen />)

    fireEvent.changeText(getByPlaceholderText('First Name'), 'John')
    fireEvent.changeText(getByPlaceholderText('Last Name'), 'Doe')
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com')
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123')
    fireEvent.changeText(
      getByPlaceholderText('Confirm Password'),
      'password123',
    )
    fireEvent.press(getByTestId('check-user-button'))

    await waitFor(() =>
      expect(checkForExistingUser).toHaveBeenCalledWith('test@example.com'),
    )

    fireEvent.changeText(getByPlaceholderText('User Name'), 'JohnDoe')
    fireEvent.changeText(
      getByPlaceholderText('Birth Date (YYYY-MM-DD)'),
      '19900101',
    )
    fireEvent.changeText(getByPlaceholderText('Adress'), '123 Street')
    fireEvent.changeText(getByPlaceholderText('Phone Number'), '1234567890')
    fireEvent.press(getByTestId('login-button'))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('../../Login')
    })
  })
})
