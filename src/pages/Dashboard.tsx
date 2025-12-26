import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, Document, createActivityLog } from '../db';
import { Download, FileText, Calendar, User, BookOpen, Upload, X, LogOut, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filter, setFilter] = useState({ subject: '', semester: '' });
  const [showUploadForm, setShowUploadForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    subject: '',
    semester: '',
    file: null as File | null
  });

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Error loading documents:', error);
      return;
    }
    setDocuments(data || []);
  };

  const filteredDocuments = documents.filter(doc => {
    if (filter.subject && doc.subject !== filter.subject) return false;
    if (filter.semester && doc.semester !== filter.semester) return false;
    return true;
  });

  const subjects = [...new Set(documents.map(d => d.subject).filter(Boolean))];
  const semesters = [...new Set(documents.map(d => d.semester).filter(Boolean))];

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.file || !currentUser) return;

    try {
      const fileName = `${Date.now()}_${uploadForm.file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, uploadForm.file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from('documents')
        .insert({
          title: uploadForm.title,
          description: uploadForm.description,
          file_name: uploadForm.file.name,
          file_path: publicUrl,
          uploaded_by: currentUser.id,
          uploaded_by_name: currentUser.name,
          subject: uploadForm.subject || '',
          semester: uploadForm.semester || ''
        });

      if (insertError) throw insertError;

      await createActivityLog({
        action_type: 'document_created',
        actor_email: currentUser.email,
        actor_name: currentUser.name,
        document_name: uploadForm.title,
        message: `${currentUser.email} - ${currentUser.name} created document "${uploadForm.title}"`
      });

      alert('Document uploaded successfully!');
      setUploadForm({ title: '', description: '', subject: '', semester: '', file: null });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setShowUploadForm(false);
      loadDocuments();
    } catch (error) {
      alert('Error uploading document');
      console.error(error);
    }
  };

  const downloadFile = (doc: Document) => {
    const a = document.createElement('a');
    a.href = doc.file_path;
    a.download = doc.file_name;
    a.target = '_blank';
    a.click();
  };

  const previewFile = (doc: Document) => {
    window.open(doc.file_path, '_blank');
  };

  const isPDF = (fileName: string) => {
    return fileName.toLowerCase().endsWith('.pdf');
  };

  if (!currentUser) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-slate-700 text-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">NoteShare</h1>
          <div className="flex items-center gap-3">
            {currentUser.is_admin && (
              <button
                onClick={() => navigate('/admin')}
                className="bg-slate-800 px-4 py-2 font-semibold hover:bg-slate-900"
              >
                Admin
              </button>
            )}
            <button
              onClick={async () => {
                await signOut();
                navigate('/');
              }}
              className="text-slate-200 hover:text-white font-semibold"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Hi {currentUser.name}</h2>
            <p className="text-gray-600 mt-1">Find notes or upload your own</p>
          </div>
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="bg-slate-700 text-white px-6 py-3 font-semibold hover:bg-slate-800 flex items-center gap-2"
          >
            {showUploadForm ? (
              <>
                <X className="w-5 h-5" />
                <span>Cancel</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Upload</span>
              </>
            )}
          </button>
        </div>

        {showUploadForm && (
          <div className="bg-white border border-gray-300 p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">Upload Document</h3>
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:border-gray-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  required
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:border-gray-500"
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={uploadForm.subject}
                    onChange={(e) => setUploadForm({ ...uploadForm, subject: e.target.value })}
                    className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:border-gray-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Semester</label>
                  <input
                    type="text"
                    value={uploadForm.semester}
                    onChange={(e) => setUploadForm({ ...uploadForm, semester: e.target.value })}
                    className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:border-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">File</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  required
                  onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files?.[0] || null })}
                  className="w-full border border-gray-300 px-3 py-2"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-700 text-white py-3 font-bold hover:bg-slate-800"
              >
                Upload
              </button>
            </form>
          </div>
        )}

        <div className="bg-white border border-gray-300 p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">Filter</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Subject</label>
              <select
                value={filter.subject}
                onChange={(e) => setFilter({ ...filter, subject: e.target.value })}
                className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:border-gray-500"
              >
                <option value="">All</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Semester</label>
              <select
                value={filter.semester}
                onChange={(e) => setFilter({ ...filter, semester: e.target.value })}
                className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:border-gray-500"
              >
                <option value="">All</option>
                {semesters.map(semester => (
                  <option key={semester} value={semester}>{semester}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredDocuments.length === 0 ? (
            <div className="bg-white border border-gray-300 p-12 text-center">
              <p className="text-gray-500 text-lg">No documents found</p>
            </div>
          ) : (
            filteredDocuments.map(doc => (
              <div key={doc.id} className="bg-white border border-gray-300 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{doc.title}</h3>
                    <p className="text-gray-600 mb-3">{doc.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      {doc.subject && <span>{doc.subject}</span>}
                      {doc.semester && <span className="font-semibold">{doc.semester}</span>}
                      <span>by {doc.uploaded_by_name}</span>
                      <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    {isPDF(doc.file_name) && (
                      <button
                        onClick={() => previewFile(doc)}
                        className="bg-gray-200 text-gray-800 px-4 py-2 font-semibold hover:bg-gray-300"
                      >
                        Preview
                      </button>
                    )}
                    <button
                      onClick={() => downloadFile(doc)}
                      className="bg-slate-700 text-white px-4 py-2 font-semibold hover:bg-slate-800"
                    >
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
