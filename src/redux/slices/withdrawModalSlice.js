import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isOpen: false,
  selectedDestination: null,
  step: "destination", // destination, amount, confirmation, success
  amount: 0,
};

export const withdrawModalSlice = createSlice({
  name: "withdrawModal",
  initialState,
  reducers: {
    openWithdrawModal: (state) => {
      state.isOpen = true;
      state.step = "destination";
      state.selectedDestination = null;
    },
    closeWithdrawModal: (state) => {
      state.isOpen = false;
      state.selectedDestination = null;
      state.step = "destination";
      state.amount = 0;
    },
    selectDestination: (state, action) => {
      state.selectedDestination = action.payload;
      state.step = "amount";
    },
    setAmount: (state, action) => {
      state.amount = action.payload;
      state.step = "confirmation";
    },
    completeWithdrawal: (state) => {
      state.step = "success";
    },
    resetWithdrawModal: (state) => {
      return initialState;
    },
  },
});

export const {
  openWithdrawModal,
  closeWithdrawModal,
  selectDestination,
  setAmount,
  completeWithdrawal,
  resetWithdrawModal,
} = withdrawModalSlice.actions;

export default withdrawModalSlice.reducer;
