import { configureStore } from '@reduxjs/toolkit';
import dataSlice from './slice/dataSlice';
import siteDataSlice from './slice/siteDataSlice';
import userSlice from './slice/userSlice';

const Store = configureStore({
  reducer : {
    data : dataSlice,
    siteData: siteDataSlice,
    user: userSlice,
  },
});

export default Store;
