/**
 * This is a test file for the user workouts component.
 * @test {UserWorkouts}
 * @version 1.0.0
 * @author Beatriz Sanssi <bs222eh@student.lnu.se>
 */

import React from 'react'
import {render, fireEvent, waitFor, act} from '@testing-library/react-native'
import UserWorkouts from '../app/components/(inside)/UserWorkouts'
import {getUserWorkouts} from '../FirebaseConfig'
import {deleteDoc} from 'firebase/firestore'

// Mock Firebase Config
jest.mock('../FirebaseConfig', () => ({
  ...jest.requireActual('../__mocks__/FirebaseConfig.mock'),
  getUserWorkouts: jest.fn(),
  FIREBASE_AUTH: {
    currentUser: {uid: '12345'},
  },
}))

jest.mock('firebase/firestore', () => ({
  deleteDoc: jest.fn().mockResolvedValueOnce(() => Promise.resolve()),
  doc: jest.fn(),
}))

// Mock data
const mockWorkouts = [
  {
    id: '1',
    workoutType: 'Upper Body',
    duration: 1800, // 30 minutes
  },
  {
    id: '2',
    workoutType: 'Lower Body',
    duration: 3600, // 1 hour
  },
]

describe('UserWorkouts Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows a loading spinner when loading is true', async () => {
    ;(getUserWorkouts as jest.Mock).mockResolvedValueOnce([])

    const {getByText, getByTestId} = render(<UserWorkouts />)

    await waitFor(() => {
      expect(getByTestId('loading-indicator')).toBeTruthy()
      expect(getByText('Loading workouts...')).toBeTruthy()
    })
  })

  it('renders no workouts message when no workouts are available', async () => {
    ;(getUserWorkouts as jest.Mock).mockResolvedValueOnce([])

    const {getByText} = render(<UserWorkouts />)

    await waitFor(() => {
      expect(getByText('No workouts found.')).toBeTruthy()
    })
  })

  it('renders a list of workouts correctly', async () => {
    const mockWorkouts = [
      {
        id: '1',
        workoutType: 'Upper Body',
        duration: 1800, // 30 minutes
      },
      {
        id: '2',
        workoutType: 'Lower Body',
        duration: 3600, // 1 hour
      },
    ]
    ;(getUserWorkouts as jest.Mock).mockResolvedValueOnce(mockWorkouts)

    const {getByText} = render(<UserWorkouts />)

    await waitFor(() => {
      expect(getByText(/'Upper Body'/)).toBeTruthy() // Match 'Upper Body'
      expect(getByText(/30m\s*0s/)).toBeTruthy() // Match duration with possible whitespace
      expect(getByText(/'Lower Body'/)).toBeTruthy() // Match 'Lower Body'
      expect(getByText(/1h\s*0m\s*0s/)).toBeTruthy() // Match duration with possible whitespace
    })
  })

  it('allows the user to delete a workout', async () => {
    // Mock the return value for getUserWorkouts
    ;(getUserWorkouts as jest.Mock).mockResolvedValueOnce(mockWorkouts)

    const {getByText, getByTestId, queryByText} = render(<UserWorkouts />)

    await waitFor(() => expect(getByText(/'Upper Body'/)).toBeTruthy())

    const deleteButton = getByTestId('delete-button-1')
    fireEvent.press(deleteButton)

    await waitFor(() => expect(deleteDoc).toHaveBeenCalledTimes(1))

    // Ensure the workout is removed from the DOM
    await waitFor(() => expect(queryByText(/'Upper Body'/)).toBeNull())
  })

  it('handles workout fetching errors', async () => {
    // Mock the rejection for getUserWorkouts
    ;(getUserWorkouts as jest.Mock).mockRejectedValueOnce(
      new Error('Failed to fetch workouts'),
    )

    const {getByText} = render(<UserWorkouts />)

    await waitFor(() =>
      expect(getByText('Failed to fetch workouts')).toBeTruthy(),
    )
  })
})
