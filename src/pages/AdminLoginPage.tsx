import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/auth';
import { toast } from 'sonner';

export function AdminLoginPage() {
  const [email, setEmail] = useState('admin@gowild.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await adminLogin(email, password);
    if (success) {
      toast.success('Welcome back!');
      navigate('/admin');
    } else {
      toast.error('Invalid admin credentials');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#1A4A52] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#1A5A6B]/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-[#1A5A6B]" />
            </div>
            <h1 className="font-heading text-xl sm:text-2xl font-bold text-[#1A1A1A]">Admin Access</h1>
            <p className="text-sm text-[#6B7280] mt-1">Sign in to manage your store</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-[#1A1A1A] mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 focus:border-[#1A5A6B]"
                  placeholder="admin@gowild.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[#1A1A1A] mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5A6B]/30 focus:border-[#1A5A6B]"
                  placeholder="Enter password"
                  required
                  minLength={4}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-[#6B7280] mt-1.5">Any password with 4+ characters works for demo.</p>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1A5A6B] hover:bg-[#1A8DA3] text-white rounded-full py-3 font-medium"
            >
              {isLoading ? 'Signing in...' : 'Sign In to Admin'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-[#1A5A6B] hover:underline">
              ← Back to Store
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
