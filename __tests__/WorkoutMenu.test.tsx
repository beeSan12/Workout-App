/**
 * This is a test file for the Workout Menu component.
 * @test {WorkoutMenu}
 * @version 1.0.0
 * @author Beatriz Sanssi <bs222eh@student.lnu.se>
 */

import React from 'react'
import {render, fireEvent, act, waitFor} from '@testing-library/react-native'
import WorkoutMenu from '../app/components/types/WorkoutMenu'
import {useWorkoutContext} from '../app/components/types/WorkoutContext'

// Mock WorkoutContext and useRouter
jest.mock('../app/components/types/WorkoutContext', () => ({
  useWorkoutContext: jest.fn(),
}))

const mockBack = jest.fn()
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
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

describe('WorkoutMenu Component', () => {
  const mockWorkoutContext = {
    startWorkout: jest.fn(),
    pauseWorkout: jest.fn(),
    resumeWorkout: jest.fn(),
    stopWorkout: jest.fn(),
    isPaused: false,
    isWorkingOut: false,
    workoutStarted: false,
    onToggle: jest.fn(),
  }

  beforeEach(() => {
    ;(useWorkoutContext as jest.Mock).mockReturnValue(mockWorkoutContext)
    jest.clearAllMocks()
  })

  it('renders Start button when not working out', async () => {
    ;(useWorkoutContext as jest.Mock).mockReturnValue({
      ...mockWorkoutContext,
      isWorkingOut: false,
    })

    const {getByTestId} = render(<WorkoutMenu onToggle={jest.fn()} />)
    const startButton = await waitFor(() => getByTestId('start-button'))

    expect(startButton).toBeTruthy()
  })

  it('renders Resume button when workout is paused', async () => {
    ;(useWorkoutContext as jest.Mock).mockReturnValue({
      ...mockWorkoutContext,
      isWorkingOut: true,
      isPaused: true,
    })

    const {getByTestId} = render(<WorkoutMenu onToggle={jest.fn()} />)
    const resumeButton = await waitFor(() => getByTestId('resume-button'))

    expect(resumeButton).toBeTruthy()
  })

  it('renders Pause button when working out', async () => {
    ;(useWorkoutContext as jest.Mock).mockReturnValue({
      ...mockWorkoutContext,
      isWorkingOut: true,
      isPaused: false,
    })

    const {getByTestId} = render(<WorkoutMenu onToggle={jest.fn()} />)
    const pauseButton = await waitFor(() => getByTestId('pause-button'))

    expect(pauseButton).toBeTruthy()
  })

  it('renders Stop button when working out', async () => {
    ;(useWorkoutContext as jest.Mock).mockReturnValue({
      ...mockWorkoutContext,
      isWorkingOut: true,
    })

    const {getByTestId} = render(<WorkoutMenu onToggle={jest.fn()} />)
    const stopButton = await waitFor(() => getByTestId('stop-button'))

    expect(stopButton).toBeTruthy()
  })

  it('starts a workout when Start button is pressed', async () => {
    const {getByTestId} = render(<WorkoutMenu onToggle={jest.fn()} />)

    const startButton = await waitFor(() => getByTestId('start-button'))

    expect(startButton).toBeTruthy()

    fireEvent.press(startButton)
    await waitFor(() => {
      expect(mockWorkoutContext.startWorkout).toHaveBeenCalled()
    })
  })

  it('pauses workout when workout is active and pause button is pressed', async () => {
    ;(useWorkoutContext as jest.Mock).mockReturnValue({
      ...mockWorkoutContext,
      isWorkingOut: true,
      isPaused: false,
    })

    const {getByTestId} = render(<WorkoutMenu onToggle={jest.fn()} />)

    const pauseButton = await waitFor(() => getByTestId('pause-button'))

    expect(pauseButton).toBeTruthy()

    fireEvent.press(pauseButton)
    await waitFor(() => {
      expect(mockWorkoutContext.pauseWorkout).toHaveBeenCalled()
    })
  })

  it('resumes workout when Resume button is pressed', async () => {
    ;(useWorkoutContext as jest.Mock).mockReturnValue({
      ...mockWorkoutContext,
      isWorkingOut: true,
      isPaused: true,
    })

    const {getByTestId} = render(<WorkoutMenu onToggle={jest.fn()} />)

    const resumeButton = await waitFor(() => getByTestId('resume-button'))

    expect(resumeButton).toBeTruthy()

    fireEvent.press(resumeButton)
    await waitFor(() => {
      expect(mockWorkoutContext.resumeWorkout).toHaveBeenCalled()
    })
  })

  it('stops workout when the Stop button is pressed', async () => {
    ;(useWorkoutContext as jest.Mock).mockReturnValue({
      ...mockWorkoutContext,
      isWorkingOut: true,
    })

    const {getByTestId} = render(<WorkoutMenu onToggle={jest.fn()} />)

    const stopButton = await waitFor(() => getByTestId('stop-button'))

    expect(stopButton).toBeTruthy()

    fireEvent.press(stopButton)
    await waitFor(() => {
      expect(mockWorkoutContext.stopWorkout).toHaveBeenCalled()
    })
  })

  it('calls router.back when Go Back button is pressed', async () => {
    const {getByTestId} = render(<WorkoutMenu onToggle={jest.fn()} />)

    const goBackButton = await waitFor(() => getByTestId('go-back-button'))
    expect(goBackButton).toBeTruthy()

    fireEvent.press(goBackButton)

    await waitFor(() => {
      expect(mockBack).toHaveBeenCalled()
    })
  })

  it('calls onToggle when Menu button is pressed', async () => {
    const mockOnToggle = jest.fn()
    const {getByTestId} = render(<WorkoutMenu onToggle={mockOnToggle} />)

    const menuButton = await waitFor(() => getByTestId('menu-button'))
    expect(menuButton).toBeTruthy()

    fireEvent.press(menuButton)

    await waitFor(() => {
      expect(mockOnToggle).toHaveBeenCalled()
    })
  })
})
