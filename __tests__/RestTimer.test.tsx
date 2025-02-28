/**
 * This is a test file for the Rest timer component.
 * @test {RestTimer}
 * @version 1.0.0
 * @author Beatriz Sanssi <bs222eh@student.lnu.se>
 */

import React from 'react'
import {render, waitFor} from '@testing-library/react-native'
import RestTimer from '../app/components/(inside)/workouts/RestTimer'
import {useWorkoutContext} from '../app/components/types/WorkoutContext'
import {Animated} from 'react-native'

// Mock WorkoutContext
jest.mock('../app/components/types/WorkoutContext', () => ({
  useWorkoutContext: jest.fn(),
}))

// Mock Animated.loop
const mockLoop = jest.fn()
jest.mock('react-native', () => {
  const ActualReactNative = jest.requireActual('react-native')
  return {
    ...ActualReactNative,
    Animated: {
      ...ActualReactNative.Animated,
      loop: jest.fn(animation => ({
        start: jest.fn(() => {
          animation.start()
        }),
      })),
      sequence: jest.fn(animations => ({
        start: jest.fn(),
      })),
      timing: jest.fn(config => ({
        start: jest.fn(),
      })),
    },
  }
})

describe('RestTimer Component', () => {
  const mockWorkoutContext = {
    isPaused: false,
    completeRest: jest.fn(),
  }

  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
    ;(useWorkoutContext as jest.Mock).mockReturnValue(mockWorkoutContext)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders the initial timer correctly', () => {
    const {getByText} = render(
      <RestTimer onComplete={jest.fn()} isStopped={false} />,
    )

    // Check that the timer is set to 2 minutes
    expect(getByText('2:00')).toBeTruthy()
  })

  it('counts down correctly', async () => {
    const {getByText} = render(
      <RestTimer onComplete={jest.fn()} isStopped={false} />,
    )

    jest.advanceTimersByTime(30000)

    // Check that the timer has counted down correctly
    await waitFor(() => expect(getByText('1:30')).toBeTruthy())
  })

  it('calls onComplete and completeRest when timer ends', async () => {
    const mockOnComplete = jest.fn()

    render(<RestTimer onComplete={mockOnComplete} isStopped={false} />)

    jest.advanceTimersByTime(120000)

    // Verify that the onComplete and completeRest functions were called
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled()
      expect(mockWorkoutContext.completeRest).toHaveBeenCalled()
    })
  })

  it('stops the timer when isStopped is true', async () => {
    const {getByText, rerender} = render(
      <RestTimer onComplete={jest.fn()} isStopped={false} />,
    )

    jest.advanceTimersByTime(30000)
    await waitFor(() => expect(getByText('1:30')).toBeTruthy())

    // Update the component with isStopped set to true
    rerender(<RestTimer onComplete={jest.fn()} isStopped={true} />)

    jest.advanceTimersByTime(30000)

    // Verify that the timer has stopped
    expect(getByText('1:30')).toBeTruthy()
  })

  it('starts blinking when 10 seconds remain', async () => {
    const {getByText} = render(
      <RestTimer onComplete={jest.fn()} isStopped={false} />,
    )

    jest.advanceTimersByTime(110000)

    // Check that the timer is blinking
    await waitFor(() => expect(getByText('0:10')).toBeTruthy())

    expect(Animated.loop).toHaveBeenCalledTimes(1)
  })

  it('displays "GO!" when the timer completes', async () => {
    const {getByText} = render(
      <RestTimer onComplete={jest.fn()} isStopped={false} />,
    )

    jest.advanceTimersByTime(120000)

    // Check that the "GO!" text is displayed
    await waitFor(() => expect(getByText('GO!')).toBeTruthy())
  })
})
