import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import authApi, { persistAdminSession } from '../config/authApi'; // 🔥 Imported persistAdminSession
import { setUserinfo } from '../Redux/slice/userSlice';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import toast from 'react-hot-toast';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { executeRecaptcha } = useGoogleReCaptcha();

  // Core State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); 
  const [preAuthToken, setPreAuthToken] = useState(''); 
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('credentials'); // 'credentials' or 'verify'
  const [timeLeft, setTimeLeft] = useState(0);

  // UI State
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [info, setInfo] = useState('');

  const from = location.state?.from?.pathname || '/';

  // Timer Logic
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Request Credentials & Send OTP
  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    if (!executeRecaptcha) {
      setError("Security system initializing. Please wait...");
      return;
    }

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);
    setError('');
    setInfo('');
    setLoading(true);

    const loadingToast = toast.loading("Verifying admin credentials...");

    try {
      let currentPreAuthToken = '';

      // STEP 1: Verify Password
      const credentialToken = await executeRecaptcha('verify_admin_credentials');
      const verifyRes = await authApi.post('/users/verify-credentials', {
        email: email.trim().toLowerCase(),
        password: password,
        adminLogin: true, 
        recaptchaToken: credentialToken
      });

      // Explicitly check for business-logic failure
      if (!verifyRes.data || verifyRes.data.success === false) {
        throw new Error(verifyRes.data?.error || "Invalid credentials.");
      }

      currentPreAuthToken = verifyRes.data.preAuthToken;
      setPreAuthToken(currentPreAuthToken);
      toast.loading("Credentials verified! Sending OTP...", { id: loadingToast });

      // STEP 2: Send OTP
      const otpToken = await executeRecaptcha('admin_send_otp');
      const sendRes = await authApi.post('/users/email/send-otp', {
        email: email.trim().toLowerCase(),
        preAuthToken: currentPreAuthToken,
        mode: 'login',
        adminLogin: true,
        recaptchaToken: otpToken,
      });

      // Ensure OTP actually sent before advancing UI
      if (!sendRes.data || sendRes.data.success === false) {
        throw new Error(sendRes.data?.error || "Failed to send OTP.");
      }

      toast.success(sendRes.data.message || 'OTP sent!', { id: loadingToast });
      setInfo('A secure one-time code has been sent to your email.');
      setStep('verify');
      setTimeLeft(60);

    } catch (err) {
      const errorMsg = err?.response?.data?.error || err.message || 'Authentication failed';
      toast.error(errorMsg, { id: loadingToast });
      setError(errorMsg);
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  // Resend OTP using existing preAuthToken
  const handleResendOtp = async () => {
    if (timeLeft > 0 || loading) return;
    if (!executeRecaptcha) {
        setError('Security context unavailable. Please refresh browser.');
        return;
    }

    setLoading(true);
    setError('');
    const resendToast = toast.loading("Requesting new OTP...");

    try {
      const token = await executeRecaptcha('resend_admin_otp');
      const res = await authApi.post('/users/email/send-otp', {
        email: email.trim().toLowerCase(),
        preAuthToken: preAuthToken,
        mode: 'login',
        adminLogin: true,
        recaptchaToken: token,
      });

      // Catch failed resend attempts
      if (!res.data || res.data.success === false) {
        throw new Error(res.data?.error || "Failed to resend OTP.");
      }

      toast.success('New OTP sent!', { id: resendToast });
      setInfo('A fresh one-time code has been sent to your email.');
      setTimeLeft(60);

    } catch (err) {
      const errorMsg = err?.response?.data?.error || err.message || 'Failed to resend OTP';
      toast.error(errorMsg, { id: resendToast });
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP & Login
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
        setError("Please enter a valid 6-digit OTP.");
        return;
    }

    setError('');
    setInfo('');
    setLoading(true);
    const verifyToast = toast.loading("Verifying OTP...");

    try {
      const res = await authApi.post('/users/email/verify-otp', {
        email: email.trim().toLowerCase(),
        otp,
        mode: 'login',
        adminLogin: true,
      });

      // Ensure the API actually returned a success state and user object
      if (!res.data || res.data.success === false || !res.data.user) {
        throw new Error(res.data?.error || 'Verification failed');
      }

      const { user, sessionToken } = res.data;
      
      // 🔥 CRITICAL MOBILE FIX: Save token to local storage so Safari doesn't loop you out
      if (sessionToken) {
          persistAdminSession(sessionToken, user.id || user._id);
      }

      dispatch(setUserinfo(user));
      toast.success('Admin Login successful', { id: verifyToast });
      navigate(from, { replace: true });

    } catch (err) {
      const errorMsg = err?.response?.data?.error || err.message || 'Verification failed';
      toast.error(errorMsg, { id: verifyToast });
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={step === 'credentials' ? handleCredentialsSubmit : handleVerifyOtp} className="w-full max-w-md bg-white p-8 rounded shadow">
        <h2 className="text-xl font-bold mb-6 text-gray-800">Admin Security Portal</h2>
        
        {/* --- DEDICATED ERROR UI ALERT --- */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* --- DEDICATED INFO UI ALERT --- */}
        {info && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700 font-medium">{info}</p>
              </div>
            </div>
          </div>
        )}

        <label className="block mb-2 text-sm font-medium text-gray-700">Admin Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError('');
          }}
          className="w-full mb-4 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:text-gray-500 transition-all"
          required
          disabled={step === 'verify' || loading}
          placeholder="admin@example.com"
        />

        {step === 'credentials' && (
          <>
            <label className="block mb-2 text-sm font-medium text-gray-700">Admin Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              className="w-full mb-6 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:text-gray-500 transition-all"
              required
              disabled={loading}
              placeholder="••••••••"
            />
          </>
        )}

        {step === 'verify' && (
          <>
            <label className="block mb-2 text-sm font-medium text-gray-700">One-Time Passcode</label>
            <input
              type="text"
              maxLength="6"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, ''));
                if (error) setError('');
              }}
              className="w-full mb-6 p-3 border border-gray-300 rounded text-center tracking-[0.5em] font-bold text-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none disabled:bg-gray-100 transition-all"
              required
              disabled={loading}
              placeholder="000000"
            />
          </>
        )}

        <button 
          type="submit" 
          disabled={loading || isSubmitting} 
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold uppercase tracking-wider text-sm transition-colors disabled:bg-gray-400 active:scale-[0.98]"
        >
          {loading ? 'Processing...' : step === 'credentials' ? 'Login' : 'Verify & Access'}
        </button>

        {step === 'verify' && (
          <div className="mt-6 flex flex-col gap-3">
            {timeLeft > 0 ? (
              <p className="text-center text-sm font-medium text-gray-500 bg-gray-50 py-2 rounded">
                Resend code in {timeLeft}s
              </p>
            ) : (
              <button 
                type="button" 
                onClick={handleResendOtp} 
                className="text-sm font-bold text-emerald-600 hover:text-emerald-700 hover:underline py-2 bg-emerald-50 rounded transition-colors"
              >
                Resend OTP
              </button>
            )}
            <button
              type="button"
              onClick={() => { 
                setStep('credentials'); 
                setOtp(''); 
                setError(''); 
                setInfo('');
                setPreAuthToken(''); 
                setPassword(''); 
              }}
              disabled={loading}
              className="w-full py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded text-sm font-medium transition-colors"
            >
              Back to Credentials
            </button>
          </div>
        )}

        <a href="https://haryanaroyalty.netlify.app" target="_self" className="block mt-8 text-center text-sm font-bold text-gray-400 hover:text-gray-800 transition-colors">
          Return to <span className="text-emerald-600 hover:underline">Haryana Royalty</span>
        </a>
      </form>
    </div>
  );
};

export default Login;