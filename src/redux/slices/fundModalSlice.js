import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isOpen: false,
  selectedSource: null,
  step: "source", // source, amount, payment, success
  amount: 0,
};

export const fundModalSlice = createSlice({
  name: "fundModal",
  initialState,
  reducers: {
    openFundModal: (state) => {
      state.isOpen = true;
      state.step = "source";
      state.selectedSource = null;
    },
    closeFundModal: (state) => {
      state.isOpen = false;
      state.selectedSource = null;
      state.step = "source";
      state.amount = 0;
    },
    selectSource: (state, action) => {
      state.selectedSource = action.payload;
      state.step = "amount";
    },
    setAmount: (state, action) => {
      state.amount = action.payload;
      state.step = "payment";
    },
    completePayment: (state) => {
      state.step = "success";
    },
    resetFundModal: (state) => {
      return initialState;
    }
  },
});

export const { 
  openFundModal, 
  closeFundModal, 
  selectSource, 
  setAmount,
  completePayment,
  resetFundModal
} = fundModalSlice.actions;

export default fundModalSlice.reducer;