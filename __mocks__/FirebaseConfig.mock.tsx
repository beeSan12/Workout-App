/**
 * @file FirebaseConfig.tsx
 * @description Unit mock for Firebase Config module.
 * @author Beatriz Sanssi <bs222eh@student.lnu.se>
 * @usage Run this file using Jest to execute tests. This file is used to mock the Firebase Config module for testing purposes.
 */

export const FIREBASE_APP = {}
export const FIREBASE_AUTH = {
  currentUser: {uid: '12345'},
}
export const FIREBASE_STORE = {
  collection: jest.fn(),
  doc: jest.fn(),
  addDoc: jest.fn(),
  setDoc: jest.fn(),
  deleteDoc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  Timestamp: {
    fromDate: jest.fn(),
  },
}
