/**
 * This is a test file for the Footer component.
 * @test {Footer}
 * @version 1.0.0
 * @author Beatriz Sanssi <bs222eh@student.lnu.se>
 */

import React from 'react'
import {render, fireEvent, waitFor} from '@testing-library/react-native'
import Footer from '../app/components/types/Footer'
import {appSignOut} from '../app/hooks/store'

// Mock useRouter from expo-router
const mockPush = jest.fn()
const mockReplace = jest.fn()
const mockBack = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
  }),
}))

// Mock appSignOut
jest.mock('../app/hooks/store', () => ({
  appSignOut: jest.fn(),
}))

describe('SplashScreen Mock Test', () => {
  it('should mock expo-splash-screen', () => {
    const SplashScreen = require('expo-splash-screen')
    expect(SplashScreen.preventAutoHideAsync).toBeDefined()
    expect(SplashScreen.hideAsync).toBeDefined()
  })
})

describe('Footer Component', () => {
  const mockFooterProps = {
    onCollapse: jest.fn(),
    isWorkoutScreen: false,
  }
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders Home button', async () => {
    const {getByTestId} = render(<Footer isWorkoutScreen={false} />)

    const homeButton = await waitFor(() => getByTestId('home-button'))

    expect(homeButton).toBeTruthy()
  })

  it('renders Start new workout button', async () => {
    const {getByTestId} = render(<Footer isWorkoutScreen={false} />)

    const startNewWorkoutButton = await waitFor(() =>
      getByTestId('start-new-workout-button'),
    )

    expect(startNewWorkoutButton).toBeTruthy()
  })

  it('renders Log Out button', async () => {
    const {getByTestId} = render(<Footer isWorkoutScreen={false} />)

    const logOutButton = await waitFor(() => getByTestId('log-out-button'))

    expect(logOutButton).toBeTruthy()
  })

  it('renders Go Back button', async () => {
    const {getByTestId} = render(<Footer isWorkoutScreen={false} />)

    const goBackButton = await waitFor(() => getByTestId('go-back-button'))

    expect(goBackButton).toBeTruthy()
  })

  it('renders Close button when inside workout component', async () => {
    const {getByTestId} = render(<Footer isWorkoutScreen={true} />)

    const closeButton = await waitFor(() => getByTestId('close-button'))

    expect(closeButton).toBeTruthy()
  })

  it('should navigate to Home when the Home button is pressed', async () => {
    const {getByTestId} = render(<Footer />)

    const homeButton = await waitFor(() => getByTestId('home-button'))
    expect(homeButton).toBeTruthy()

    // Simulate pressing the "Home" button
    fireEvent.press(homeButton)

    // Assert that the router pushed to the correct route
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/components/(inside)/List')
    })
  })

  it('should navigate to Start New Workout when the Workout button is pressed', async () => {
    const {getByTestId} = render(<Footer />)

    // Simulate pressing the "Workout" button
    const startNewWorkoutButton = await waitFor(() =>
      getByTestId('start-new-workout-button'),
    )
    expect(startNewWorkoutButton).toBeTruthy()

    fireEvent.press(startNewWorkoutButton)

    // Assert that the router pushed to the correct route
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        '/components/(inside)/StartNewWorkout',
      )
    })
  })

  it('should call appSignOut and navigate to login when the Log Out button is pressed', async () => {
    const {getByTestId} = render(<Footer />)

    const logOutButton = await waitFor(() => getByTestId('log-out-button'))
    expect(logOutButton).toBeTruthy()

    // Simulate pressing the "Log Out" button
    fireEvent.press(logOutButton)

    // Wait for the sign-out action to complete and navigate to Login
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/Login')
    })
  })

  it('calls router.back when Go Back button is pressed', async () => {
    const {getByTestId} = render(<Footer />)

    const goBackButton = await waitFor(() => getByTestId('go-back-button'))
    expect(goBackButton).toBeTruthy()

    fireEvent.press(goBackButton)

    await waitFor(() => {
      expect(mockBack).toHaveBeenCalled()
    })
  })

  it('should render the collapse button when isWorkoutScreen is true', async () => {
    const {getByTestId} = render(<Footer isWorkoutScreen={true} />)

    // Assert that the collapse button is rendered
    const goBackButton = await waitFor(() => getByTestId('go-back-button'))
    expect(goBackButton).toBeTruthy()

    // Simulate pressing the "Back" button (collapse)
    fireEvent.press(goBackButton)
    await waitFor(() => {
      expect(mockBack).toHaveBeenCalled()
    })
  })

  it('should not render the collapse button when isWorkoutScreen is false', async () => {
    const {queryByText} = render(<Footer isWorkoutScreen={false} />)

    // Assert that the collapse button is not rendered
    expect(queryByText('Back')).toBeNull()
  })
})
