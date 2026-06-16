import React, { useEffect, useState } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import authApi from '../../config/authApi';
import { setUserinfo, clearUserinfo } from '../../Redux/slice/userSlice';
import toast from 'react-hot-toast';

const RequireAuth = ({ children }) => {
  const dispatch = useDispatch();
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true); // Track if user is an admin
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await authApi.get('/users/me');
        const user = res?.data?.user;
        if (!user) throw new Error('Not authenticated');

        const role = (user.role || '').toString();
        if (role.toLowerCase() !== 'admin') {
          toast.error('Access denied: admin role required');
          if (mounted) {
            dispatch(clearUserinfo());
            setAuthed(true);   // They are authenticated...
            setIsAdmin(false); // ...but they are not an admin
          }
        } else {
          if (mounted) {
            dispatch(setUserinfo(user));
            setAuthed(true);
            setIsAdmin(true);
          }
        }
      } catch (err) {
        const message = err?.response?.data?.error || err?.response?.data?.alert || err?.message || 'Authentication failed';
        toast.error(String(message));
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

  // 1. Still loading/verifying token
  if (checking) return null;

  // 2. Scenario A: User is completely unauthenticated -> Send to /login
  if (!authed) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 3. Scenario B: User is logged in, but lacks Admin permissions -> Send to /
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // 4. Scenario C: Logged in and Admin -> Render the page
  return children;
};

export default RequireAuth;