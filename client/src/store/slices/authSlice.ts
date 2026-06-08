import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { AuthUser } from '@/types/auth.types'
import { decodeJwtPayload, mapJwtPayloadToAuthUser } from '@/utils/jwt'
import { clearStoredToken, getStoredToken, setStoredToken } from '@/utils/token'

interface AuthState {
  token: string | null
  user: AuthUser | null
}

function createInitialState(): AuthState {
  const token = getStoredToken()

  if (!token) {
    return { token: null, user: null }
  }

  const payload = decodeJwtPayload(token)

  if (!payload) {
    clearStoredToken()
    return { token: null, user: null }
  }

  return {
    token,
    user: mapJwtPayloadToAuthUser(payload),
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState: createInitialState(),
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: AuthUser }>,
    ) => {
      state.token = action.payload.token
      state.user = action.payload.user
      setStoredToken(action.payload.token)
    },
    clearCredentials: (state) => {
      state.token = null
      state.user = null
      clearStoredToken()
    },
    setUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload
    },
  },
})

export const { setCredentials, clearCredentials, setUser } = authSlice.actions
export const authReducer = authSlice.reducer

export const selectAuthToken = (state: { auth: AuthState }) => state.auth.token
export const selectAuthUser = (state: { auth: AuthState }) => state.auth.user
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  Boolean(state.auth.token && state.auth.user)
