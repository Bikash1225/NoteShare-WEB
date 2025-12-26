import { BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function SignUpPage() {
  const navigate = useNavigate();
  const { currentUser, signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsSubmitting(false);
      return;
    }

    const result = await signUp(email, password, name);
    if (result.success) {
      setShowSuccess(true);
      setIsSubmitting(false);
    } else {
      setError(result.error || 'Email already exists');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Join NoteShare today</p>
        </div>

        <div className="bg-white border border-gray-300 p-8">
          {showSuccess ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">✓</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Account Created</h3>
              <p className="text-gray-600 mb-6">
                Your account has been created successfully. You can now sign in.
              </p>
              <button
                onClick={() => navigate('/signin')}
                className="w-full bg-slate-700 hover:bg-slate-800 text-white font-bold py-3 px-4"
              >
                Go to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block font-semibold text-gray-700 mb-2">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-500"
              />
              <p className="text-sm text-gray-500 mt-1">Minimum 6 characters</p>
            </div>

            {error && (
              <div className="text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-slate-700 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold py-3 px-4"
            >
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          )}

          {!showSuccess && (
            <div className="mt-6 text-center text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/signin')}
                className="text-slate-700 hover:underline font-semibold"
              >
                Sign in
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  );
}
