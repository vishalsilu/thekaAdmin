import React, { useEffect, useState } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import authApi from '../../config/authApi';
import { setUserinfo, clearUserinfo } from '../../Redux/slice/userSlice';
import toast from 'react-hot-toast';
import AdminSkeleton from '../AdminSkeleton'; // Ensure the path matches where you saved it

const RequireAuth = ({ children }) => {
  const dispatch = useDispatch();
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true); 
  const location = useLocation();

 // Inside RequireAuth.js

useEffect(() => {
  let mounted = true;
  (async () => {
    try {
      // 🚨 Change this to hit your new dedicated admin endpoint
      const res = await authApi.get('/users/admin/me'); 
      
      // The backend now handles BOTH the auth check AND the role check!
      if (!res.data || res.data.success === false) {
        throw new Error(res.data?.error || 'Not authenticated');
      }

      const user = res?.data?.user;
      
      if (mounted) {
        dispatch(setUserinfo(user));
        setAuthed(true);
        setIsAdmin(true);
      }
      
    } catch (err) {
      if (mounted) {
        dispatch(clearUserinfo());
        setAuthed(false);
        setIsAdmin(false);
      }
    } finally {
      if (mounted) setChecking(false);
    }
  })();
  return () => { mounted = false; };
}, [dispatch]);

  // 1. Still loading/verifying token -> Show the beautiful Skeleton UI
  if (checking) {
    return <AdminSkeleton />;
  }

  // 2. Scenario A: User is completely unauthenticated -> Send to /login
  if (!authed) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 3. Scenario B: User is logged in, but lacks Admin permissions
  if (!isAdmin) {
    // Notify them why they are being booted out
    toast.error('Access denied: Administrator privileges required.');
    
    // Redirect to login (so they can log in with an admin account)
    // Or if you have a public storefront, change this to an external URL (e.g., window.location.href = "https://your-store.com")
    return <Navigate to="/login" replace />;
  }

  // 4. Scenario C: Logged in and Admin -> Render the page
  return children;
};

export default RequireAuth;