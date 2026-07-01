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
  const googleBtnRef = useRef(null);
  
  // Updated: Changed from 4 boxes to 6 boxes empty by default to match backend code
  const [otpBoxes, setOtpBoxes] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

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

    const script = document.createElement('script');
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: "717777690705-pdl02aomsi12r1vnuqalckp5v24de71s.apps.googleusercontent.com",
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
    document.body.appendChild(script);
  }, [navigate]);

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
    <div className="mt-13 mb-5 bg-primary-100 flex flex-col justify-center items-center relative font-sans text-gray-800 selection:bg-red-200">
      {isLoading && <Loader />}

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 max-w-md w-full overflow-hidden flex flex-col transition-all duration-300">
        {/* Header Panel */}
        <div className="bg-[#003147] text-white text-center flex flex-col items-center justify-center pt-10 pb-8 px-6 w-full">
          <h1 className="text-2xl font-bold tracking-tight mb-2 text-white">Welcome Back</h1>
          <p className="text-red-100 text-sm font-medium">Sign in to your account</p>
        </div>

        <div className="flex flex-col items-center w-full my-10 mx-auto max-w-[80%]">
          
          {/* STEP 1: Identification Options */}
          {step === 'methods' && (
            <div className="w-full flex flex-col gap-4 my-2">
              <div className="w-full flex justify-center py-1">
                <div ref={googleBtnRef}></div>
              </div>

              <button 
                type="button"
                onClick={() => setStep('email-input')}
                className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-xl h-12 hover:bg-gray-50 active:scale-[0.99] transition-all font-semibold text-gray-700 text-sm"
              >
                <Mail className="w-5 h-5 text-gray-500 flex-shrink-0" />
                <span>Email Address</span>
              </button>
            </div>
          )}

          {/* STEP 2: Email Destination Input Form */}
          {step === 'email-input' && (
            <form onSubmit={handleSendCode} className="w-full flex flex-col gap-4">
              <button 
                type="button"
                onClick={() => setStep('methods')}
                className="text-secondary hover:text-primary self-start text-xs sm:text-sm flex items-center gap-1.5 font-semibold transition-colors bg-transparent border-0 cursor-pointer"
              >
                <span>← Back</span>
              </button>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-gray-700 font-bold text-xs sm:text-sm">
                  <Mail size={16} className="text-gray-500" />
                  <label>Email Address</label>
                </div>
                
                <input 
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl indent-4 h-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50/50 transition-all placeholder-gray-400"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-primary hover:bg-secondary active:scale-[0.99] text-white font-bold h-12 rounded-xl text-sm transition-all shadow-md shadow-red-900/10 cursor-pointer"
              >
                Send Verification Code
              </button>
            </form>
          )}

          {/* STEP 3: Multi-box Code Block Validation Layout (6 boxes) */}
          {step === 'otp-verify' && (
            <form onSubmit={handleVerifyOtp} className="w-full flex flex-col gap-4">
              <button 
                type="button"
                onClick={() => setStep('email-input')}
                className="text-secondary hover:text-primary self-start text-xs sm:text-sm flex items-center gap-1.5 font-semibold transition-colors bg-transparent border-0 cursor-pointer"
              >
                <span>← Back</span>
              </button>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-gray-800 font-bold text-xs sm:text-sm">
                  <ShieldCheck size={18} className="text-gray-600" />
                  <label>Verification Code</label>
                </div>

                {/* Grid block mapping 6 responsive individual boxes */}
                <div className="flex justify-center gap-1.5 sm:gap-2">
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
                      className="w-10 h-12 sm:w-12 sm:h-12 text-center text-lg font-bold border border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-inner"
                    />
                  ))}
                </div>
              </div>

              <p className="text-gray-400 text-[11px] sm:text-xs text-center mb-2">
                Sent to <span className="font-medium text-gray-600 break-all">{email}</span>
              </p>

              <button 
                type="submit"
                className="w-full bg-primary hover:bg-secondary active:scale-[0.99] text-white font-bold h-12 rounded-xl text-sm transition-all shadow-md shadow-red-900/10 tracking-wide cursor-pointer"
              >
                Verify & Enter
              </button>

              <div className="text-center text-xs text-gray-500 font-medium">
                Didn't receive? <button type="button" onClick={() => handleSendCode(null)} className="text-primary font-bold hover:underline bg-transparent border-0 cursor-pointer">Resend OTP</button>
              </div>
            </form>
          )}

          <div className="w-full h-px bg-gray-100 my-6"></div>
          <p className="text-[11px] sm:text-xs text-center text-gray-400 leading-relaxed max-w-[280px]">
            By continuing, you agree to our{' '}
            <a href="#" className="text-primary hover:underline font-medium">Terms of Service</a> and{' '}
            <a href="#" className="text-primary hover:underline font-medium">Privacy Policy</a>
          </p>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 text-right text-gray-400/50 pointer-events-none select-none text-[13px] leading-tight font-light hidden md:block">
        Activate Windows<br />
        <span className="text-[11px]">Go to Settings to activate Windows.</span>
      </div>
    </div>
  );
}