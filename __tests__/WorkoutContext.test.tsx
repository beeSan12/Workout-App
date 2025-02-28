/**
 * This is a test file for the user Workout Context component.
 * @test {WorkoutContext}
 * @version 1.0.0
 * @author Beatriz Sanssi <bs222eh@student.lnu.se>
 */

import React from 'react'
import {renderHook, act, waitFor} from '@testing-library/react-native'
import {
  WorkoutProvider,
  useWorkoutContext,
} from '../app/components/types/WorkoutContext'
import AsyncStorage from '@react-native-async-storage/async-storage'

beforeEach(() => {
  jest.useFakeTimers()
})

afterEach(() => {
  jest.useRealTimers()
})

const mockData = {
  workoutStarted: true,
  isPaused: false,
  isStopped: false,
  isWorkingOut: true,
  isResting: false,
  restCompleted: true,
}

describe('WorkoutContext', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('throws an error when useWorkoutContext is used outside of WorkoutProvider', () => {
    expect(() => {
      renderHook(() => useWorkoutContext())
    }).toThrowError('useWorkoutContext must be used within a WorkoutProvider')
  })

  it('initializes with default values', () => {
    const {result} = renderHook(() => useWorkoutContext(), {
      wrapper: ({children}) => <WorkoutProvider>{children}</WorkoutProvider>,
    })

    expect(result.current.workoutStarted).toBe(false)
    expect(result.current.isPaused).toBe(false)
    expect(result.current.isWorkingOut).toBe(false)
    expect(result.current.isResting).toBe(false)
    expect(result.current.isStopped).toBe(false)
  })

  it('handles starting a workout', () => {
    const {result} = renderHook(() => useWorkoutContext(), {
      wrapper: ({children}) => <WorkoutProvider>{children}</WorkoutProvider>,
    })

    act(() => {
      result.current.startWorkout()
    })

    expect(result.current.workoutStarted).toBe(true)
    expect(result.current.isPaused).toBe(false)
    expect(result.current.isWorkingOut).toBe(true)
  })

  it('handles pausing a workout', () => {
    const {result} = renderHook(() => useWorkoutContext(), {
      wrapper: ({children}) => <WorkoutProvider>{children}</WorkoutProvider>,
    })

    act(() => {
      result.current.startWorkout()
      result.current.pauseWorkout()
    })

    expect(result.current.isPaused).toBe(true)
    expect(result.current.isWorkingOut).toBe(false)
  })

  it('handles resuming a workout', () => {
    const {result} = renderHook(() => useWorkoutContext(), {
      wrapper: ({children}) => <WorkoutProvider>{children}</WorkoutProvider>,
    })

    act(() => {
      result.current.startWorkout()
      result.current.pauseWorkout()
      result.current.resumeWorkout()
    })

    expect(result.current.isPaused).toBe(false)
    expect(result.current.isWorkingOut).toBe(true)
  })

  it('handles stopping a workout', () => {
    const {result} = renderHook(() => useWorkoutContext(), {
      wrapper: ({children}) => <WorkoutProvider>{children}</WorkoutProvider>,
    })

    act(() => {
      result.current.startWorkout()
      result.current.stopWorkout()
    })

    expect(result.current.workoutStarted).toBe(false)
    expect(result.current.isWorkingOut).toBe(false)
    expect(result.current.isStopped).toBe(true)
  })

  it('handles starting and completing a workout set', async () => {
    const {result} = renderHook(() => useWorkoutContext(), {
      wrapper: ({children}) => <WorkoutProvider>{children}</WorkoutProvider>,
    })

    act(() => {
      result.current.startWorkout()
      result.current.completeSet()
    })

    await waitFor(() => {
      expect(result.current.isWorkingOut).toBe(true)
      expect(result.current.isResting).toBe(true)
      expect(result.current.restCompleted).toBe(false)
    })

    act(() => {
      result.current.completeRest()
    })

    await waitFor(() => {
      expect(result.current.isResting).toBe(false)
      expect(result.current.restCompleted).toBe(true)
    })
  })

  it('toggles workoutStarted state', () => {
    const {result} = renderHook(() => useWorkoutContext(), {
      wrapper: ({children}) => <WorkoutProvider>{children}</WorkoutProvider>,
    })

    act(() => {
      result.current.onToggle()
    })

    expect(result.current.workoutStarted).toBe(true)

    act(() => {
      result.current.onToggle()
    })

    expect(result.current.workoutStarted).toBe(false)
  })

  it('loads default workout state when AsyncStorage is empty', async () => {
    // Simulate AsyncStorage returning null (no saved state)
    ;(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null)

    const {result} = renderHook(() => useWorkoutContext(), {
      wrapper: ({children}) => <WorkoutProvider>{children}</WorkoutProvider>,
    })

    // Verify the context loads default values
    await waitFor(() => {
      expect(result.current.workoutStarted).toBe(false)
      expect(result.current.isPaused).toBe(false)
      expect(result.current.isStopped).toBe(false)
      expect(result.current.isWorkingOut).toBe(false)
      expect(result.current.isResting).toBe(false)
      expect(result.current.restCompleted).toBe(false)
    })
  })

  it('loads saved workout state from AsyncStorage', async () => {
    ;(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify({
        workoutStarted: false,
        isPaused: false,
        isStopped: false,
        isWorkingOut: false,
        isResting: false,
        restCompleted: false,
      }),
    )

    const {result} = renderHook(() => useWorkoutContext(), {
      wrapper: ({children}) => <WorkoutProvider>{children}</WorkoutProvider>,
    })

    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('workoutState')
    })

    await waitFor(() => {
      expect(result.current.workoutStarted).toBe(false)
    })

    await waitFor(() => {
      expect(result.current.isPaused).toBe(false)
      expect(result.current.isStopped).toBe(false)
      expect(result.current.isWorkingOut).toBe(false)
      expect(result.current.isResting).toBe(false)
      expect(result.current.restCompleted).toBe(false)
    })
  })

  it('handles errors during loading workout state from AsyncStorage', async () => {
    const error = new Error('AsyncStorage error')
    jest.spyOn(console, 'log').mockImplementationOnce(() => {})
    ;(AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(error)

    renderHook(() => useWorkoutContext(), {
      wrapper: ({children}) => <WorkoutProvider>{children}</WorkoutProvider>,
    })

    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith(
        'Failed to load workout state:',
        error,
      )
    })
  })

  it('saves workout state to AsyncStorage when stopping a workout', async () => {
    const {result} = renderHook(() => useWorkoutContext(), {
      wrapper: ({children}) => <WorkoutProvider>{children}</WorkoutProvider>,
    })

    act(() => {
      result.current.startWorkout()
      result.current.stopWorkout()
    })

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'workoutState',
        expect.any(String),
      )
    })
  })

  it('handles errors when saving workout state to AsyncStorage', async () => {
    const error = new Error('AsyncStorage save error')
    jest.spyOn(console, 'log').mockImplementationOnce(() => {})
    ;(AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(error)

    const {result} = renderHook(() => useWorkoutContext(), {
      wrapper: ({children}) => <WorkoutProvider>{children}</WorkoutProvider>,
    })

    act(() => {
      result.current.startWorkout()
    })

    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith(
        'Failed to save workout state:',
        error,
      )
    })
  })

  it('saves completed workout data to AsyncStorage', async () => {
    ;(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify(mockData),
    )

    const {result} = renderHook(() => useWorkoutContext(), {
      wrapper: ({children}) => <WorkoutProvider>{children}</WorkoutProvider>,
    })

    act(() => {
      result.current.startWorkout()
      result.current.stopWorkout()
    })

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'completedWorkout',
        expect.stringContaining('"workoutStarted":true'),
      )
    })
  })
})
