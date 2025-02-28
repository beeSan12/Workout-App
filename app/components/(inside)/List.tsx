/**
 * The home screen with menu options.
 *
 * @component List
 * @version 1.0.0
 * @author Beatriz Sanssi <bs222eh@student.lnu.se>
 */

import React, {useEffect} from 'react'
import {useRouter} from 'expo-router'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ImageSourcePropType,
  Dimensions,
} from 'react-native'
import StreatchingGirl from '../../Pictures/StreatchingGirl.png'
import * as SplashScreen from 'expo-splash-screen'
import {Asset} from 'expo-asset'

const {width} = Dimensions.get('window')
const imageSource: ImageSourcePropType = StreatchingGirl

const List = () => {
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
        await Asset.fromModule(StreatchingGirl).downloadAsync()

        setImageLoaded(true)
        console.log('Image loaded on List Screen')

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
        style={styles.backgroundImage}
        imageStyle={styles.imageStyle}
      >
        <View style={styles.listContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('./StartNewWorkout')}
          >
            <Text style={styles.buttonText}>Start a new Workout</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('./UserWorkouts')}
          >
            <Text style={styles.buttonText}>Check my Progress</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
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
    paddingTop: 20,
    paddingBottom: 100,
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    paddingLeft: 70,
    padding: 10,
    backgroundColor: 'transparent',
    opacity: 0.8,
  },
  button: {
    backgroundColor: '#778899',
    padding: 10,
    margin: 10,
    borderRadius: 5,
    alignItems: 'center',
    width: width * 0.6,
    maxWidth: 400,
    alignSelf: 'flex-start',
    fontSize: 20,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 30,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  imageStyle: {
    opacity: 0.5,
    resizeMode: 'cover',
  },
})

export default List
