// src/game/state/store.ts
import { configureStore } from '@reduxjs/toolkit'
import gameReducer from './gameSlice'

export const store = configureStore({
  reducer: {
    game: gameReducer,
  },
})

// Get the types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store