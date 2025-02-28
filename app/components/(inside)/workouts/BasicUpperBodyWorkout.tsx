/**
 * A basic workout for upper body exercises
 *
 * @component BasicUpperBodyWorkout
 * @version 1.0.0
 * @author Beatriz Sanssi <bs222eh@student.lnu.se>
 */

import React, {useState, useEffect, useMemo} from 'react'
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Dimensions,
} from 'react-native'
import WorkoutMan from '../../../Pictures/WorkoutMan.png'
import CompleteSetButton from './CompleteSetButton'
import RestTimer from './RestTimer'
import GoMessage from './GoMessage'
import {useWorkoutContext} from '../../types/WorkoutContext'

const {width} = Dimensions.get('window')

const BasicUpperBodyWorkout: React.FC = () => {
  const {
    workoutStarted,
    isPaused,
    isResting,
    restCompleted,
    isStopped,
    completeSet,
    completeRest,
    stopWorkout,
    resumeWorkout,
  } = useWorkoutContext()
  const [currentSet, setCurrentSet] = useState(1)
  const [currentWorkoutIndex, setCurrentWorkoutIndex] = useState(0)
  const [setCompleted, setSetCompleted] = useState(false)
  const [showWorkoutList, setShowWorkoutList] = useState(true)
  const [showRestTimer, setShowRestTimer] = useState(true)
  const [showCompleteButton, setShowCompleteButton] = useState(false)
  const [showGoMessage, setShowGoMessage] = useState(false)
  const [showPauseOptions, setShowPauseOptions] = useState(false)

  const workouts = useMemo(
    () => [
      {id: 'w1', name: 'Chest Press', sets: 3, reps: 8},
      {id: 'w2', name: 'Lat Pulldown', sets: 3, reps: 8},
      {id: 'w3', name: 'Seated Cable Fly', sets: 3, reps: 8},
      {id: 'w4', name: 'Chest Supported Row', sets: 3, reps: 8},
      {id: 'w5', name: 'Tricep Pushdowns', sets: 3, reps: 8},
      {id: 'w6', name: 'Bicep Curls', sets: 3, reps: 8},
    ],
    [],
  )

  useEffect(() => {
    console.log('Rest completed state changed:', restCompleted)
  }, [restCompleted])

  useEffect(() => {
    console.log('Resting State:', {
      isResting,
      currentSet,
      showRestTimer,
      restCompleted,
    })
  }, [isResting, currentSet, showRestTimer, restCompleted])

  useEffect(() => {
    console.log('Workout state:', {
      workoutStarted,
      isResting,
      restCompleted,
      isPaused,
      isStopped,
      currentSet,
      currentWorkoutIndex,
      showRestTimer,
      showGoMessage,
    })
  }, [
    workoutStarted,
    isResting,
    restCompleted,
    isPaused,
    isStopped,
    currentSet,
    currentWorkoutIndex,
    showRestTimer,
    showGoMessage,
  ])

  useEffect(() => {
    if (
      workoutStarted &&
      !isResting &&
      !isPaused &&
      !restCompleted &&
      !isStopped &&
      !showRestTimer &&
      !showGoMessage
    ) {
      setShowCompleteButton(true)
    } else {
      setShowCompleteButton(false)
    }
  }, [
    workoutStarted,
    isResting,
    isPaused,
    restCompleted,
    isStopped,
    showRestTimer,
    showGoMessage,
  ])

  useEffect(() => {
    if (isResting && isPaused) {
      setShowPauseOptions(true)
    } else {
      setShowPauseOptions(false)
    }
  }, [isPaused, isResting])

  const handleContinueWithRest = () => {
    resumeWorkout()
    setShowRestTimer(true)
    setShowPauseOptions(false)
  }

  const handleSkipRest = () => {
    resumeWorkout()
    completeRest()
    setShowRestTimer(false)
    setShowPauseOptions(false)
    setShowCompleteButton(true)
  }

  console.log('State of showCompleteButton conditions:', {
    workoutStarted,
    isResting,
    restCompleted,
    isPaused,
    isStopped,
    showCompleteButton,
    showGoMessage,
  })

  useEffect(() => {
    console.log(
      'currentSet:',
      currentSet,
      'currentWorkoutIndex:',
      currentWorkoutIndex,
    )
    if (currentSet > workouts[currentWorkoutIndex].sets) {
      if (currentWorkoutIndex < workouts.length - 1) {
        setCurrentWorkoutIndex(currentWorkoutIndex + 1)
        setCurrentSet(1)
      }
    }
  }, [currentSet, currentWorkoutIndex, workouts])

  useEffect(() => {
    if (isResting) {
      setSetCompleted(true)
      setShowRestTimer(true)
      setShowCompleteButton(false)
    }
  }, [isResting, currentSet])

  useEffect(() => {
    if (setCompleted) {
      setShowRestTimer(true)
      setShowWorkoutList(false)
      setShowCompleteButton(false)
      console.log('Set completed, now resting...')
    }
  }, [setCompleted])

  useEffect(() => {
    if (restCompleted && !isResting) {
      setShowGoMessage(true)
      setShowWorkoutList(false)
      setTimeout(() => {
        setShowGoMessage(false)
        setShowRestTimer(false)
        setShowWorkoutList(true)
        setShowCompleteButton(true)
      }, 2000) // Wait 2 seconds to show the GO text
    }
  }, [restCompleted, isResting])

  useEffect(() => {
    if (showWorkoutList) {
      setShowRestTimer(false)
      setShowWorkoutList(true)
    }
  }, [showWorkoutList])

  useEffect(() => {
    if (isStopped) {
      stopWorkout()
      resetWorkout()
      setShowWorkoutList(true)
    }
    console.log('Workout state after stop...:', {
      workoutStarted,
      isResting,
      restCompleted,
      isPaused,
      isStopped,
      currentSet,
      currentWorkoutIndex,
      showRestTimer,
    })
  }, [isStopped, stopWorkout])

  const resetWorkout = () => {
    setCurrentWorkoutIndex(0)
    setCurrentSet(1)
    setSetCompleted(false)
    setShowRestTimer(false)
    setShowCompleteButton(false)
    setShowGoMessage(false)
    setShowPauseOptions(false)
  }

  const handleCompleteSet = () => {
    if (!isResting) {
      setCurrentSet(prev => prev + 1)
      setSetCompleted(false)
      setShowRestTimer(true)
      completeSet()
    }
  }

  const handleRestComplete = () => {
    completeRest()
    setShowWorkoutList(true)
    setShowCompleteButton(true)
  }

  const displayedWorkouts = workouts.slice(
    currentWorkoutIndex,
    currentWorkoutIndex + 3,
  )

  return (
    <View style={styles.container}>
      <ImageBackground
        source={WorkoutMan}
        style={styles.image}
        imageStyle={styles.imageStyle}
      >
        {!showGoMessage && showWorkoutList && (
          <View style={styles.workoutListContainer}>
            {displayedWorkouts.reverse().map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.workoutItem,
                  index === 0 && styles.currentWorkoutItem,
                  index > 0 && styles.fadedWorkoutItem,
                ]}
              >
                <Text style={styles.workoutName}>
                  {item.name}
                  {index === 0 && `(Set ${currentSet} of ${item.sets})`}
                </Text>
              </View>
            ))}
          </View>
        )}
        {!isStopped && showRestTimer && (
          <RestTimer onComplete={handleRestComplete} isStopped={isStopped} />
        )}

        {showGoMessage && (
          <GoMessage onAnimationEnd={() => setShowGoMessage(false)} />
        )}

        {workoutStarted && showCompleteButton && (
          <CompleteSetButton
            workoutStarted={workoutStarted}
            isResting={isResting}
            restCompleted={restCompleted}
            isPaused={isPaused}
            isStopped={isStopped}
            onCompleteSet={handleCompleteSet}
          />
        )}

        {showPauseOptions && (
          <View style={styles.pauseOptionsContainer}>
            <TouchableOpacity
              style={styles.continueOption}
              onPress={handleContinueWithRest}
            >
              <Text style={styles.continueOptionText}>Continue With Rest</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.continueOption}
              onPress={handleSkipRest}
            >
              <Text style={styles.continueOptionText}>Skip Rest</Text>
            </TouchableOpacity>
          </View>
        )}
      </ImageBackground>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  currentWorkoutItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Highlight current workout
  },
  fadedWorkoutItem: {
    opacity: 0.5, // Faded style for upcoming workouts
  },
  image: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  imageStyle: {
    opacity: 0.7,
    objectFit: 'cover',
  },
  workoutListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column-reverse',
    width: width * 0.6,
    maxWidth: 300,
  },
  workoutItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    marginVertical: 10,
    width: width * 0.6,
    maxWidth: 300,
    alignItems: 'center',
  },
  workoutName: {
    color: '#FFF',
    fontSize: 30,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutTimer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexDirection: 'column',
    margin: 20,
  },
  buttonPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  restText: {
    fontSize: 50,
    fontWeight: '500',
    color: '#FFF',
    marginBottom: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  currentWorkout: {
    fontSize: 20,
    fontWeight: '500',
    margin: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: '#FFF',
    padding: 20,
    textAlign: 'center',
  },
  pauseOptionsContainer: {
    flex: 1,
    padding: 20,
    top: 100,
    justifyContent: 'center',
    alignItems: 'center',
    width: width * 0.6,
    maxWidth: 300,
  },
  continueOption: {
    backgroundColor: '#778899',
    padding: 20,
    margin: 20,
    borderRadius: 10,
    alignSelf: 'center',
    marginVertical: 25,
    bottom: 100,
    width: width * 0.8,
    maxWidth: 300,
  },
  continueOptionText: {
    color: '#FFF',
    fontSize: 30,
    fontWeight: '500',
    alignSelf: 'center',
  },
})

export default BasicUpperBodyWorkout
