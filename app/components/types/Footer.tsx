/**
 * The Footer component is a navigation bar that appears at the bottom of the screen.
 * It contains buttons to navigate to the home screen, start a new workout, log out,
 * and go back to the previous screen. The component also includes a collapse button
 * that appears when the user is on the workout screen.
 *
 * @module Footer
 * @version 1.0.0
 * @author Beatriz Sanssi <bs222eh@student.lnu.se>
 */

import React, {useState, useEffect} from 'react'
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import {useRouter} from 'expo-router'
import {appSignOut} from '../../hooks/store'
import * as Font from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import IoniconsFont from 'assets/fonts/Ionicons.ttf'
import MaterialCommunityIconsFont from 'assets/fonts/MaterialCommunityIcons.ttf'

console.log('Rendering Footer')
interface FooterProps {
  onCollapse?: () => void // Add an optional collapse function
  isWorkoutScreen?: boolean // Add a flag to indicate if we are in a workout screen
}

const Footer: React.FC<FooterProps> = ({onCollapse, isWorkoutScreen}) => {
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

        // Load the icons (Ionicons)
        await Font.loadAsync({
          Ionicons: IoniconsFont,
          MaterialCommunityIcons: MaterialCommunityIconsFont,
        })

        // Mark the fonts as loaded
        setFontsLoaded(true)

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

  const handleLogout = async () => {
    try {
      await appSignOut()
      console.log('User signed out successfully.')
      router.replace('/Login') // Redirect to the login screen
    } catch (error) {
      console.error('Error during sign-out:', error)
    }
  }

  return (
    <View style={styles.footer}>
      <TouchableOpacity
        testID="home-button"
        style={styles.footerButton}
        onPress={() => router.push('/components/(inside)/List')}
      >
        <Ionicons name="home" size={40} color="#faf0e6" />
        <Text style={styles.buttonText}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="start-new-workout-button"
        style={styles.footerButton}
        onPress={() => router.push('/components/(inside)/StartNewWorkout')}
      >
        <MaterialCommunityIcons name="arm-flex" size={40} color="#faf0e6" />
        <Text style={styles.buttonText}>Workout</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="log-out-button"
        style={styles.footerButton}
        onPress={handleLogout}
      >
        <Ionicons name="log-out" size={40} color="#faf0e6" />
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="go-back-button"
        style={styles.footerButton}
        onPress={() => router.back()}
      >
        <Ionicons name="return-up-back" size={40} color="#faf0e6" />
        <Text style={styles.buttonText}>Go Back</Text>
      </TouchableOpacity>
      {isWorkoutScreen && (
        <TouchableOpacity
          testID="close-button"
          style={styles.footerButton}
          onPress={onCollapse}
        >
          <Ionicons name="close" size={40} color="#faf0e6" />
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#778899',
    borderTopColor: '#ddd',
    borderTopWidth: 1,
    paddingBottom: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#faf0e6',
    fontSize: 20,
    alignSelf: 'center',
    marginTop: 5,
  },
  footerButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    flexDirection: 'column',
  },
})

export default Footer
