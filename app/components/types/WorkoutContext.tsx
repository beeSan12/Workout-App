/**
 * This file contains the context for the workout state globally used.
 *
 * @file WorkoutContextType
 * @version 1.0.0
 * @author Beatriz Sanssi <bs222eh@student.lnu.se>
 */

import React, {createContext, useState, useEffect, useContext} from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface WorkoutContextType {
  workoutStarted: boolean
  startWorkout: () => void
  pauseWorkout: () => void
  resumeWorkout: () => void
  stopWorkout: () => void
  completeSet: () => void
  completeRest: () => void
  isPaused: boolean
  isStopped: boolean
  restCompleted: boolean
  isResting: boolean
  isWorkingOut: boolean
  onToggle: () => void
}

interface WorkoutState {
  workoutStarted: boolean
  isPaused: boolean
  isStopped: boolean
  isWorkingOut: boolean
  isResting: boolean
  restCompleted: boolean
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined)

export const WorkoutProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [workoutStarted, setWorkoutStarted] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [restCompleted, setRestCompleted] = useState(false)
  const [isWorkingOut, setIsWorkingOut] = useState(false)
  const [isResting, setIsResting] = useState(false)
  const [isStopped, setIsStopped] = useState(false)

  useEffect(() => {
    const loadWorkoutState = async () => {
      try {
        const savedWorkout = await AsyncStorage.getItem('workoutState')
        if (savedWorkout) {
          const parsedState: {
            workoutStarted: boolean
            isPaused: boolean
            isStopped: boolean
            isWorkingOut: boolean
            isResting: boolean
            restCompleted: boolean
          } = JSON.parse(savedWorkout)

          // If the workout was started but not stopped correctly, stop it
          if (parsedState.workoutStarted && !parsedState.isStopped) {
            stopWorkout()
            saveWorkoutData(parsedState) // Save the workout data
          } else {
            // If the workout was stopped correctly, load the state
            setWorkoutStarted(parsedState.workoutStarted)
            setIsPaused(parsedState.isPaused)
            setIsStopped(parsedState.isStopped)
            setIsWorkingOut(parsedState.isWorkingOut)
            setIsResting(parsedState.isResting)
            setRestCompleted(parsedState.restCompleted)
          }
        }
      } catch (e) {
        console.log('Failed to load workout state:', e)
      }
    }
    loadWorkoutState()
  }, [])

  useEffect(() => {
    const saveWorkoutState = async () => {
      try {
        await AsyncStorage.setItem(
          'workoutState',
          JSON.stringify({
            workoutStarted,
            isPaused,
            isStopped,
            isWorkingOut,
            isResting,
            restCompleted,
          }),
        )
      } catch (e) {
        console.log('Failed to save workout state:', e)
      }
    }
    saveWorkoutState()
  }, [
    workoutStarted,
    isPaused,
    isStopped,
    isWorkingOut,
    isResting,
    restCompleted,
  ])

  // Save the workout data
  const saveWorkoutData = async (parsedState: WorkoutState) => {
    try {
      const workoutData = {
        ...parsedState,
        endTime: new Date().toISOString(),
      }
      await AsyncStorage.setItem(
        'completedWorkout',
        JSON.stringify(workoutData),
      )
      console.log('Workout data saved:', workoutData)
    } catch (error) {
      console.log('Failed to save workout data:', error)
    }
  }

  const startWorkout = () => {
    console.log('Starting workout...')
    setWorkoutStarted(true)
    setIsPaused(false)
    setIsWorkingOut(true)
    setIsResting(false)
    setIsStopped(false)
    setRestCompleted(false)
  }

  const completeSet = () => {
    setIsResting(true)
    setRestCompleted(false)
  }

  const completeRest = () => {
    setIsResting(false)
    setRestCompleted(true)
  }

  const pauseWorkout = () => {
    setIsPaused(true)
    setIsWorkingOut(false)
  }

  const resumeWorkout = () => {
    setIsPaused(false)
    setIsWorkingOut(true)
  }

  const stopWorkout = () => {
    setWorkoutStarted(false)
    setIsPaused(false)
    setIsWorkingOut(false)
    setIsResting(false)
    setIsStopped(true)
    setRestCompleted(false)
  }

  const onToggle = () => setWorkoutStarted(!workoutStarted)

  return (
    <WorkoutContext.Provider
      value={{
        workoutStarted,
        startWorkout,
        pauseWorkout,
        resumeWorkout,
        stopWorkout,
        completeSet,
        completeRest,
        onToggle,
        isPaused,
        isStopped,
        restCompleted,
        isResting,
        isWorkingOut,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  )
}

export const useWorkoutContext = () => {
  const context = useContext(WorkoutContext)
  if (!context) {
    throw new Error('useWorkoutContext must be used within a WorkoutProvider')
  }
  return context
}
