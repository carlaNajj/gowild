import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff, Mountain } from 'lucide-react';
import { useAuth } from '@/auth';
import { useSiteSettings } from '@/lib/settings-context';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function LoginPage() {
  const { settings } = useSiteSettings();
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || '/';
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 600)); // simulate network

    if (mode === 'login') {
      const ok = await login(email, password);
      if (ok) {
        toast.success('Welcome back!');
        navigate(from);
      } else {
        toast.error('Invalid email or password');
      }
    } else if (mode === 'register') {
      const ok = await register(name, email, password);
      if (ok) {
        toast.success('Account created! Welcome to GoWild.');
        navigate(from);
      } else {
        toast.error('Please fill in all fields correctly');
      }
    } else {
      toast.success('Password reset link sent to your email!');
      setMode('login');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <img src="/logo.png" alt="GoWild" className="h-10 w-auto mx-auto" />
          </Link>
          <p className="text-[#6B7280] text-sm mt-2">Adventure gear for the wild at heart</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          {/* Tabs */}
          <div className="flex rounded-full bg-gray-100 p-1 mb-6">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${
                mode === 'login' ? 'bg-[#1A5A6B] text-white shadow-sm' : 'text-[#6B7280] hover:text-[#1A1A1A]'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${
                mode === 'register' ? 'bg-[#1A5A6B] text-white shadow-sm' : 'text-[#6B7280] hover:text-[#1A1A1A]'
              }`}
            >
              Create Account
            </button>
          </div>

          <h2 className="font-heading text-xl font-bold text-[#1A1A1A] mb-6">
            {mode === 'login' && 'Welcome Back'}
            {mode === 'register' && 'Join the Adventure'}
            {mode === 'forgot' && 'Reset Password'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="text-sm font-medium text-[#1A1A1A] mb-1 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Alex Walker"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 focus:border-[#1A5A6B] text-sm"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-[#1A1A1A] mb-1 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="alex@gowild.com"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 focus:border-[#1A5A6B] text-sm"
                  required
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <label className="text-sm font-medium text-[#1A1A1A] mb-1 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 4 characters"
                    className="w-full pl-10 pr-10 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 focus:border-[#1A5A6B] text-sm"
                    required
                    minLength={4}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1A5A6B]"
                  >
                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-xs text-[#1A5A6B] hover:underline mt-2 inline-block"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1A5A6B] hover:bg-[#1A8DA3] rounded-full py-6 font-semibold text-base transition-all hover:scale-[1.02]"
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Send Reset Link'}
            </Button>
          </form>

          {mode === 'forgot' && (
            <button
              onClick={() => setMode('login')}
              className="w-full text-center mt-4 text-sm text-[#1A5A6B] hover:underline flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </button>
          )}

          <div className="mt-6 pt-6 border-t text-center">
            <p className="text-xs text-[#6B7280]">
              {mode === 'login' ? (
                <>New to GoWild? <button onClick={() => setMode('register')} className="text-[#1A5A6B] font-medium hover:underline">Create an account</button></>
              ) : (
                <>Already have an account? <button onClick={() => setMode('login')} className="text-[#1A5A6B] font-medium hover:underline">Sign in</button></>
              )}
            </p>
          </div>
        </motion.div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-6 mt-8 text-[#6B7280]">
          <div className="flex items-center gap-1.5 text-xs">
            <Mountain className="w-4 h-4" />
            <span>Free shipping ${settings.freeShippingThreshold}+</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Lock className="w-4 h-4" />
            <span>Secure checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
}
