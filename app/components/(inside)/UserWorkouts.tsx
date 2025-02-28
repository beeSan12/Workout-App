/**
 * This component is responsible for displaying the user's workouts.
 *
 * @component UserWorkouts
 * @version 1.0.0
 * @author Beatriz Sanssi <bs222eh@student.lnu.se>
 */

import React, {useEffect, useState} from 'react'
import {
  getUserWorkouts,
  FIREBASE_STORE,
  FIREBASE_AUTH,
} from '../../../FirebaseConfig'
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
} from 'react-native'
import DumbellSmall from '../../Pictures/DumbellSmall.jpg'
import {deleteDoc, doc} from 'firebase/firestore'
import Ionicons from 'react-native-vector-icons/Ionicons'

interface Workout {
  id: string
  workoutType: string
  duration: number
  startTime?: {
    seconds: number
    nanoseconds: number
  } | null
}

const {width} = Dimensions.get('window')

const UserWorkouts = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWorkouts = async () => {
      setLoading(true)
      setError(null)
      try {
        const fetchedWorkouts = await getUserWorkouts()
        setWorkouts(fetchedWorkouts)
      } catch (error) {
        console.error('Failed to fetch workouts', error)
        setError('Failed to fetch workouts')
      } finally {
        setLoading(false)
      }
    }

    fetchWorkouts()
  }, [])

  // Function to delete a workout
  const deleteWorkout = async (id: string) => {
    try {
      // Delete the workout from Firestore
      const workoutRef = doc(
        FIREBASE_STORE,
        `users/${FIREBASE_AUTH.currentUser?.uid}/workouts`,
        id,
      )
      await deleteDoc(workoutRef)

      // Update the UI by removing the deleted workout from state
      setWorkouts(prevWorkouts =>
        prevWorkouts.filter(workout => workout.id !== id),
      )

      console.log(`Workout with id ${id} deleted successfully`)
    } catch (error) {
      console.error('Error deleting workout:', error)
    }
  }

  const formatDuration = (totalSeconds: number) => {
    if (isNaN(totalSeconds) || totalSeconds <= 0) {
      return 'Unknown Duration' // Handle invalid durations safely
    }

    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = Math.floor(totalSeconds % 60)

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          testID="loading-indicator"
          size="large"
          color="#0000ff"
        />
        <Text>Loading workouts...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>{error}</Text>
      </View>
    )
  }

  if (workouts.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noWorkoutsText}>No workouts found.</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={DumbellSmall}
        style={styles.backgroundImage}
        imageStyle={styles.imageStyle}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Workouts</Text>
        </View>
        <ScrollView contentContainerStyle={styles.listContainer}>
          {workouts.map(workout => (
            <View key={workout.id} style={styles.workoutItem}>
              <Text style={styles.workoutText}>
                <Text style={styles.label}>Workout Type:</Text>
                {"'" + (workout.workoutType || 'Unknown Type') + "'"}
              </Text>
              <Text style={styles.workoutText}>
                <Text style={styles.label}>Duration:</Text>{' '}
                {formatDuration(workout.duration)}
              </Text>
              <Text style={styles.workoutText}>
                <Text style={styles.label}>Date:</Text>
                {workout.startTime
                  ? new Date(workout.startTime.seconds * 1000)
                      .toISOString()
                      .split('T')[0]
                  : 'Unknown Date'}
              </Text>
              <TouchableOpacity
                testID={`delete-button-${workout.id}`}
                style={styles.deleteButton}
                onPress={() => deleteWorkout(workout.id)}
              >
                <Ionicons name="trash-outline" size={25} color="#faf0e6" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </ImageBackground>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  imageStyle: {
    opacity: 0.7,
    objectFit: 'cover',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: width * 0.6,
    maxWidth: 300,
  },
  noWorkoutsText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#778899',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EBECF4',
    shadowColor: '#454D65',
    shadowOffset: {height: 5, width: 0},
    shadowRadius: 15,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '500',
    color: '#FFF',
  },
  listContainer: {
    paddingTop: 20,
    left: '8%',
    margin: 30,
    padding: 10,
    backgroundColor: 'transparent',
    width: width * 0.9,
    maxWidth: 1000,
  },
  workoutItem: {
    marginBottom: 15,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ccc',
    opacity: 0.8,
    width: width * 0.8,
    maxWidth: 900,
  },
  workoutText: {
    fontSize: 20,
    color: '#333',
  },
  label: {
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#778899',
    margin: 5,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
    position: 'absolute',
    right: 10,
    top: 20,
  },
})

export default UserWorkouts
