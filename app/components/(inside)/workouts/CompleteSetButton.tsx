/**
 * This component is a button that allows the user to complete a set.
 *
 * @module CompleteSetButton
 * @version 1.0.0
 * @author Beatriz Sanssi <bs222eh@student.lnu.se>
 */

import React, {useImperativeHandle, forwardRef, useState} from 'react'
import {TouchableOpacity, Text, StyleSheet, Dimensions} from 'react-native'

const {width} = Dimensions.get('window')

export interface CompleteSetButtonHandle {
  resetButtonState: () => void
}

interface CompleteSetButtonProps {
  onCompleteSet: () => void
  workoutStarted: boolean
  isResting: boolean
  restCompleted: boolean
  isPaused: boolean
  isStopped: boolean
}

const CompleteSetButton = forwardRef<
  CompleteSetButtonHandle,
  CompleteSetButtonProps
>(
  (
    {
      onCompleteSet,
      workoutStarted,
      isResting,
      restCompleted,
      isPaused,
      isStopped,
    },
    ref,
  ) => {
    const [ignoredRestingStarted, setRestingStarted] = useState(false)

    useImperativeHandle(
      ref,
      () => ({
        resetButtonState: () => {
          console.log('Button state reset')
          setRestingStarted(false)
        },
      }),
      [],
    )

    if (
      !workoutStarted ||
      (isResting && !restCompleted) ||
      isPaused ||
      isStopped
    ) {
      return null
    }

    return (
      <TouchableOpacity
        style={styles.completeSetButton}
        onPress={onCompleteSet}
      >
        <Text style={styles.completeSetButtonText}>Complete Set</Text>
      </TouchableOpacity>
    )
  },
)

CompleteSetButton.displayName = 'CompleteSetButton'

const styles = StyleSheet.create({
  completeSetButton: {
    backgroundColor: '#778899',
    padding: 20,
    margin: 20,
    borderRadius: 10,
    alignSelf: 'center',
    marginVertical: 25,
    bottom: 100, // Adjust positioning as necessary
    width: width * 0.8,
    maxWidth: 300,
  },
  completeSetButtonText: {
    color: '#FFF',
    fontSize: 30,
    fontWeight: '500',
    alignSelf: 'center',
  },
})

export default CompleteSetButton
