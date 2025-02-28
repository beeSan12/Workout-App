/**
 * This is a test file for the BasicUpperBodyWorkout component.
 * @test {BasicUpperBodyWorkout}
 * @version 1.0.0
 * @author Beatriz Sanssi <bs222eh@student.lnu.se>
 */

import React from 'react'
import {render, fireEvent, waitFor} from '@testing-library/react-native'
import BasicUpperBodyWorkout from '../app/components/(inside)/workouts/BasicUpperBodyWorkout'
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
  {id: 'w1', name: 'Chest Press', sets: 3, reps: 8},
  {id: 'w2', name: 'Lat Pulldown', sets: 3, reps: 8},
  {id: 'w3', name: 'Seated Cable Fly', sets: 3, reps: 8},
  {id: 'w4', name: 'Chest Supported Row', sets: 3, reps: 8},
  {id: 'w5', name: 'Tricep Pushdowns', sets: 3, reps: 8},
  {id: 'w6', name: 'Bicep Curls', sets: 3, reps: 8},
]

describe('BasicUpperBodyWorkout Component', () => {
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
    const {getByText} = render(<BasicUpperBodyWorkout />)

    expect(getByText(/Chest Press/)).toBeTruthy()
    expect(getByText(/Lat Pulldown/)).toBeTruthy()
    expect(getByText(/Seated Cable Fly/)).toBeTruthy()
  })

  it('shows the complete set button during a workout', () => {
    mockContext.workoutStarted = true

    const {getByText} = render(<BasicUpperBodyWorkout />)

    expect(getByText('Complete Set')).toBeTruthy()
  })

  it('calls completeSet when the complete set button is pressed', () => {
    mockContext.workoutStarted = true

    const {getByText} = render(<BasicUpperBodyWorkout />)

    fireEvent.press(getByText('Complete Set'))

    expect(mockContext.completeSet).toHaveBeenCalled()
  })

  it('shows the rest timer when resting', () => {
    mockContext.workoutStarted = true
    mockContext.isResting = true

    const {getByText} = render(<BasicUpperBodyWorkout />)
    expect(getByText('2:00')).toBeTruthy()
  })

  it('displays pause options when resting and paused', () => {
    mockContext.isResting = true
    mockContext.isPaused = true

    const {getByText} = render(<BasicUpperBodyWorkout />)

    expect(getByText('Continue With Rest')).toBeTruthy()
    expect(getByText('Skip Rest')).toBeTruthy()
  })

  it('calls resumeWorkout when "Continue With Rest" is pressed', () => {
    mockContext.isResting = true
    mockContext.isPaused = true

    const {getByText} = render(<BasicUpperBodyWorkout />)

    fireEvent.press(getByText('Continue With Rest'))

    expect(mockContext.resumeWorkout).toHaveBeenCalled()
  })

  it('handles rest completion and updates UI', async () => {
    mockContext.isResting = true
    mockContext.restCompleted = false

    const {getByText} = render(<BasicUpperBodyWorkout />)

    await waitFor(() => expect(getByText('2:00')).toBeTruthy())
    fireEvent(getByText('2:00'), 'onComplete')

    mockContext.isResting = false
    mockContext.restCompleted = true

    await waitFor(() => {
      expect(mockContext.completeRest).toHaveBeenCalled()
      expect(getByText(/Chest Press/)).toBeTruthy()
    })
  })

  it('calls completeRest when "Skip Rest" is pressed', () => {
    mockContext.isResting = true
    mockContext.isPaused = true

    const {getByText} = render(<BasicUpperBodyWorkout />)

    fireEvent.press(getByText('Skip Rest'))

    expect(mockContext.completeRest).toHaveBeenCalled()
  })

  it('resets the workout when it is stopped', () => {
    mockContext.isStopped = true

    const {getByText} = render(<BasicUpperBodyWorkout />)

    expect(mockContext.stopWorkout).toHaveBeenCalled()
    expect(getByText(/Chest Press/)).toBeTruthy() // Check the first workout item reappears
  })

  it('shows the "GO!" message briefly after rest is completed', async () => {
    mockContext.restCompleted = true
    mockContext.isResting = false

    const {getByText, queryByText} = render(<BasicUpperBodyWorkout />)

    await waitFor(() => expect(getByText('GO!')).toBeTruthy())

    jest.advanceTimersByTime(2000)

    await waitFor(() => {
      expect(queryByText('GO!')).toBeNull()
    })
  })
})
