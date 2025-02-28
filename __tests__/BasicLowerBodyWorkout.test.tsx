/**
 * This is a test file for the BasicLowerBodyWorkout component.
 * @test {BasicLowerBodyWorkout}
 * @version 1.0.0
 * @author Beatriz Sanssi <bs222eh@student.lnu.se>
 */

import React from 'react'
import {render, fireEvent, waitFor} from '@testing-library/react-native'
import BasicLowerBodyWorkout from '../app/components/(inside)/workouts/BasicLowerBodyWorkout'
import {useWorkoutContext} from '../app/components/types/WorkoutContext'

jest.mock('../app/components/types/WorkoutContext', () => ({
  useWorkoutContext: jest.fn(),
}))

beforeEach(() => {
  jest.useFakeTimers()
})

afterEach(() => {
  jest.useRealTimers()
})

const mockWorkouts = [
  {id: 'w1', name: 'Hack Squat', sets: 3, reps: 8},
  {id: 'w2', name: 'Seated Hamstring Curl', sets: 3, reps: 8},
  {id: 'w3', name: 'Walking Lunges', sets: 3, reps: 8},
  {id: 'w4', name: 'Calf Raises', sets: 3, reps: 8},
  {id: 'w5', name: 'Seated Shoulder Press', sets: 3, reps: 8},
]

describe('BasicLowerBodyWorkout Component', () => {
  let mockContext: any

  beforeEach(() => {
    mockContext = {
      workoutStarted: false,
      isPaused: false,
      isResting: false,
      restCompleted: false,
      isStopped: false,
      completeSet: jest.fn(),
      completeRest: jest.fn(),
      stopWorkout: jest.fn(),
      resumeWorkout: jest.fn(),
      currentSet: 1,
      currentWorkoutIndex: 0,
      workouts: mockWorkouts,
    }
    ;(useWorkoutContext as jest.Mock).mockReturnValue(mockContext)
    jest.clearAllMocks()
  })

  it('renders the workout list when workout is not started', () => {
    const {getByText} = render(<BasicLowerBodyWorkout />)

    expect(getByText(/Walking Lunges/)).toBeTruthy()
    expect(getByText(/Seated Hamstring Curl/)).toBeTruthy()
    expect(getByText(/Hack Squat/)).toBeTruthy()
  })

  it('shows the complete set button during a workout', () => {
    mockContext.workoutStarted = true

    const {getByText} = render(<BasicLowerBodyWorkout />)

    expect(getByText('Complete Set')).toBeTruthy()
  })

  it('calls completeSet when the complete set button is pressed', () => {
    mockContext.workoutStarted = true

    const {getByText} = render(<BasicLowerBodyWorkout />)

    fireEvent.press(getByText('Complete Set'))

    expect(mockContext.completeSet).toHaveBeenCalled()
  })

  it('shows the rest timer when resting', () => {
    mockContext.workoutStarted = true
    mockContext.isResting = true

    const {getByText} = render(<BasicLowerBodyWorkout />)
    expect(getByText('2:00')).toBeTruthy()
  })

  it('displays pause options when resting and paused', () => {
    mockContext.isResting = true
    mockContext.isPaused = true

    const {getByText} = render(<BasicLowerBodyWorkout />)

    expect(getByText('Continue With Rest')).toBeTruthy()
    expect(getByText('Skip Rest')).toBeTruthy()
  })

  it('calls resumeWorkout when "Continue With Rest" is pressed', () => {
    mockContext.isResting = true
    mockContext.isPaused = true

    const {getByText} = render(<BasicLowerBodyWorkout />)

    fireEvent.press(getByText('Continue With Rest'))

    expect(mockContext.resumeWorkout).toHaveBeenCalled()
  })

  it('handles rest completion and updates UI', async () => {
    mockContext.isResting = true
    mockContext.restCompleted = false

    const {getByText} = render(<BasicLowerBodyWorkout />)

    await waitFor(() => expect(getByText('2:00')).toBeTruthy())
    fireEvent(getByText('2:00'), 'onComplete')

    mockContext.isResting = false
    mockContext.restCompleted = true

    await waitFor(() => {
      expect(mockContext.completeRest).toHaveBeenCalled()
      expect(getByText(/Hack Squat/)).toBeTruthy()
    })
  })

  it('calls completeRest when "Skip Rest" is pressed', () => {
    mockContext.isResting = true
    mockContext.isPaused = true

    const {getByText} = render(<BasicLowerBodyWorkout />)

    fireEvent.press(getByText('Skip Rest'))

    expect(mockContext.completeRest).toHaveBeenCalled()
  })

  it('resets the workout when it is stopped', () => {
    mockContext.isStopped = true

    const {getByText} = render(<BasicLowerBodyWorkout />)

    expect(mockContext.stopWorkout).toHaveBeenCalled()
    expect(getByText('Hack Squat')).toBeTruthy() // Check the first workout item reappears
  })

  it('shows the "GO!" message briefly after rest is completed', async () => {
    mockContext.restCompleted = true
    mockContext.isResting = false

    const {getByText, queryByText} = render(<BasicLowerBodyWorkout />)

    await waitFor(() => expect(getByText('GO!')).toBeTruthy())

    jest.advanceTimersByTime(2000)

    await waitFor(() => {
      expect(queryByText('GO!')).toBeNull()
    })
  })
})
