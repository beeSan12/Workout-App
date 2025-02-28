/**
 * This component presents the user with the option to start a workout.
 *
 * @component StartWorkout
 * @version 1.0.0
 * @author Beatriz Sanssi <bs222eh@student.lnu.se>
 */

import React, {useEffect} from 'react'
import {useRouter} from 'expo-router'
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ImageSourcePropType,
  Dimensions,
} from 'react-native'
import Heavy from '../../Pictures/Heavy.jpg'
import * as SplashScreen from 'expo-splash-screen'
import {Asset} from 'expo-asset'

const {width} = Dimensions.get('window')
const imageSource: ImageSourcePropType = Heavy

const StartWorkout = () => {
  const router = useRouter()
  const [imageLoaded, setImageLoaded] = React.useState(false)

  useEffect(() => {
    /**
     * Load the assets.
     */
    async function loadImage() {
      try {
        // Prevent the splash screen from auto-hiding
        await SplashScreen.preventAutoHideAsync()

        // Preload the image
        await Asset.fromModule(Heavy).downloadAsync()

        setImageLoaded(true)
        console.log('Image loaded on Start New Workout Screen')

        // Hide the splash screen
        await SplashScreen.hideAsync()
      } catch (e) {
        console.warn(e)
      }
    }

    loadImage()
  }, [])

  if (!imageLoaded) {
    return null
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={imageSource}
        resizeMode="cover"
        style={styles.image}
        imageStyle={styles.imageStyle}
      >
        <View style={styles.listContainer}>
          <TouchableOpacity
            testID="lower-body-workout-button"
            style={styles.button}
            onPress={() => router.push('./workouts/basic-lower-body')}
          >
            <Text style={styles.buttonText}>Start a lower body workout</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="upper-body-workout-button"
            style={styles.button}
            onPress={() => router.push('./workouts/basic-upper-body')}
          >
            <Text style={styles.buttonText}>Start an upper body workout</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="go-back-button"
            style={styles.button}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingTop: 180,
    paddingBottom: 110,
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    paddingLeft: 110,
    padding: 10,
    backgroundColor: 'transparent',
    opacity: 0.8,
  },
  image: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#778899',
    width: '100%',
    height: '100%',
  },
  imageStyle: {
    opacity: 0.6,
    resizeMode: 'cover',
  },
  button: {
    backgroundColor: '#778899',
    padding: 10,
    margin: 10,
    borderRadius: 5,
    alignItems: 'center',
    width: width * 0.6,
    maxWidth: 400,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 30,
  },
})

export default StartWorkout
