import {Action, configureStore, ThunkAction} from '@reduxjs/toolkit';
import {setupListeners} from '@reduxjs/toolkit/query/react';
import userReducer from './slices/userSlice';
import {combineReducers} from 'redux';
import storage from 'redux-persist/lib/storage';
import {persistReducer} from 'redux-persist';

const reducers = combineReducers({
  user: userReducer,
});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user'],
};

const persistedReducer = persistReducer(persistConfig, reducers);

export const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.REACT_APP_NODE_ENV !== 'production',
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false,
  }),
});

setupListeners(store.dispatch);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
