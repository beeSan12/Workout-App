/**
 * This is a test file for the start new workout component.
 * @test {StartNewWorkout}
 * @version 1.0.0
 * @author Beatriz Sanssi <bs222eh@student.lnu.se>
 */

import StartWorkout from '../app/components/(inside)/StartNewWorkout'
import React from 'react'
import {render, fireEvent, waitFor} from '@testing-library/react-native'

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

describe('SplashScreen Mock Test', () => {
  it('should mock expo-splash-screen', () => {
    const SplashScreen = require('expo-splash-screen')
    expect(SplashScreen.preventAutoHideAsync).toBeDefined()
    expect(SplashScreen.hideAsync).toBeDefined()
  })
})

describe('StartWorkout Component', () => {
  it('renders the workout buttons correctly', async () => {
    const {getByText, getByTestId} = render(<StartWorkout />)

    // Check if the lower and upper body workout buttons are rendered
    const lowerBodyWorkoutButton = await waitFor(() =>
      getByTestId('lower-body-workout-button'),
    )
    expect(lowerBodyWorkoutButton).toBeTruthy()

    const upperBodyWorkoutButton = await waitFor(() =>
      getByTestId('upper-body-workout-button'),
    )
    expect(upperBodyWorkoutButton).toBeTruthy()
  })

  it('renders Go Back button', async () => {
    const {getByText, getByTestId} = render(<StartWorkout />)

    const goBackButton = await waitFor(() => getByTestId('go-back-button'))

    expect(goBackButton).toBeTruthy()
  })

  it('navigates to the lower body workout screen when the "Start a lower body workout" button is pressed', async () => {
    const {getByTestId} = render(<StartWorkout />)

    const lowerBodyWorkoutButton = await waitFor(() =>
      getByTestId('lower-body-workout-button'),
    )
    expect(lowerBodyWorkoutButton).toBeTruthy()

    // Simulate pressing the "Start New Lower Body Workout" button
    fireEvent.press(lowerBodyWorkoutButton)

    // Assert that the router pushed to the correct route
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('./workouts/basic-lower-body')
    })
  })

  it('navigates to the upper body workout screen when the "Start a upper body workout" button is pressed', async () => {
    const {getByTestId} = render(<StartWorkout />)

    const upperBodyWorkoutButton = await waitFor(() =>
      getByTestId('upper-body-workout-button'),
    )
    expect(upperBodyWorkoutButton).toBeTruthy()

    // Simulate pressing the "Start New Lower Body Workout" button
    fireEvent.press(upperBodyWorkoutButton)

    // Assert that the router pushed to the correct route
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('./workouts/basic-upper-body')
    })
  })

  it('calls router.back when Go Back button is pressed', async () => {
    const {getByTestId} = render(<StartWorkout />)

    const goBackButton = await waitFor(() => getByTestId('go-back-button'))
    expect(goBackButton).toBeTruthy()

    fireEvent.press(goBackButton)

    await waitFor(() => {
      expect(mockBack).toHaveBeenCalled()
    })
  })
})
