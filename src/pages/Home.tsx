import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-slate-700 text-white py-12">
        <div className="max-w-5xl mx-auto px-6">
          <h1 className="text-5xl font-extrabold mb-2">NoteShare</h1>
          <p className="text-xl mb-8 text-slate-200">A place to share and find study notes</p>

          <div className="flex gap-4">
            {currentUser ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-white text-slate-800 px-8 py-3 font-semibold hover:bg-slate-100"
              >
                Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/signin')}
                  className="bg-white text-slate-800 px-8 py-3 font-semibold hover:bg-slate-100"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="border-2 border-white text-white px-8 py-3 font-semibold hover:bg-white hover:text-slate-800"
                >
                  Create Account
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold mb-8">How it works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="text-4xl font-bold text-slate-700 mb-3">1</div>
            <h3 className="text-xl font-bold mb-2">Upload</h3>
            <p className="text-gray-600">Teachers and students can upload their notes and study materials.</p>
          </div>

          <div>
            <div className="text-4xl font-bold text-slate-700 mb-3">2</div>
            <h3 className="text-xl font-bold mb-2">Browse</h3>
            <p className="text-gray-600">Filter by subject and semester to find what you need.</p>
          </div>

          <div>
            <div className="text-4xl font-bold text-slate-700 mb-3">3</div>
            <h3 className="text-xl font-bold mb-2">Download</h3>
            <p className="text-gray-600">Access notes anytime. Preview PDFs before downloading.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
