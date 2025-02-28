/**
 * This component is responsible for displaying the rest timer for the user
 *
 * @component RestTimer
 * @version 1.0.0
 * @author Beatriz Sanssi <bs222eh@student.lnu.se>
 */

import React, {useState, useEffect, useCallback} from 'react'
import {View, StyleSheet, Animated, Easing, Text} from 'react-native'
import {useWorkoutContext} from '../../types/WorkoutContext'

interface RestTimerProps {
  onComplete: () => void
  isStopped: boolean
}

const RestTimer: React.FC<RestTimerProps> = ({onComplete, isStopped}) => {
  const [blink, setBlink] = useState(false)
  const [color] = useState(new Animated.Value(0)) // 0 for white, 1 for red
  const [isCompleted, setIsCompleted] = useState(false)
  const [remainingTime, setRemainingTime] = useState(120000)
  const {isPaused, completeRest} = useWorkoutContext()
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)

  // Start the continuous blinking animation
  const startBlinkAnimation = useCallback(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(color, {
          toValue: 1, // Transition to red
          duration: 700, // Duration for the transition
          easing: Easing.inOut(Easing.ease), // Smooth easing
          useNativeDriver: false,
        }),
        Animated.timing(color, {
          toValue: 0, // White
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
    )
    anim.start()
  }, [color])

  useEffect(() => {
    if (isStopped || isPaused) return // Do nothing if the workout is stopped or paused

    // Start the countdown timer
    const interval = setInterval(() => {
      setRemainingTime(prevTime => {
        if (prevTime <= 1000) {
          clearInterval(interval) // Stop timer when it reaches zero
          onComplete() // Notify the parent when the timer completes
          completeRest() // Mark the rest as completed
          setIsCompleted(true) // Set the completion flag
          return 0
        }
        return prevTime - 1000
      })
    }, 1000)

    return () => clearInterval(interval) // Clean up interval
  }, [isStopped, isPaused, onComplete, completeRest])

  useEffect(() => {
    if (remainingTime <= 10000) {
      startBlinkAnimation() // Start blinking when less than 10 seconds
      setBlink(true)
    }
  }, [remainingTime, startBlinkAnimation])

  // Convert remainingTime to minutes and seconds
  const minutes = Math.floor(remainingTime / 60000)
  const seconds = Math.floor((remainingTime % 60000) / 1000)

  // Interpolating the color from white to red
  const animatedColor = color.interpolate({
    inputRange: [0, 1],
    outputRange: ['#FFFFFF', '#FF0000'], // From white to red
  })

  // Render GO! when completed
  if (isCompleted) {
    return (
      <View style={styles.container}>
        <Text style={styles.completedText}>GO!</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.roundClock}>
        <Animated.Text
          style={[
            styles.timerText,
            {color: animatedColor},
            blink && {opacity: seconds % 2 === 0 ? 1 : 0.7}, // Blinking effect
          ]}
        >
          {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </Animated.Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  roundClock: {
    backgroundColor: '#465461',
    width: 300, // Set the diameter of the clock
    height: 300, // Set the diameter of the clock
    borderRadius: 200, // Make it circular
    justifyContent: 'center', // Center the content vertically
    alignItems: 'center', // Center the content horizontally
    borderWidth: 5,
    borderColor: '#778899', // Optional: Add a border color
    shadowColor: '#465461',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.8,
    shadowRadius: 10,
    alignSelf: 'center', // Center the clock horizontally
    marginVertical: 'auto', // Center the clock vertically
  },
  timerText: {
    fontSize: 60, // Large, easy to read numbers
    fontWeight: 'bold',
    color: '#FFF', // White text for better readability
    alignContent: 'center',
  },
  completedText: {
    fontSize: 55,
    fontWeight: 'bold',
    color: '#00FF00', // Green text for better readability
    alignContent: 'center',
  },
})

export default RestTimer
