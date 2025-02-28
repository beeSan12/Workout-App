/**
 * @format
 * @file FirebaseAuthMock.tsx
 * @description Unit mock for Firebase Auth module. Mocks the Firebase Auth module to simulate user authentication and registration.
 * @author Beatriz Sanssi <bs222eh@student.lnu.se>
 * @dependencies None
 * @usage Run this file using Jest to execute tests. This file is used to mock the Firebase Auth module for testing purposes.
 */

import {jest} from '@jest/globals'

interface User {
  email: string
  uid: string
}

export interface FirebaseAuthMock {
  currentUser: User | null
  onAuthStateChanged: jest.Mock<(callback: (user: User | null) => void) => void>
  signInWithEmailAndPassword: jest.Mock<
    (email: string, password: string) => Promise<{user: User}>
  >
  createUserWithEmailAndPassword: jest.Mock<
    (email: string, password: string) => Promise<{user: User}>
  >
  signOut: jest.Mock<() => Promise<void>>
}

export const firebaseAuthMock: FirebaseAuthMock = {
  currentUser: null,
  onAuthStateChanged: jest.fn((callback: (user: User | null) => void) =>
    callback(firebaseAuthMock.currentUser),
  ),

  signInWithEmailAndPassword: jest.fn((email: string, password: string) => {
    if (password === 'correctpassword') {
      const newUser: User = {email, uid: 'some-unique-id'}
      firebaseAuthMock.currentUser = newUser
      return Promise.resolve({user: newUser})
    } else {
      return Promise.reject(new Error('Wrong password'))
    }
  }),

  createUserWithEmailAndPassword: jest.fn((email: string, password: string) => {
    if (email !== 'existing@example.com') {
      const newUser: User = {email, uid: `uid-${email}`}
      firebaseAuthMock.currentUser = newUser
      return Promise.resolve({user: newUser})
    } else {
      return Promise.reject(new Error('Email already in use'))
    }
  }),

  signOut: jest.fn(() => {
    firebaseAuthMock.currentUser = null
    return Promise.resolve()
  }),
}
