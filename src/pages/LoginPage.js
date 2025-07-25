import React, { useState, useRef, useEffect } from 'react';
import { auth } from '../firebase.js'; // Assuming '../firebase.js' correctly exports your 'auth' instance
import { db } from '../firebase.js'; // Assuming '../firebase.js' also exports your 'db' (Firestore) instance
import { signInWithPhoneNumber, RecaptchaVerifier, onAuthStateChanged } from 'firebase/auth'; // Added onAuthStateChanged
import { doc, getDoc, setDoc } from 'firebase/firestore'; // Firestore functions
import { useNavigate } from 'react-router-dom'; // For navigation

export default function LoginPage() {
    const navigate = useNavigate(); // Initialize navigate hook

    const [activeTab, setActiveTab] = useState('login');

    // Login states
    const [loginPhone, setLoginPhone] = useState('');
    const [loginCountry, setLoginCountry] = useState('+91');
    const [loginOtpVisible, setLoginOtpVisible] = useState(false);
    const [loginOtp, setLoginOtp] = useState(Array(6).fill(''));
    const [loginPhoneDisplay, setLoginPhoneDisplay] = useState('');
    const [loginConfirmationResult, setLoginConfirmationResult] = useState(null);

    // Signup states
    const [signupName, setSignupName] = useState('');
    const [signupPhone, setSignupPhone] = useState('');
    const [signupCountry, setSignupCountry] = useState('+91');
    const [signupOtpVisible, setSignupOtpVisible] = useState(false);
    const [signupOtp, setSignupOtp] = useState(Array(6).fill(''));
    const [signupPhoneDisplay, setSignupPhoneDisplay] = useState('');
    const [signupConfirmationResult, setSignupConfirmationResult] = useState(null);

    // Recaptcha verifier ref
    const recaptchaVerifier = useRef(null);

    // Refs for OTP inputs (for cursor navigation)
    const loginOtpRefs = useRef([]);
    const signupOtpRefs = useRef([]);

    // --- Recaptcha Setup ---
    const setupRecaptcha = () => {
        // Ensure reCAPTCHA is not already initialized and auth is available
        if (!recaptchaVerifier.current && auth) {
            recaptchaVerifier.current = new RecaptchaVerifier(
                auth,
                'recaptcha-container',
                {
                    size: 'invisible',
                    callback: (response) => {
                        console.log('reCAPTCHA solved:', response);
                        // reCAPTCHA is solved, you can now proceed with sending OTP
                    },
                    'expired-callback': () => {
                        console.log('reCAPTCHA expired');
                        // Handle expiration, e.g., re-render reCAPTCHA
                        if (recaptchaVerifier.current) {
                            recaptchaVerifier.current.clear(); // Clear existing reCAPTCHA
                        }
                        setupRecaptcha(); // Attempt to re-initialize
                    }
                }
            );
            // Render reCAPTCHA and get widget ID (for debugging/console clarity)
            recaptchaVerifier.current.render().then(widgetId => {
                console.log('reCAPTCHA rendered with widget ID:', widgetId);
            });
        }
    };

    // --- Effect Hook for Initial Setup and Authentication State Persistence ---
    useEffect(() => {
        // 1. Setup reCAPTCHA when the component mounts
        setupRecaptcha();

        // 2. Persistent Authentication: Listen for Firebase Auth state changes
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // User is signed in. Check their profile completeness in Firestore.
                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists() && userDocSnap.data()?.name) {
                    // User data exists AND has a 'name' field, navigate to home
                    console.log("User already signed in and profile complete. Navigating to /home.");
                    navigate('/home');
                } else {
                    // User is signed in but profile is incomplete (no 'name' field or doc doesn't exist yet)
                    console.log("User authenticated but profile incomplete. Prompting for name.");
                    // Pre-fill signup phone and switch to signup tab
                    setSignupPhone(user.phoneNumber ? user.phoneNumber.substring(signupCountry.length) : '');
                    setSignupName(''); // Ensure name field is clear for new input
                    setSignupOtpVisible(false); // Ensure OTP section is hidden for name entry
                    setActiveTab('signup'); // Switch to the signup tab
                    alert('Welcome! Please complete your profile by entering your name.');
                }
            } else {
                // User is signed out. Stay on the login page.
                console.log("User is signed out.");
            }
        });

        // Cleanup function for useEffect
        return () => {
            // Clear reCAPTCHA when component unmounts
            if (recaptchaVerifier.current && recaptchaVerifier.current.clear) {
                recaptchaVerifier.current.clear();
            }
            // Unsubscribe from the auth state listener
            unsubscribe();
        };
    }, []); // Empty dependency array ensures this runs only once on mount

    // --- Tab Handling ---
    const handleTabClick = (tab) => setActiveTab(tab);

    // --- OTP Input Handling with Cursor Movement ---
    const handleOtpInput = (index, event, otpState, setOtpState, otpRefs) => {
        const { value } = event.target;

        // Only allow single digit input
        if (/^\d?$/.test(value)) {
            const newOtp = [...otpState];
            newOtp[index] = value;
            setOtpState(newOtp);

            // Move focus to the next input if a digit is entered and it's not the last input
            if (value && index < otpRefs.current.length - 1) {
                otpRefs.current[index + 1]?.focus();
            }
        }
    };

    // --- OTP Backspace Key Handling ---
    const handleOtpKeyDown = (index, event, otpState, setOtpState, otpRefs) => {
        if (event.key === 'Backspace') {
            if (otpState[index] === '' && index > 0) {
                // If backspace is pressed and current input is empty, move to previous input and clear it
                otpRefs.current[index - 1]?.focus();
                const newOtp = [...otpState];
                newOtp[index - 1] = '';
                setOtpState(newOtp);
            } else if (otpState[index] !== '') {
                // If backspace is pressed and current input has a value, just clear current input
                const newOtp = [...otpState];
                newOtp[index] = '';
                setOtpState(newOtp);
            }
            event.preventDefault(); // Prevent default backspace behavior (e.g., navigating back in browser)
        } else if (event.key === 'ArrowLeft' && index > 0) {
            otpRefs.current[index - 1]?.focus();
        } else if (event.key === 'ArrowRight' && index < otpRefs.current.length - 1) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    // --- Login Submit Handler ---
    const handleLoginSubmit = async (e) => {
        e.preventDefault();

        if (!loginOtpVisible) {
            // Step 1: Send OTP for Login
            try {
                if (!recaptchaVerifier.current) {
                    console.error("reCAPTCHA verifier not initialized. Attempting to re-initialize.");
                    setupRecaptcha(); // Try to set it up again
                    alert("Security check failed. Please refresh the page or try again.");
                    return;
                }

                const phoneNumber = `${loginCountry}${loginPhone}`;
                // Get the current reCAPTCHA instance
                const appVerifier = recaptchaVerifier.current;
                const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);

                setLoginConfirmationResult(result);
                setLoginPhoneDisplay(phoneNumber);
                setLoginOtpVisible(true);
                alert('OTP sent successfully! Please enter the OTP.');

                // Reset reCAPTCHA for potential future sends
                if (recaptchaVerifier.current) {
                    recaptchaVerifier.current.clear();
                    setupRecaptcha();
                }

            } catch (error) {
                console.error("Error sending OTP for login:", error);
                alert(`Error sending OTP: ${error.message}. Please check your phone number and try again.`);
                // Clear and re-setup reCAPTCHA on error
                if (recaptchaVerifier.current) {
                    recaptchaVerifier.current.clear();
                }
                setupRecaptcha();
            }
        } else {
            // Step 2: Verify OTP for Login and handle user profile
            try {
                const enteredOtp = loginOtp.join('');
                if (!loginConfirmationResult) {
                    alert('OTP confirmation data is missing. Please resend OTP.');
                    return;
                }
                const userCredential = await loginConfirmationResult.confirm(enteredOtp);
                const user = userCredential.user;

                // Check if user exists in Firestore 'users' collection and has a name
                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists() && userDocSnap.data()?.name) {
                    // User exists in Firestore and has a name, navigate to /home
                    alert('✅ Login successful!');
                    console.log('User data from Firestore:', userDocSnap.data());
                    navigate('/home'); // Navigates to /home
                } else {
                    // User does NOT exist in Firestore, or name is missing. Prompt for name.
                    alert('✅ Login successful! Please complete your profile.');
                    // Pre-fill signup form details and switch tab
                    setSignupPhone(user.phoneNumber ? user.phoneNumber.substring(signupCountry.length) : '');
                    setSignupName(''); // Clear name input for new entry
                    setSignupOtpVisible(false); // Hide OTP fields when asking for name
                    setActiveTab('signup'); // Switch to the signup tab
                }

            } catch (error) {
                console.error("Error verifying OTP for login:", error);
                alert('Invalid OTP. Please try again or resend OTP.');
                // Optionally clear OTP inputs on invalid OTP
                setLoginOtp(Array(6).fill(''));
                loginOtpRefs.current[0]?.focus(); // Focus first input
            }
        }
    };

    // --- Login Resend OTP Handler ---
    const handleLoginResend = () => {
        // Reset login OTP related states to allow a new send
        setLoginOtpVisible(false);
        setLoginOtp(Array(6).fill(''));
        setLoginConfirmationResult(null); // Crucial to allow a new OTP flow

        // Clear and re-setup reCAPTCHA to get a new one
        if (recaptchaVerifier.current) {
            recaptchaVerifier.current.clear();
        }
        setupRecaptcha();
        alert('Please re-enter your phone number and click "Send OTP" again.');
    };

    // --- Signup Submit Handler ---
    const handleSignupSubmit = async (e) => {
        e.preventDefault();

        if (!signupOtpVisible) {
            // Step 1: Send OTP for Signup
            try {
                if (!recaptchaVerifier.current) {
                    console.error("reCAPTCHA verifier not initialized. Attempting to re-initialize.");
                    setupRecaptcha();
                    alert("Security check failed. Please refresh the page or try again.");
                    return;
                }

                const phoneNumber = `${signupCountry}${signupPhone}`;
                const appVerifier = recaptchaVerifier.current;
                const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);

                setSignupConfirmationResult(result);
                setSignupPhoneDisplay(phoneNumber);
                setSignupOtpVisible(true);
                alert('OTP sent successfully! Please enter the OTP.');

                // Reset reCAPTCHA for potential future sends
                if (recaptchaVerifier.current) {
                    recaptchaVerifier.current.clear();
                    setupRecaptcha();
                }

            } catch (error) {
                console.error("Error sending OTP for signup:", error);
                alert(`Error sending OTP: ${error.message}. Please check your phone number and try again.`);
                // Clear and re-setup reCAPTCHA on error
                if (recaptchaVerifier.current) {
                    recaptchaVerifier.current.clear();
                }
                setupRecaptcha();
            }
        } else {
            // Step 2: Verify OTP for Signup, store user data, and navigate to /home
            try {
                const enteredOtp = signupOtp.join('');
                if (!signupConfirmationResult) {
                    alert('OTP confirmation data is missing. Please resend OTP.');
                    return;
                }
                const userCredential = await signupConfirmationResult.confirm(enteredOtp);
                const user = userCredential.user;

                // Store user data (name and phone number) in Firestore
                const userDocRef = doc(db, 'users', user.uid);
                await setDoc(userDocRef, {
                    name: signupName,
                    phoneNumber: user.phoneNumber, // Firebase auth provides this after verification
                    createdAt: new Date(),
                }, { merge: true }); // Use merge: true to avoid overwriting if doc exists

                alert('✅ Signup successful! Welcome to ChefVoice.');
                console.log('User UID:', user.uid);
                console.log('ID Token:', await user.getIdToken());

                // Navigate to /home after successful signup and data storage
                navigate('/home'); // Navigates to /home

            } catch (error) {
                console.error("Error verifying OTP for signup:", error);
                alert('Invalid OTP. Please try again or resend OTP.');
                // Optionally clear OTP inputs on invalid OTP
                setSignupOtp(Array(6).fill(''));
                signupOtpRefs.current[0]?.focus(); // Focus first input
            }
        }
    };

    // --- Signup Resend OTP Handler ---
    const handleSignupResend = () => {
        // Reset signup OTP related states to allow a new send
        setSignupOtpVisible(false);
        setSignupOtp(Array(6).fill(''));
        setSignupConfirmationResult(null); // Crucial to allow a new OTP flow

        // Clear and re-setup reCAPTCHA to get a new one
        if (recaptchaVerifier.current) {
            recaptchaVerifier.current.clear();
        }
        setupRecaptcha();
        alert('Please re-enter your phone number and click "Send OTP" again.');
    };

    return (
        <div className="page active" id="auth">
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <h1>ChefVoice</h1>
                        <p>Your voice-controlled cooking companion</p>
                    </div>

                    <div className="auth-tabs">
                        <div
                            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
                            onClick={() => handleTabClick('login')}
                        >
                            Login
                        </div>
                        <div
                            className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
                            onClick={() => handleTabClick('signup')}
                        >
                            Sign Up
                        </div>
                    </div>

                    {/* Login Form */}
                    {activeTab === 'login' && (
                        <form id="login-form" className="auth-form" onSubmit={handleLoginSubmit}>
                            <div className="form-group">
                                <label htmlFor="login-phone">Phone Number</label>
                                <div className="phone-input-group">
                                    <select
                                        className="country-code"
                                        value={loginCountry}
                                        onChange={(e) => setLoginCountry(e.target.value)}
                                    >
                                        {['+91', '+1', '+44', '+61'].map((code) => (
                                            <option key={code} value={code}>
                                                {`${code} (${code === '+91' ? 'India' : code === '+1' ? 'US' : code === '+44' ? 'UK' : 'AU'})`}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="tel"
                                        className="form-input phone-input"
                                        placeholder="Enter your phone number"
                                        required
                                        value={loginPhone}
                                        onChange={(e) => setLoginPhone(e.target.value)}
                                        // Disable input if OTP is visible to prevent changing phone number
                                        disabled={loginOtpVisible}
                                    />
                                </div>
                            </div>

                            {loginOtpVisible && (
                                <div className="form-group">
                                    <label>Enter OTP</label>
                                    <div className="otp-input-container">
                                        {loginOtp.map((digit, i) => (
                                            <input
                                                key={`login-otp-${i}`}
                                                type="text"
                                                inputMode="numeric" // Helps with mobile keyboards
                                                maxLength="1"
                                                className="otp-input"
                                                value={digit}
                                                onChange={(e) => handleOtpInput(i, e, loginOtp, setLoginOtp, loginOtpRefs)}
                                                onKeyDown={(e) => handleOtpKeyDown(i, e, loginOtp, setLoginOtp, loginOtpRefs)}
                                                ref={el => loginOtpRefs.current[i] = el}
                                                // Auto-focus the first OTP input when it becomes visible
                                                autoFocus={i === 0}
                                            />
                                        ))}
                                    </div>
                                    <div className="otp-info">
                                        <p>OTP sent to <span>{loginPhoneDisplay}</span></p>
                                        <button type="button" className="resend-otp" onClick={handleLoginResend}>
                                            Resend OTP
                                        </button>
                                    </div>
                                </div>
                            )}

                            <button type="submit" className="btn btn-primary btn-large" style={{ width: '100%' }}>
                                {loginOtpVisible ? 'Verify OTP' : 'Send OTP'}
                            </button>
                        </form>
                    )}

                    {/* Signup Form */}
                    {activeTab === 'signup' && (
                        <form id="signup-form" className="auth-form" onSubmit={handleSignupSubmit}>
                            <div className="form-group">
                                <label htmlFor="signup-name">Full Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter your full name"
                                    required
                                    value={signupName}
                                    onChange={(e) => setSignupName(e.target.value)}
                                    // Disable name input if OTP is visible, unless user is completing profile
                                    disabled={signupOtpVisible}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="signup-phone">Phone Number</label>
                                <div className="phone-input-group">
                                    <select
                                        className="country-code"
                                        value={signupCountry}
                                        onChange={(e) => setSignupCountry(e.target.value)}
                                    >
                                        {['+91', '+1', '+44', '+61'].map((code) => (
                                            <option key={code} value={code}>
                                                {`${code} (${code === '+91' ? 'India' : code === '+1' ? 'US' : code === '+44' ? 'UK' : 'AU'})`}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="tel"
                                        className="form-input phone-input"
                                        placeholder="Enter your phone number"
                                        required
                                        value={signupPhone}
                                        onChange={(e) => setSignupPhone(e.target.value)}
                                        // Disable input if OTP is visible to prevent changing phone number
                                        disabled={signupOtpVisible}
                                    />
                                </div>
                            </div>

                            {signupOtpVisible && (
                                <div className="form-group">
                                    <label>Enter OTP</label>
                                    <div className="otp-input-container">
                                        {signupOtp.map((digit, i) => (
                                            <input
                                                key={`signup-otp-${i}`}
                                                type="text"
                                                inputMode="numeric" // Helps with mobile keyboards
                                                maxLength="1"
                                                className="otp-input"
                                                value={digit}
                                                onChange={(e) => handleOtpInput(i, e, signupOtp, setSignupOtp, signupOtpRefs)}
                                                onKeyDown={(e) => handleOtpKeyDown(i, e, signupOtp, setSignupOtp, signupOtpRefs)}
                                                ref={el => signupOtpRefs.current[i] = el}
                                                // Auto-focus the first OTP input when it becomes visible
                                                autoFocus={i === 0}
                                            />
                                        ))}
                                    </div>
                                    <div className="otp-info">
                                        <p>OTP sent to <span>{signupPhoneDisplay}</span></p>
                                        <button type="button" className="resend-otp" onClick={handleSignupResend}>
                                            Resend OTP
                                        </button>
                                    </div>
                                </div>
                            )}

                            <button type="submit" className="btn btn-primary btn-large" style={{ width: '100%' }}>
                                {signupOtpVisible ? 'Verify OTP' : 'Send OTP'}
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {/* reCAPTCHA container must be present in your HTML */}
            <div id="recaptcha-container"></div>
        </div>
    );
}