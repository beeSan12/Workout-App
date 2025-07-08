/**
 * Firebase configuration and initialization
 * @module FirebaseConfig
 * @version 1.0.0
 * @author Beatriz Sanssi <bs222eh@student.lnu.se>
 */

import {initializeApp} from 'firebase/app'
import {getAuth} from 'firebase/auth'
import {
  getFirestore,
  collection,
  addDoc,
  Timestamp,
  getDocs,
  query,
  orderBy,
} from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}
// Initialiaze firebase
export const FIREBASE_APP = initializeApp(firebaseConfig)
export const FIREBASE_AUTH = getAuth(FIREBASE_APP)
export const FIREBASE_STORE = getFirestore(FIREBASE_APP)

/**
 * Add a workout for the current user to Firestore
 *
 * @param {string} workoutType - The type of workout
 * @param {number} duration - The duration of the workout
 */
export async function addWorkoutForUser(workoutType: string, duration: number) {
  const user = FIREBASE_AUTH.currentUser

  if (!user) {
    console.error('No user is signed in.')
    return
  }

  try {
    const docRef = await addDoc(
      collection(FIREBASE_STORE, `users/${user.uid}/workouts`),
      {
        workoutType,
        duration,
        startTime: Timestamp.fromDate(new Date()), // Use startTime consistently
      },
    )

    console.log('Workout added with ID: ', docRef.id)
  } catch (e) {
    console.error('Error adding workout: ', e)
  }
}

export const getUserWorkouts = async () => {
  try {
    const user = FIREBASE_AUTH.currentUser
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Query Firestore to get workouts for the current user
    const workoutsCollection = collection(
      FIREBASE_STORE,
      'users',
      user.uid,
      'workouts',
    )
    const q = query(workoutsCollection, orderBy('startTime', 'desc')) // Order by startTime descending

    const workoutsQuerySnapshot = await getDocs(q)

    // Map the workouts to return the required fields
    const workouts = workoutsQuerySnapshot.docs.map(doc => {
      const data = doc.data() as {
        workoutType: string
        duration: number
        startTime: Timestamp | null
      }
      return {
        id: doc.id,
        workoutType: data.workoutType || '', // Default to empty string
        duration: data.duration, // Keep it as number
        startTime: data.startTime || null, // Timestamp
      }
    })

    return workouts
  } catch (error) {
    console.error('Error fetching user workouts:', error)
    return []
  }
}

export default FIREBASE_APP
