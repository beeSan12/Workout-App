/**
 * This is a test file for the Complete Set Button component.
 * @test {CompleteSetButton}
 * @version 1.0.0
 * @author Beatriz Sanssi <bs222eh@student.lnu.se>
 */

import React from 'react'
import {render, fireEvent, waitFor} from '@testing-library/react-native'
import CompleteSetButton from '../app/components/(inside)/workouts/CompleteSetButton'
import {CompleteSetButtonHandle} from '../app/components/(inside)/workouts/CompleteSetButton'

describe('CompleteSetButton Component', () => {
  const mockOnCompleteSet = jest.fn()
  const mockRef = React.createRef<CompleteSetButtonHandle>()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the button when workoutStarted is true and not resting, paused, or stopped', () => {
    const {getByText} = render(
      <CompleteSetButton
        onCompleteSet={mockOnCompleteSet}
        workoutStarted={true}
        isResting={false}
        restCompleted={false}
        isPaused={false}
        isStopped={false}
      />,
    )

    expect(getByText('Complete Set')).toBeTruthy()
  })

  it('does not render the button when workoutStarted is false', () => {
    const {queryByText} = render(
      <CompleteSetButton
        onCompleteSet={mockOnCompleteSet}
        workoutStarted={false}
        isResting={false}
        restCompleted={false}
        isPaused={false}
        isStopped={false}
      />,
    )

    expect(queryByText('Complete Set')).toBeNull()
  })

  it('does not render the button when resting and restCompleted is false', () => {
    const {queryByText} = render(
      <CompleteSetButton
        onCompleteSet={mockOnCompleteSet}
        workoutStarted={true}
        isResting={true}
        restCompleted={false}
        isPaused={false}
        isStopped={false}
      />,
    )

    expect(queryByText('Complete Set')).toBeNull()
  })

  it('calls onCompleteSet when the button is pressed', () => {
    const {getByText} = render(
      <CompleteSetButton
        onCompleteSet={mockOnCompleteSet}
        workoutStarted={true}
        isResting={false}
        restCompleted={false}
        isPaused={false}
        isStopped={false}
      />,
    )

    fireEvent.press(getByText('Complete Set'))
    expect(mockOnCompleteSet).toHaveBeenCalled()
  })

  it('handles resetButtonState correctly', async () => {
    const {getByText, rerender} = render(
      <CompleteSetButton
        ref={mockRef}
        onCompleteSet={mockOnCompleteSet}
        workoutStarted={true}
        isResting={false}
        restCompleted={false}
        isPaused={false}
        isStopped={false}
      />,
    )

    expect(getByText('Complete Set')).toBeTruthy()

    // Call resetButtonState via ref
    await waitFor(() => {
      mockRef.current?.resetButtonState()
    })

    rerender(
      <CompleteSetButton
        ref={mockRef}
        onCompleteSet={mockOnCompleteSet}
        workoutStarted={true}
        isResting={false}
        restCompleted={false}
        isPaused={false}
        isStopped={false}
      />,
    )

    // Ensure no visible side effects (state-related issues)
    expect(getByText('Complete Set')).toBeTruthy()
  })
})
