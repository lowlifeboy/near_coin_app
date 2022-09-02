import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface UserState {
  accountId: string;
  deposit: number;
  availableRoutesNumber: number;
  rate: number;
}

const initialState: UserState = {
  accountId: '',
  deposit: 0,
  availableRoutesNumber: 0,
  rate: 0,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setAccountId: (state, action: PayloadAction<string>) => ({ ...state, accountId: action.payload }),
    setDeposit: (state, action: PayloadAction<number>) => ({ ...state, deposit: action.payload }),
    setAvailableRoutesNumber: (state, action: PayloadAction<number>) => ({ ...state, availableRoutesNumber: action.payload }),
    setRate: (state, action: PayloadAction<number>) => ({ ...state, rate: action.payload }),
  },
});

const { actions, reducer } = userSlice;
// Extract and export each action creator by name
export const { setAccountId, setDeposit, setAvailableRoutesNumber, setRate } = actions;
// Export the reducer, either as a default or named export
export default reducer;
