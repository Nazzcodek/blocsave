import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import balanceReducer from "./slices/balanceSlice";
import savingsReducer from "./slices/savingsSlice";
import activityReducer from "./slices/activitySlice";
import dashboardReducer from "./slices/dashboardSlice";
import walletReducer from "./slices/walletSlice";
import quicksaveReducer from "./slices/quicksaveSlice";
import safelockReducer from "./slices/safelockSlice";
import adasheReducer from "./slices/adasheSlice";
import modalReducer from "./slices/modalSlice";
import fundModalReducer from "./slices/fundModalSlice";
import withdrawModalReducer from "./slices/withdrawModalSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    balance: balanceReducer,
    savings: savingsReducer,
    activity: activityReducer,
    dashboard: dashboardReducer,
    wallet: walletReducer,
    quicksave: quicksaveReducer,
    safelock: safelockReducer,
    adashe: adasheReducer,
    modal: modalReducer,
    fundModal: fundModalReducer,
    withdrawModal: withdrawModalReducer,
  },
});

export default store;
