/**
 * This component is used to display the "GO!" message when the user starts a workout
 * after a rest session.
 *
 * @component GoMessage
 */

import React, {useEffect, useRef} from 'react'
import {View, Animated, StyleSheet} from 'react-native'

const GoMessage: React.FC<{onAnimationEnd: () => void}> = ({
  onAnimationEnd,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current // Start with scale 1

  useEffect(() => {
    // Sequence animation for enlarging and shrinking the text
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 2, // Enlarge the text 2x
        duration: 500, // Duration for enlarging
        useNativeDriver: false,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.5, // Shrink the text to 0.5x
        duration: 500, // Duration for shrinking
        useNativeDriver: false,
      }),
    ]).start(() => {
      // Hide the message when the animation ends
      onAnimationEnd()
    })
  }, [scaleAnim, onAnimationEnd])

  return (
    <View style={styles.goMessageContainer}>
      <Animated.Text
        style={[
          styles.goText,
          {
            transform: [{scale: scaleAnim}],
          },
        ]}
      >
        GO!
      </Animated.Text>
    </View>
  )
}

const styles = StyleSheet.create({
  goMessageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  goText: {
    fontSize: 150,
    fontWeight: '900',
    color: '#708090',
    textShadowColor: '#FFF',
    textShadowOffset: {width: -2, height: 2},
    textShadowRadius: 5,
    marginBottom: 10,
  },
})

export default GoMessage
