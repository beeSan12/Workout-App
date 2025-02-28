/**
 * This component is responsible for keeping track of the workout duration
 *
 * @component WorkoutTimer
 * @version 1.0.0
 * @author Beatriz Sanssi <bs222eh@student.lnu.se>
 */

import React, {useState, useEffect, useCallback} from 'react'
import {View, Text, StyleSheet, AppState, AppStateStatus} from 'react-native'
import {FIREBASE_STORE, FIREBASE_AUTH} from '../../../../FirebaseConfig'
import {Timestamp, doc, setDoc} from 'firebase/firestore'
import {onAuthStateChanged} from 'firebase/auth'
import {useWorkoutContext} from '../../types/WorkoutContext'

const WorkoutTimer: React.FC<{workoutType: string}> = ({workoutType}) => {
  const {workoutStarted, isPaused, stopWorkout, pauseWorkout} =
    useWorkoutContext()
  const [userId, setUserId] = useState<string | null>(null)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [pausedTime, setPausedTime] = useState<number | null>(null)
  const [duration, setDuration] = useState(0)
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null)

  // State for inactivity timers
  const [primaryInactivityTimer, setPrimaryInactivityTimer] =
    useState<NodeJS.Timeout | null>(null)
  const [finalInactivityTimer, setFinalInactivityTimer] =
    useState<NodeJS.Timeout | null>(null)
  const [backgroundInactivityTimer, setBackgroundInactivityTimer] =
    useState<NodeJS.Timeout | null>(null)
  const [manualPauseTimer, setManualPauseTimer] =
    useState<NodeJS.Timeout | null>(null)

  // Get the user ID
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, user => {
      setUserId(user ? user.uid : null)
    })
    return () => unsubscribe()
  }, [])

  // Save workout data to Firestore
  const saveWorkoutData = useCallback(
    async (totalDuration: number) => {
      if (!startTime || !userId) return

      // Convert startTime from a number (timestamp in milliseconds) to a Date object
      const startDate = new Date(startTime)

      const userWorkoutsDocRef = doc(
        FIREBASE_STORE,
        'users',
        userId,
        'workouts',
        new Date().toISOString(),
      )

      const workoutData = {
        startTime: Timestamp.fromDate(startDate),
        endTime: Timestamp.fromDate(new Date()),
        duration: totalDuration,
        workoutType,
      }

      try {
        await setDoc(userWorkoutsDocRef, workoutData)
        console.log('Workout data saved successfully:', workoutData)
      } catch (error) {
        console.error('Error saving workout data:', error)
      }
    },
    [startTime, userId, workoutType],
  )

  // Function to start the timer
  const startTimer = useCallback((initialStartTime: number) => {
    const id = setInterval(() => {
      const now = Date.now()
      const elapsed = Math.floor((now - initialStartTime) / 1000) // Calculate elapsed time in seconds
      setDuration(elapsed)
    }, 1000)
    setTimerId(id)
  }, [])

  // Function to clear the interval
  const clearTimer = useCallback(() => {
    if (timerId) {
      clearInterval(timerId) // Clear the timer
      setTimerId(null) // Reset the timerId to null
    }
  }, [timerId])

  const clearPrimaryInactivityTimer = useCallback(() => {
    if (primaryInactivityTimer) {
      clearTimeout(primaryInactivityTimer)
      setPrimaryInactivityTimer(null)
      console.log('Primary inactivity timer cleared')
    }
  }, [primaryInactivityTimer])

  const clearFinalInactivityTimer = useCallback(() => {
    if (finalInactivityTimer) {
      clearTimeout(finalInactivityTimer)
      setFinalInactivityTimer(null)
      console.log('Final inactivity timer cleared')
    }
  }, [finalInactivityTimer])

  const resetWorkout = useCallback(() => {
    setDuration(0)
    setStartTime(null)
    setPausedTime(null)
    clearTimer()
    clearPrimaryInactivityTimer()
    clearFinalInactivityTimer()
  }, [clearTimer, clearPrimaryInactivityTimer, clearFinalInactivityTimer])

  const stopTimer = useCallback(() => {
    stopWorkout()
    if (timerId) {
      clearTimer()
      if (workoutStarted) {
        saveWorkoutData(duration) // Save workout data to Firestore
      }
      resetWorkout() // Reset the workout state
    }
  }, [
    stopWorkout,
    timerId,
    clearTimer,
    workoutStarted,
    saveWorkoutData,
    duration,
    resetWorkout,
  ])

  // Start final inactivity timer (30 minutes)
  const startFinalInactivityTimer = useCallback(() => {
    clearPrimaryInactivityTimer()
    console.log('Starting final inactivity timer for 30 minutes...')

    let elapsedFinalInactivitySeconds = 0

    const intervalId = setInterval(() => {
      elapsedFinalInactivitySeconds++
      console.log()

      if (elapsedFinalInactivitySeconds >= 30 * 60) {
        console.log('Final inactivity timer ended, stopping workout...')
        stopWorkout()
        saveWorkoutData(duration)
        clearInterval(intervalId)
        clearTimer()
        resetWorkout()
        clearFinalInactivityTimer()
        setDuration(0)
      }
    }, 1000)
    setFinalInactivityTimer(intervalId)
  }, [
    clearFinalInactivityTimer,
    clearPrimaryInactivityTimer,
    stopWorkout,
    stopTimer,
    resetWorkout,
    clearTimer,
  ])

  // Start primary inactivity timer (30 minutes)
  const startPrimaryInactivityTimer = useCallback(() => {
    console.log('Starting primary inactivity timer for 30 minutes...')
    let elapsedPrimaryInactivityTimerSeconds = 0

    const intervalId = setInterval(() => {
      elapsedPrimaryInactivityTimerSeconds++

      console.log()

      if (elapsedPrimaryInactivityTimerSeconds >= 30 * 60) {
        console.log('Primary inactivity timer ended, pausing workout...')
        pauseWorkout()
        clearInterval(intervalId)
        clearPrimaryInactivityTimer()
        startFinalInactivityTimer()
      }
    }, 1000)
    setPrimaryInactivityTimer(intervalId)
  }, [clearPrimaryInactivityTimer, pauseWorkout, startFinalInactivityTimer])

  // Handle workout state changes
  useEffect(() => {
    if (workoutStarted && !isPaused && !timerId) {
      const now = Date.now()
      // Start the timer
      if (pausedTime) {
        // Resume the timer from the paused time
        const adjustedStartTime = now - (pausedTime - (startTime ?? now))
        setStartTime(adjustedStartTime)
        startTimer(adjustedStartTime)
        startPrimaryInactivityTimer()
      } else {
        // Start the timer from zero
        setStartTime(now)
        startTimer(now)
        console.log('Workout started, starting timer...')
        startPrimaryInactivityTimer()
      }
    } else if (isPaused) {
      clearTimer()
      clearPrimaryInactivityTimer()
      setPausedTime(Date.now())
    } else if (!workoutStarted) {
      stopTimer()
      resetWorkout()
      saveWorkoutData(duration)
    }
  }, [
    workoutStarted,
    isPaused,
    timerId,
    pausedTime,
    startTime,
    duration,
    startTimer,
    clearTimer,
    resetWorkout,
    saveWorkoutData,
    startPrimaryInactivityTimer,
    stopTimer,
  ])

  // Convert duration to hours, minutes, and seconds
  const hours = Math.floor(duration / 3600)
  const minutes = Math.floor((duration % 3600) / 60)
  const seconds = duration % 60

  return (
    <View style={styles.timerContainer}>
      <Text style={styles.timerText}>
        {hours > 0 && `${hours}:`}
        {minutes > 0 || hours > 0
          ? `${minutes < 10 ? `0${minutes}` : minutes}:`
          : ''}
        {seconds < 10 ? `0${seconds}` : seconds}
      </Text>
    </View>
  )
}

WorkoutTimer.displayName = 'WorkoutTimer'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  timerContainer: {
    position: 'absolute',
    top: 40,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    padding: 10,
    borderRadius: 10,
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#778899',
    padding: 10,
    margin: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    width: '50%',
  },
  timerText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 12,
    marginBottom: 5,
  },
  buttonText: {
    color: '#FFF',
  },
})

export default WorkoutTimer
