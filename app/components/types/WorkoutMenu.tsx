/**
 * This component is responsible for displaying the workout menu for the user.
 *
 * @module WorkoutMenu
 * @version 1.0.0
 * @author Beatriz Sanssi <bs222eh@student.lnu.se>
 */
import React, {useEffect, useState} from 'react'
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import IoniconsFont from 'assets/fonts/Ionicons.ttf'
import * as Font from 'expo-font'
import {useRouter} from 'expo-router'
import {useWorkoutContext} from './WorkoutContext'
import * as SplashScreen from 'expo-splash-screen'

interface WorkoutMenuProps {
  onToggle: () => void
}

const WorkoutMenu: React.FC<WorkoutMenuProps> = ({onToggle}) => {
  const {
    startWorkout,
    pauseWorkout,
    resumeWorkout,
    stopWorkout,
    isPaused,
    isWorkingOut,
  } = useWorkoutContext()

  const router = useRouter()

  const [fontsLoaded, setFontsLoaded] = useState(false)

  useEffect(() => {
    /**
     * Load the fonts and icons.
     */
    async function loadFontsAndIcons() {
      try {
        // Prevent the splash screen from auto-hiding
        await SplashScreen.preventAutoHideAsync()

        await Font.loadAsync({
          Ionicons: IoniconsFont,
        })

        // Mark the fonts as loaded
        setFontsLoaded(true) // Wrap setState in act

        // Hide the splash screen
        await SplashScreen.hideAsync()
      } catch (e) {
        console.warn(e)
      }
    }

    loadFontsAndIcons()
  }, [])

  if (!fontsLoaded) {
    return null // Return null while the app is loading
  }

  return (
    <View style={styles.menu}>
      {!isWorkingOut ? (
        <TouchableOpacity
          testID="start-button"
          onPress={startWorkout}
          style={styles.menuButton}
        >
          <Ionicons name="barbell" size={40} color="#faf0e6" />
          <Text style={styles.buttonText}>Start</Text>
        </TouchableOpacity>
      ) : isPaused ? (
        <TouchableOpacity
          testID="resume-button"
          onPress={resumeWorkout}
          style={styles.menuButton}
        >
          <Ionicons name="play" size={40} color="#faf0e6" />
          <Text style={styles.buttonText}>Resume</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          testID="pause-button"
          onPress={pauseWorkout}
          style={styles.menuButton}
        >
          <Ionicons name="pause" size={40} color="#faf0e6" />
          <Text style={styles.buttonText}>Pause</Text>
        </TouchableOpacity>
      )}
      {isWorkingOut && (
        <TouchableOpacity
          testID="stop-button"
          onPress={stopWorkout}
          style={styles.menuButton}
        >
          <Ionicons name="stop" size={40} color="#faf0e6" />
          <Text style={styles.buttonText}>Stop</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        testID="go-back-button"
        style={styles.menuButton}
        onPress={() => router.back()}
      >
        <Ionicons name="return-up-back" size={40} color="#faf0e6" />
        <Text style={styles.buttonText}>Go Back</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="menu-button"
        style={styles.menuButton}
        onPress={onToggle}
      >
        <Ionicons name="menu" size={40} color="#faf0e6" />
        <Text style={styles.buttonText}>Menu</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  menu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#778899',
    borderTopColor: '#ddd',
    borderTopWidth: 1,
    paddingBottom: 15,
    alignItems: 'center',
  },
  menuButton: {
    alignItems: 'center',
    padding: 10,
  },
  buttonText: {
    color: '#faf0e6',
    fontSize: 20,
    alignSelf: 'center',
    marginTop: 5,
  },
})

export default WorkoutMenu
