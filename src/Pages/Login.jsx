import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import authApi from '../config/authApi';
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
  const [password, setPassword] = useState(''); // NEW: Added password state
  const [preAuthToken, setPreAuthToken] = useState(''); // NEW: Store the temporary token
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
      toast.error("Security system initializing. Please wait...");
      return;
    }

    if (!email || !password) {
      return toast.error("Please enter both email and password.");
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

      if (verifyRes.data.success) {
        currentPreAuthToken = verifyRes.data.preAuthToken;
        setPreAuthToken(currentPreAuthToken);
        toast.loading("Credentials verified! Sending OTP...", { id: loadingToast });
      }

      // STEP 2: Send OTP
      const otpToken = await executeRecaptcha('admin_send_otp');
      const sendRes = await authApi.post('/users/email/send-otp', {
        email: email.trim().toLowerCase(),
        preAuthToken: currentPreAuthToken,
        mode: 'login',
        adminLogin: true,
        recaptchaToken: otpToken,
      });

      if (sendRes?.data?.success) {
        toast.success(sendRes.data.message || 'OTP sent!', { id: loadingToast });
        setInfo('A one-time code has been sent to your email.');
        setStep('verify');
        setTimeLeft(60);
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.error || 'Authentication failed';
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
    if (!executeRecaptcha) return toast.error('Security context unavailable. Please refresh browser.');

    setLoading(true);
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

      if (res?.data?.success) {
        toast.success('New OTP sent!', { id: resendToast });
        setTimeLeft(60);
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.error || 'Failed to resend OTP';
      toast.error(errorMsg, { id: resendToast });
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP & Login
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
        return toast.error("Please enter a valid 6-digit OTP.");
    }

    setError('');
    setLoading(true);
    const verifyToast = toast.loading("Verifying OTP...");

    try {
      const res = await authApi.post('/users/email/verify-otp', {
        email: email.trim().toLowerCase(),
        otp,
        mode: 'login',
        adminLogin: true,
      });

      if (res?.data?.user) {
        const { user } = res.data;
        dispatch(setUserinfo(user));
        toast.success('Admin Login successful', { id: verifyToast });
        navigate(from, { replace: true });
      } else {
        throw new Error(res?.data?.error || 'Verification failed');
      }
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
        <h2 className="text-xl font-bold mb-4">Admin Security Portal</h2>
        
        {error && <p className="text-red-500 mb-4 text-sm font-semibold">{error}</p>}
        {info && <p className="text-stone-600 mb-4 text-sm font-semibold">{info}</p>}

        <label className="block mb-2 text-sm font-medium text-gray-700">Admin Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
              onChange={(e) => setPassword(e.target.value)}
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
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
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