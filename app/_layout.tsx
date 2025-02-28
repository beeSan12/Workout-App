/**
 * The layout of the app.
 * @component Layout
 * @version 1.0.0
 * @author Beatriz Sanssi <bs222eh@student.lnu.se>
 */

import {Slot, useSegments, usePathname, useRouter} from 'expo-router'
import {AuthProvider, useAuth} from './hooks/AuthCheck'
import React, {useState, useEffect, useRef} from 'react'
import Footer from './components/types/Footer'
import WorkoutMenu from './components/types/WorkoutMenu'
import {WorkoutProvider} from './components/types/WorkoutContext'
import WorkoutTimer from './components/(inside)/workouts/WorkoutTimer'
import {View} from 'react-native'

// Define the type for WorkoutTimerRef
interface WorkoutTimerRef {
  startWorkout: (workoutType: string) => void
  pauseWorkout: () => void
  resumeWorkout: () => void
  stopWorkout: () => void
  workoutType: string
}

/**
 * Export the main app incapsulated by the AuthProvider
 *
 * @return {JSX.Element} - Main app component
 */
export default function App() {
  return (
    <AuthProvider>
      <WorkoutProvider>
        <MainApp />
      </WorkoutProvider>
    </AuthProvider>
  )
}

/**
 * The main app component which handles the main logic and rendering
 *
 * @return {JSX.Element} - Main app component
 */
function MainApp() {
  // Auth state, router, and other app state variables
  const {uid, user, loading} = useAuth()
  const router = useRouter()
  const segments = useSegments() as string[]
  const pathname = usePathname()

  // Determine if the current screen is the workout screen or login/register
  const isWorkoutScreen =
    segments.includes('basic-upper-body') ||
    segments.includes('basic-lower-body')

  const isLoginOrRegisterScreen =
    pathname === '/Login' || pathname === '/Register'

  const [showWorkoutMenu, setShowWorkoutMenu] = useState(true)

  // Local state to track if the component is fully mounted and if the layout is ready
  const [isMounted, setIsMounted] = useState(false)
  const [layoutReady, setLayoutReady] = useState(false) // Track if the layout is ready

  // Workout timer reference and workout type state
  const ignoredWorkoutTimerRef = useRef<WorkoutTimerRef | null>(null)
  const [workoutType, setWorkoutType] = useState<string>('')

  // Workout state
  const [ignoredWorkoutStarted, setWorkoutStarted] = useState(false)
  const [ignoredIsResting, setIsResting] = useState(false)
  const [restCompleted, setRestCompleted] = useState(false)

  // Debugging information in the console
  console.log('Current pathname:', pathname)
  console.log('Current segments:', segments)
  console.log('Logged-in user uid:', uid)
  console.log('Logged-in user object:', user)

  // Set the mounted state to true once the component mounts
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Mark layout as ready when `Slot` is mounted to prevent premature navigation
  useEffect(() => {
    if (isMounted) {
      console.log('Layout is ready')
      setLayoutReady(true)
    }
  }, [isMounted])

  // Navigate to the login screen if not authenticated, and wait for layout to be ready
  useEffect(() => {
    if (
      layoutReady &&
      !uid &&
      !loading &&
      pathname !== '/Login' &&
      pathname !== '/components/authentication/register-index'
    ) {
      router.replace('/Login') // Safe navigation check to login
    }
  }, [layoutReady, router, uid, loading, pathname])

  // Set workout type based on the current route
  useEffect(() => {
    if (segments.includes('basic-upper-body')) {
      setWorkoutType('Upper Body')
    } else if (segments.includes('basic-lower-body')) {
      setWorkoutType('Lower Body')
    }
  }, [segments])

  // Always show WorkoutMenu when entering a workout screen
  useEffect(() => {
    if (isWorkoutScreen) {
      setShowWorkoutMenu(true)
      setWorkoutStarted(false)
      setIsResting(false)
      setRestCompleted(false)
    }
  }, [isWorkoutScreen])

  const toggleMenu = () => {
    setShowWorkoutMenu(!showWorkoutMenu) // Toggle between WorkoutMenu and Footer
  }

  console.log('Workout Type before rendering:', workoutType)

  const renderFooterOrMenu = () => {
    // If on a workout screen, show the workout menu by default
    if (uid && isWorkoutScreen) {
      if (showWorkoutMenu) {
        return (
          <>
            <WorkoutMenu onToggle={toggleMenu} />
          </>
        )
      } else {
        return (
          <Footer onCollapse={toggleMenu} isWorkoutScreen={isWorkoutScreen} />
        )
      }
    }

    if (uid && !isLoginOrRegisterScreen) {
      return <Footer />
    }
    return null
  }

  // Render the main app layout with the slot for routing and conditional footer/menu
  return (
    <View style={{flex: 1}}>
      {isWorkoutScreen && (
        <>
          <WorkoutTimer workoutType={workoutType} />
        </>
      )}
      <Slot />
      {uid && !isLoginOrRegisterScreen && renderFooterOrMenu()}
    </View>
  )
}
