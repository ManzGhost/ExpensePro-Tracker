import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useExpenses } from '../context/ExpenseContext';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  X,
  KeyRound,
  TrendingUp,
  User,
  UserPlus,
  LogIn,
  Check,
} from 'lucide-react';

interface LoginPageProps {
  initialMode?: 'login' | 'register';
}

export function LoginPage({ initialMode = 'login' }: LoginPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isAuthenticated, requestPasswordReset } = useAuth();
  const { addToast } = useExpenses();

  const [mode, setMode] = useState<'login' | 'register'>(
    location.pathname === '/register' || initialMode === 'register' ? 'register' : 'login'
  );

  // Sync mode whenever URL path changes (e.g. from navbar clicks)
  useEffect(() => {
    if (location.pathname === '/register') {
      setMode('register');
      setFormErrors({});
    } else if (location.pathname === '/login') {
      setMode('login');
      setFormErrors({});
    }
  }, [location.pathname, initialMode]);

  // Common fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register-specific fields
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
    general?: string;
  }>({});

  // Forgot password modal state
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<{ loading: boolean; success?: boolean; message?: string }>({
    loading: false,
  });

  // Where to redirect after login (default is `/`)
  const fromLocation = (location.state as any)?.from?.pathname || '/';

  // If already authenticated, redirect immediately
  if (isAuthenticated) {
    return <Navigate to={fromLocation} replace />;
  }

  // Calculate password strength score (0 to 4)
  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const passwordStrength = calculatePasswordStrength(password);
  const strengthLabels = ['Too Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-rose-500', 'bg-rose-400', 'bg-amber-500', 'bg-indigo-400', 'bg-emerald-500'];

  const validateForm = () => {
    const errors: typeof formErrors = {};
    const trimmedEmail = email.trim();

    if (mode === 'register') {
      const trimmedName = fullName.trim();
      if (!trimmedName) {
        errors.name = 'Please enter your full name.';
      } else if (trimmedName.length < 2) {
        errors.name = 'Full name must be at least 2 characters.';
      }
    }

    if (!trimmedEmail) {
      errors.email = 'Email address is required.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        errors.email = 'Please enter a valid email address (e.g. name@example.com).';
      }
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    if (mode === 'register') {
      if (!confirmPassword) {
        errors.confirmPassword = 'Please confirm your password.';
      } else if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match.';
      }

      if (!agreeTerms) {
        errors.terms = 'You must agree to continue.';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        const result = await login(email, password, rememberMe);
        if (result.success) {
          addToast({
            type: 'success',
            title: 'Welcome Back!',
            description: 'Successfully authenticated. Accessing your financial workspace.',
          });
          navigate(fromLocation, { replace: true });
        } else {
          setFormErrors({ general: result.error || 'Authentication failed. Please try again.' });
        }
      } else {
        // Register Mode
        const result = await register(fullName, email, password, rememberMe);
        if (result.success) {
          addToast({
            type: 'success',
            title: 'Account Created!',
            description: `Welcome to ExpenseFlow, ${fullName.trim()}! Your account is ready.`,
          });
          navigate(fromLocation, { replace: true });
        } else {
          setFormErrors({ general: result.error || 'Registration failed. Please try again.' });
        }
      }
    } catch (err) {
      setFormErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemoAccount = () => {
    setMode('login');
    setEmail('david@expenseflow.com');
    setPassword('finance2026');
    setFormErrors({});
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetStatus({ loading: true });

    const result = await requestPasswordReset(resetEmail || email);
    setResetStatus({
      loading: false,
      success: result.success,
      message: result.message,
    });

    if (result.success) {
      addToast({
        type: 'info',
        title: 'Recovery Email Sent',
        description: result.message,
      });
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8 px-4 sm:px-6" id="login-page-view">
      <div className="w-full max-w-md space-y-6">
        {/* Top App Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-600/30 text-white mb-2">
            <TrendingUp size={28} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {mode === 'login' ? 'Welcome to ExpenseFlow' : 'Create Your Account'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            {mode === 'login'
              ? 'Sign in to access your dashboard, budget analytics, and expense history.'
              : 'Join ExpenseFlow to start tracking spending, setting budgets, and visualizing habits.'}
          </p>
        </div>

        {/* Demo Credentials Quick Pill (shown in login mode) */}
        {mode === 'login' && (
          <div className="bg-[#141414] border border-[#262626] rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-gray-300">
              <Sparkles size={16} className="text-amber-400 shrink-0" />
              <span className="text-gray-400">
                Testing? Use <strong className="text-gray-200">david@expenseflow.com</strong>
              </span>
            </div>
            <button
              type="button"
              id="fill-demo-credentials-btn"
              onClick={handleFillDemoAccount}
              className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-indigo-200 border border-indigo-500/30 font-semibold text-[11px] transition-colors shrink-0 cursor-pointer"
            >
              Auto-fill
            </button>
          </div>
        )}

        {/* Main Auth Card */}
        <div className="bg-[#121212] border border-[#222] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-[#161616] border border-[#262626] rounded-2xl">
            <button
              type="button"
              id="tab-sign-in-btn"
              onClick={() => {
                setMode('login');
                navigate('/login', { replace: true });
                setFormErrors({});
              }}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <LogIn size={15} />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              id="tab-create-account-btn"
              onClick={() => {
                setMode('register');
                navigate('/register', { replace: true });
                setFormErrors({});
              }}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <UserPlus size={15} />
              <span>Create Account</span>
            </button>
          </div>

          {/* Form Header Badge */}
          <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-3">
            <div className="flex items-center gap-2 text-white font-semibold text-xs">
              {mode === 'login' ? (
                <>
                  <ShieldCheck size={16} className="text-indigo-400" />
                  <span>Secure Sign In</span>
                </>
              ) : (
                <>
                  <UserPlus size={16} className="text-indigo-400" />
                  <span>New User Registration</span>
                </>
              )}
            </div>
            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
              Encrypted Local Session
            </span>
          </div>

          {/* General Error Banner */}
          {formErrors.general && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-2.5 text-xs text-rose-400 font-medium">
              <AlertCircle size={16} className="shrink-0 text-rose-400" />
              <span>{formErrors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" id="auth-form">
            {/* Full Name Field (Register Mode Only) */}
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label
                  htmlFor="register-name-input"
                  className="block text-xs font-bold uppercase tracking-wider text-gray-300"
                >
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    id="register-name-input"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    placeholder="e.g. David Dhawan"
                    autoComplete="name"
                    className={`w-full pl-10 pr-4 py-3 rounded-2xl border bg-[#161616] text-white text-sm placeholder-gray-500 focus:outline-hidden transition-all ${
                      formErrors.name
                        ? 'border-rose-500/80 focus:border-rose-500'
                        : 'border-[#262626] focus:border-indigo-500 focus:bg-[#1a1a1a]'
                    }`}
                  />
                </div>
                {formErrors.name && (
                  <p className="text-xs text-rose-400 flex items-center gap-1 font-medium mt-1">
                    <AlertCircle size={12} /> {formErrors.name}
                  </p>
                )}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="auth-email-input"
                className="block text-xs font-bold uppercase tracking-wider text-gray-300"
              >
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  id="auth-email-input"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder="e.g. name@company.com"
                  autoComplete="email"
                  className={`w-full pl-10 pr-4 py-3 rounded-2xl border bg-[#161616] text-white text-sm placeholder-gray-500 focus:outline-hidden transition-all ${
                    formErrors.email
                      ? 'border-rose-500/80 focus:border-rose-500'
                      : 'border-[#262626] focus:border-indigo-500 focus:bg-[#1a1a1a]'
                  }`}
                />
              </div>
              {formErrors.email && (
                <p className="text-xs text-rose-400 flex items-center gap-1 font-medium mt-1">
                  <AlertCircle size={12} /> {formErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="auth-password-input"
                  className="block text-xs font-bold uppercase tracking-wider text-gray-300"
                >
                  Password <span className="text-rose-500">*</span>
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    id="forgot-password-link"
                    onClick={() => {
                      setResetEmail(email);
                      setResetStatus({ loading: false });
                      setShowForgotPasswordModal(true);
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>

              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="auth-password-input"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (formErrors.password) setFormErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder={mode === 'login' ? 'Enter your password' : 'Create a secure password'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className={`w-full pl-10 pr-11 py-3 rounded-2xl border bg-[#161616] text-white text-sm placeholder-gray-500 focus:outline-hidden transition-all ${
                    formErrors.password
                      ? 'border-rose-500/80 focus:border-rose-500'
                      : 'border-[#262626] focus:border-indigo-500 focus:bg-[#1a1a1a]'
                  }`}
                />
                <button
                  type="button"
                  id="toggle-password-visibility-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 p-1 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password Strength Meter in Register Mode */}
              {mode === 'register' && password.length > 0 && (
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-400">Strength:</span>
                    <span className="font-semibold text-gray-300">
                      {strengthLabels[passwordStrength]}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[#222] rounded-full overflow-hidden flex gap-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full flex-1 rounded-full transition-all ${
                          passwordStrength >= step ? strengthColors[passwordStrength] : 'bg-[#262626]'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {formErrors.password && (
                <p className="text-xs text-rose-400 flex items-center gap-1 font-medium mt-1">
                  <AlertCircle size={12} /> {formErrors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field (Register Mode Only) */}
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label
                  htmlFor="register-confirm-password-input"
                  className="block text-xs font-bold uppercase tracking-wider text-gray-300"
                >
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="register-confirm-password-input"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (formErrors.confirmPassword)
                        setFormErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                    }}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    className={`w-full pl-10 pr-11 py-3 rounded-2xl border bg-[#161616] text-white text-sm placeholder-gray-500 focus:outline-hidden transition-all ${
                      formErrors.confirmPassword
                        ? 'border-rose-500/80 focus:border-rose-500'
                        : 'border-[#262626] focus:border-indigo-500 focus:bg-[#1a1a1a]'
                    }`}
                  />
                  <button
                    type="button"
                    id="toggle-confirm-password-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 p-1 cursor-pointer"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {formErrors.confirmPassword && (
                  <p className="text-xs text-rose-400 flex items-center gap-1 font-medium mt-1">
                    <AlertCircle size={12} /> {formErrors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {/* Checkboxes Area */}
            {mode === 'login' ? (
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    id="remember-me-checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-md border-gray-700 bg-black/40 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                  />
                  <span>Remember me on this browser</span>
                </label>
              </div>
            ) : (
              <div className="space-y-1.5 pt-1">
                <label className="flex items-start gap-2.5 text-xs text-gray-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    id="agree-terms-checkbox"
                    checked={agreeTerms}
                    onChange={(e) => {
                      setAgreeTerms(e.target.checked);
                      if (formErrors.terms) setFormErrors((prev) => ({ ...prev, terms: undefined }));
                    }}
                    className="w-4 h-4 mt-0.5 rounded-md border-gray-700 bg-black/40 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-gray-400 leading-tight">
                    I agree to the <span className="text-indigo-400 font-semibold">Terms of Service</span> and{' '}
                    <span className="text-indigo-400 font-semibold">Privacy Policy</span>.
                  </span>
                </label>
                {formErrors.terms && (
                  <p className="text-xs text-rose-400 flex items-center gap-1 font-medium">
                    <AlertCircle size={12} /> {formErrors.terms}
                  </p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                id="auth-submit-btn"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-bold text-sm shadow-xl shadow-indigo-600/25 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                  </span>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Sign In' : 'Create Free Account'}</span>
                    {mode === 'login' ? <ArrowRight size={16} /> : <UserPlus size={16} />}
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Mode Switch Helper Link */}
          <div className="pt-2 border-t border-[#1f1f1f] text-center text-xs text-gray-400">
            {mode === 'login' ? (
              <p>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  id="switch-to-register-btn"
                  onClick={() => {
                    setMode('register');
                    navigate('/register', { replace: true });
                    setFormErrors({});
                  }}
                  className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline cursor-pointer ml-1"
                >
                  Create an account
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  id="switch-to-login-btn"
                  onClick={() => {
                    setMode('login');
                    navigate('/login', { replace: true });
                    setFormErrors({});
                  }}
                  className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline cursor-pointer ml-1"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121212] border border-[#262626] rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                  <KeyRound size={18} />
                </div>
                <h3 className="text-base font-bold text-white">Reset Password</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#1a1a1a] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-400">
              Enter your registered email address below and we'll send you an instant reset link and temporary passkey.
            </p>

            {resetStatus.message && (
              <div
                className={`p-3 rounded-2xl text-xs font-medium flex items-center gap-2 ${
                  resetStatus.success
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                }`}
              >
                {resetStatus.success ? <CheckCircle2 size={16} className="shrink-0" /> : <AlertCircle size={16} className="shrink-0" />}
                <span>{resetStatus.message}</span>
              </div>
            )}

            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Email Address
                </label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#262626] bg-[#161616] text-white text-sm focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#1a1a1a] hover:bg-[#222] text-gray-300 text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={resetStatus.loading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
                >
                  {resetStatus.loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
