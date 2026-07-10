import React, { useState, useRef, useEffect } from 'react';
import { Mail, ShieldCheck } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from '../../components/toast';
import { googleLoginAPI, isUserAuthenticated, sendOtpAPI, verifyOtpAPI } from '../../api/userApi';
import { addCartItem } from '../../redux/cartSlice';

// Integrated Loader sub-component
const Loader = () => {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex justify-center items-center z-[9999]">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
        <p className="mt-4 text-primary font-medium text-sm tracking-widest uppercase animate-pulse">Loading...</p>
      </div>
    </div>
  );
};

export default function AuthFlow() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Redirect if already authenticated
  useEffect(() => {
    if (isUserAuthenticated()) {
      navigate('/');
    }
  }, [navigate]);

  // States: 'methods' | 'email-input' | 'otp-verify'
  const [step, setStep] = useState('methods');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const googleBtnRef = useRef(null);
  
  // Updated: Changed from 4 boxes to 6 boxes empty by default to match backend code
  const [otpBoxes, setOtpBoxes] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSuccessfulLogin = async (result) => {
    window.dispatchEvent(new Event('userLoginStateChange'));
    toast.success('Logged in successfully!');

    const from = location.state?.from || '/';
    const checkoutState = location.state?.checkoutState || null;
    const addToCartPayload = location.state?.addToCartPayload || null;
    const directPurchasePayload = location.state?.directPurchasePayload || null;
    const directPurchaseBundlePayload = location.state?.directPurchaseBundlePayload || null;

    if (addToCartPayload) {
      try {
        setIsLoading(true);
        await dispatch(addCartItem(addToCartPayload)).unwrap();
        toast.success(`"${addToCartPayload.title}" added to Cart!`);
        navigate('/cart');
        return;
      } catch (err) {
        console.error('Failed to auto-add item to cart after login:', err);
        toast.error(err || 'Failed to add item to cart');
      } finally {
        setIsLoading(false);
      }
    }

    if (directPurchasePayload) {
      navigate('/checkout', {
        state: {
          directPurchase: true,
          items: [directPurchasePayload]
        }
      });
      return;
    }

    if (directPurchaseBundlePayload) {
      navigate('/checkout', {
        state: {
          directPurchaseBundle: directPurchaseBundlePayload
        }
      });
      return;
    }

    if (!result.data.phone) {
      toast.info('Please complete your profile details.');
      navigate('/complete-profile', {
        state: {
          from,
          checkoutState,
          addToCartPayload,
          directPurchasePayload,
          directPurchaseBundlePayload
        }
      });
    } else {
      navigate(from, { state: checkoutState });
    }
  };

  useEffect(() => {
    const handleCredentialResponse = async (response) => {
      setIsLoading(true);
      try {
        const result = await googleLoginAPI(response.credential);
        if (result && result.success) {
          await handleSuccessfulLogin(result);
        } else {
          toast.error(result.message || 'Google Login failed');
        }
      } catch (err) {
        console.error('Google login error:', err);
        toast.error('An error occurred during Google Login.');
      } finally {
        setIsLoading(false);
      }
    };

    const initializeGoogleSignIn = () => {
      if (window.google?.accounts?.id) {
        // Only initialize once to avoid GSI warning
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "717777690705-pdl02aomsi12r1vnuqalckp5v24de71s.apps.googleusercontent.com",
          callback: handleCredentialResponse
        });
        
        if (googleBtnRef.current) {
          window.google.accounts.id.renderButton(
            googleBtnRef.current,
            { theme: "outline", size: "large", width: 340 }
          );
        }
      }
    };

    // If script is already in document, just initialize
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      const timer = setTimeout(initializeGoogleSignIn, 100);
      return () => clearTimeout(timer);
    }

    const script = document.createElement('script');
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleSignIn;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [step]);

  // Real Integration: Connect to your /send-otp route
  const handleSendCode = async (e) => {
  if (e) e.preventDefault();
  if (!email) {
    toast.error("Please enter an email address");
    return;
  }
  
  setIsLoading(true);
  try {
    const result = await sendOtpAPI(email.toLowerCase());

    if (result.success) {
      toast.success(result.message || 'Verification code sent!');
      setOtpBoxes(['', '', '', '', '', '']);
      setStep('otp-verify');
      setResendTimer(60);
    } else {
      toast.error(result.message || 'Failed to send verification code.');
    }
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || 'Failed to send OTP.');
  } finally {
    setIsLoading(false);
  }
};

  const handleOtpBoxChange = (value, index) => {
    const newOtpBoxes = [...otpBoxes];
    newOtpBoxes[index] = value.slice(-1).replace(/[^0-9]/g, ''); // Numeric inputs only
    setOtpBoxes(newOtpBoxes);

    // Auto-focus next box if a character was added
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otpBoxes[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim().replace(/[^0-9]/g, '');
    
    if (pasteData.length > 0) {
      const newOtpBoxes = [...otpBoxes];
      for (let i = 0; i < 6; i++) {
        if (pasteData[i]) {
          newOtpBoxes[i] = pasteData[i];
        }
      }
      setOtpBoxes(newOtpBoxes);
      const targetFocusIndex = Math.min(pasteData.length - 1, 5);
      inputRefs.current[targetFocusIndex]?.focus();
    }
  };

  // Real Integration: Connect to your /verify-otp route
  const handleVerifyOtp = async (e) => {
  e.preventDefault();
  const finalOtp = otpBoxes.join('');
  if (finalOtp.length < 6) {
    toast.error("Please enter the complete 6-digit verification code");
    return;
  }

  setIsLoading(true);
  try {
    const result = await verifyOtpAPI(email.toLowerCase(), finalOtp);

    if (result.success) {
      await handleSuccessfulLogin(result);
    } else {
      toast.error(result.message || 'Invalid or expired OTP code');
    }
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || 'Verification failed.');
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-[85vh] w-full flex flex-col justify-center items-center py-12 px-4 bg-gradient-to-b from-[#f8fafc] to-[#e2e8f0] relative font-sans text-gray-800">
      {isLoading && <Loader />}

      <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,49,71,0.08)] border border-slate-100 max-w-[420px] w-full overflow-hidden flex flex-col transition-all duration-500 hover:shadow-[0_30px_70px_rgba(0,49,71,0.12)] hover:-translate-y-1">
        {/* Header Panel */}
        <div className="bg-gradient-to-br from-[#001f2e] via-[#003147] to-[#0c4e6e] text-white text-center flex flex-col items-center justify-center pt-12 pb-10 px-6 w-full relative overflow-hidden">
          {/* Ambient Glow Background Pattern */}
          <div className="absolute w-40 h-40 bg-secondary/15 rounded-full -top-10 -right-10 blur-3xl"></div>
          <div className="absolute w-40 h-40 bg-primary/30 rounded-full -bottom-10 -left-10 blur-3xl"></div>
          
          <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 mb-4 shadow-inner relative z-10">
            <ShieldCheck className="w-6 h-6 text-secondary" />
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1.5 relative z-10">Welcome Back</h1>
          <p className="text-slate-300 text-xs sm:text-sm font-medium tracking-wide uppercase relative z-10">Sign in to your account</p>
        </div>

        <div className="flex flex-col items-center w-full px-6 py-10 sm:px-8">
          
          {/* STEP 1: Identification Options */}
          {step === 'methods' && (
            <div className="w-full flex flex-col gap-4 my-2">
              <div className="w-full flex justify-center py-1">
                <div ref={googleBtnRef} className="overflow-hidden rounded-xl border border-slate-200 hover:border-slate-350 transition-colors shadow-2xs"></div>
              </div>

              <div className="relative flex py-2 items-center w-full">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-bold uppercase tracking-wider">or</span>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>

              <button 
                type="button"
                onClick={() => setStep('email-input')}
                className="w-full flex items-center justify-center gap-3 border border-slate-200 hover:border-secondary/40 bg-slate-50/50 hover:bg-white rounded-2xl h-13 active:scale-[0.99] transition-all duration-300 font-bold text-gray-700 text-sm shadow-2xs hover:shadow-xs cursor-pointer"
              >
                <Mail className="w-5 h-5 text-gray-500 flex-shrink-0" />
                <span>Continue with Email OTP</span>
              </button>
            </div>
          )}

          {/* STEP 2: Email Destination Input Form */}
          {step === 'email-input' && (
            <form onSubmit={handleSendCode} className="w-full flex flex-col gap-5">
              <button 
                type="button"
                onClick={() => setStep('methods')}
                className="text-slate-400 hover:text-primary self-start text-xs sm:text-sm flex items-center gap-1.5 font-bold transition-colors bg-transparent border-0 cursor-pointer mb-2"
              >
                <span>← Back to options</span>
              </button>

              <div className="flex flex-col gap-2.5">
                <label className="text-xs font-extrabold uppercase text-gray-500 tracking-wider">Email Address</label>
                
                <div className="relative flex items-center">
                  <Mail className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
                  <input 
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-slate-200 rounded-2xl pl-12 pr-4 h-13 text-sm focus:outline-none focus:ring-4 focus:ring-secondary/10 focus:border-secondary bg-slate-50/40 focus:bg-white transition-all placeholder-slate-400 font-semibold"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-primary hover:bg-[#004260] active:scale-[0.99] text-white font-bold h-13 rounded-2xl text-sm transition-all shadow-md shadow-primary/10 hover:shadow-lg cursor-pointer mt-2"
              >
                Send Verification Code
              </button>
            </form>
          )}

          {/* STEP 3: Multi-box Code Block Validation Layout (6 boxes) */}
          {step === 'otp-verify' && (
            <form onSubmit={handleVerifyOtp} className="w-full flex flex-col gap-5">
              <button 
                type="button"
                onClick={() => setStep('email-input')}
                className="text-slate-400 hover:text-primary self-start text-xs sm:text-sm flex items-center gap-1.5 font-bold transition-colors bg-transparent border-0 cursor-pointer mb-2"
              >
                <span>← Back to email</span>
              </button>

              <div className="flex flex-col gap-3">
                <label className="text-xs font-extrabold uppercase text-gray-500 tracking-wider text-center">Enter Verification Code</label>
                
                {/* Grid block mapping 6 responsive individual boxes */}
                <div className="flex justify-center gap-2 sm:gap-3 my-2">
                  {otpBoxes.map((boxValue, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (inputRefs.current[idx] = el)}
                      type="text"
                      maxLength={1}
                      value={boxValue}
                      onChange={(e) => handleOtpBoxChange(e.target.value, idx)}
                      onKeyDown={(e) => handleKeyDown(e, idx)}
                      onPaste={handlePaste}
                      className="w-10 h-13 sm:w-12 sm:h-14 text-center text-xl font-black border border-slate-200 bg-slate-50/50 focus:bg-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-secondary/10 focus:border-secondary transition-all shadow-inner text-primary"
                    />
                  ))}
                </div>
              </div>

              <p className="text-slate-400 text-xs text-center leading-normal mb-1">
                We sent a 6-digit code to <br />
                <span className="font-bold text-gray-700 break-all">{email}</span>
              </p>

              {resendTimer > 0 && (
                <p className="text-amber-600 text-xs text-center font-bold">
                  Code expires in {resendTimer}s
                </p>
              )}

              <button 
                type="submit"
                className="w-full bg-primary hover:bg-[#004260] active:scale-[0.99] text-white font-bold h-13 rounded-2xl text-sm transition-all shadow-md shadow-primary/10 hover:shadow-lg tracking-wide cursor-pointer"
              >
                Verify & Sign In
              </button>

              <div className="text-center text-xs text-gray-500 font-semibold mt-1">
                Didn't receive code?{' '}
                {resendTimer > 0 ? (
                  <span className="text-slate-400 font-bold">Resend OTP in {resendTimer}s</span>
                ) : (
                  <button 
                    type="button" 
                    onClick={() => handleSendCode(null)} 
                    className="text-secondary font-bold hover:underline bg-transparent border-0 cursor-pointer"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </form>
          )}

          <div className="w-full h-px bg-slate-100 my-6"></div>
          <p className="text-[11px] sm:text-xs text-center text-slate-400 leading-relaxed max-w-[280px]">
            By continuing, you agree to our{' '}
            <a href="#" className="text-primary hover:underline font-bold">Terms of Service</a> and{' '}
            <a href="#" className="text-primary hover:underline font-bold">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}