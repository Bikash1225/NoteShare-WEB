import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, Profile, Document, ActivityLog, createActivityLog } from '../db';
import { Upload, Users, FileText, Trash2, BookOpen, ArrowLeft, LogOut, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function AdminPanel() {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'upload' | 'admins' | 'users' | 'documents' | 'logs'>('upload');
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [admins, setAdmins] = useState<Profile[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    subject: '',
    semester: '',
    file: null as File | null
  });

  const [newAdminEmail, setNewAdminEmail] = useState('');

  useEffect(() => {
    if (!currentUser?.is_admin) {
      alert('Access Denied: You are not an admin');
      navigate('/dashboard');
      return;
    }
    loadAdmins();
    loadDocuments();
    loadAllUsers();
    loadLogs();
  }, [currentUser, navigate]);

  const loadAdmins = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_admin', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading admins:', error);
      return;
    }
    setAdmins(data || []);
  };

  const loadAllUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading users:', error);
      return;
    }
    setAllUsers(data || []);
  };

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

  const loadLogs = async () => {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading logs:', error);
      return;
    }
    setLogs(data || []);
  };

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
        actor_id: currentUser.id,
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
      loadDocuments();
      loadLogs();
    } catch (error) {
      alert('Error uploading document');
      console.error(error);
    }
  };

  const addAdmin = async () => {
    if (!newAdminEmail.trim()) return;

    const { data: user, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', newAdminEmail)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching user:', fetchError);
      alert('Error checking user');
      return;
    }

    if (!user) {
      alert('User with this email does not exist. They need to sign up first.');
      return;
    }

    if (user.is_admin) {
      alert('This user is already an admin');
      return;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ is_admin: true })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error promoting user:', updateError);
      alert('Error promoting user');
      return;
    }

    await createActivityLog({
      action_type: 'admin_promoted',
      actor_id: currentUser.id,
      actor_email: currentUser.email,
      actor_name: currentUser.name,
      target_id: user.id,
      target_email: user.email,
      target_name: user.name,
      message: `${user.name} - ${user.email} was promoted as admin by ${currentUser.name} - ${currentUser.email}`
    });

    alert('User promoted to admin successfully!');
    setNewAdminEmail('');
    loadAdmins();
    loadAllUsers();
    loadLogs();
  };

  const removeAdmin = async (id: string) => {
    if (confirm('Are you sure you want to remove this admin?')) {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: false })
        .eq('id', id);

      if (error) {
        console.error('Error removing admin:', error);
        alert('Error removing admin');
        return;
      }

      alert('Admin removed');
      loadAdmins();
      loadAllUsers();
    }
  };

  const toggleUserAdmin = async (userId: string, currentStatus: boolean) => {
    if (userId === currentUser.id) {
      alert('You cannot change your own admin status');
      return;
    }

    const targetUser = allUsers.find(u => u.id === userId);
    if (!targetUser) return;

    const action = currentStatus ? 'remove admin privileges from' : 'promote';
    if (confirm(`Are you sure you want to ${action} this user?`)) {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !currentStatus })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user:', error);
        alert('Error updating user');
        return;
      }

      if (!currentStatus) {
        await createActivityLog({
          action_type: 'admin_promoted',
          actor_id: currentUser.id,
          actor_email: currentUser.email,
          actor_name: currentUser.name,
          target_id: targetUser.id,
          target_email: targetUser.email,
          target_name: targetUser.name,
          message: `${targetUser.name} - ${targetUser.email} was promoted as admin by ${currentUser.name} - ${currentUser.email}`
        });
      }

      alert(`User ${currentStatus ? 'demoted' : 'promoted'} successfully!`);
      loadAdmins();
      loadAllUsers();
      loadLogs();
    }
  };

  const deleteUser = async (userId: string) => {
    if (userId === currentUser.id) {
      alert('You cannot delete your own account');
      return;
    }

    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user. You may not have permission to delete users.');
        return;
      }

      alert('User deleted successfully');
      loadAdmins();
      loadAllUsers();
    }
  };

  const deleteDocument = async (id: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting document:', error);
        alert('Error deleting document');
        return;
      }

      alert('Document deleted');
      loadDocuments();
    }
  };

  if (!currentUser || !currentUser.is_admin) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-slate-700 text-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="hover:text-slate-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
          </div>
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
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6 flex gap-2 border-b border-gray-300 overflow-x-auto">
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-3 px-4 font-semibold whitespace-nowrap ${activeTab === 'upload' ? 'border-b-2 border-slate-700 text-slate-900' : 'text-gray-600'}`}
          >
            Upload
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`pb-3 px-4 font-semibold whitespace-nowrap ${activeTab === 'documents' ? 'border-b-2 border-slate-700 text-slate-900' : 'text-gray-600'}`}
          >
            Documents
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-4 font-semibold whitespace-nowrap ${activeTab === 'users' ? 'border-b-2 border-slate-700 text-slate-900' : 'text-gray-600'}`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('admins')}
            className={`pb-3 px-4 font-semibold whitespace-nowrap ${activeTab === 'admins' ? 'border-b-2 border-slate-700 text-slate-900' : 'text-gray-600'}`}
          >
            Admins
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`pb-3 px-4 font-semibold whitespace-nowrap ${activeTab === 'logs' ? 'border-b-2 border-slate-700 text-slate-900' : 'text-gray-600'}`}
          >
            Activity
          </button>
        </div>

        {activeTab === 'upload' && (
          <div className="bg-white border border-gray-300 p-6 max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Upload Document</h2>
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

        {activeTab === 'documents' && (
          <div className="bg-white border border-gray-300 p-6">
            <h2 className="text-2xl font-bold mb-6">Documents ({documents.length})</h2>
            <div className="space-y-3">
              {documents.map(doc => (
                <div key={doc.id} className="border border-gray-200 p-4 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{doc.title}</h3>
                    <p className="text-gray-600">{doc.description}</p>
                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                      {doc.subject && <span>{doc.subject}</span>}
                      {doc.semester && <span>{doc.semester}</span>}
                      <span>by {doc.uploaded_by_name}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteDocument(doc.id)}
                    className="text-red-600 hover:text-red-800 p-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white border border-gray-300 p-6">
            <h2 className="text-2xl font-bold mb-6">Users ({allUsers.length})</h2>
            <div className="space-y-3">
              {allUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between border border-gray-200 p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-lg">{user.name}</p>
                      {user.is_admin && (
                        <span className="bg-slate-200 text-slate-700 text-xs px-2 py-1 font-semibold">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600">{user.email}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleUserAdmin(user.id, user.is_admin)}
                      className={`px-4 py-2 font-semibold ${
                        user.is_admin
                          ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                          : 'bg-slate-700 text-white hover:bg-slate-800'
                      }`}
                      disabled={user.id === currentUser.id}
                    >
                      {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                    </button>
                    {user.id !== currentUser.id && (
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="text-red-600 hover:text-red-800 p-2"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'admins' && (
          <div className="bg-white border border-gray-300 p-6 max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">Manage Admins</h2>

            <div className="mb-8">
              <label className="block font-semibold text-gray-700 mb-2">Promote User to Admin</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="user@email.com"
                  className="flex-1 border border-gray-300 px-4 py-2 focus:outline-none focus:border-gray-500"
                />
                <button
                  onClick={addAdmin}
                  className="bg-slate-700 text-white px-6 py-2 font-semibold hover:bg-slate-800"
                >
                  Promote
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">User must be registered first</p>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Current Admins ({admins.length})</h3>
              <div className="space-y-3">
                {admins.map(admin => (
                  <div key={admin.id} className="flex items-center justify-between border border-gray-200 p-4">
                    <div>
                      <p className="font-bold">{admin.name}</p>
                      <p className="text-gray-600">{admin.email}</p>
                    </div>
                    {admin.id !== currentUser.id && (
                      <button
                        onClick={() => removeAdmin(admin.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-white border border-gray-300 p-6">
            <h2 className="text-2xl font-bold mb-6">Activity ({logs.length})</h2>
            <div className="space-y-3">
              {logs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg">No activity yet</p>
                </div>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="border border-gray-200 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-gray-800">{log.message}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 font-semibold ${
                        log.action_type === 'document_created'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-200 text-slate-800'
                      }`}>
                        {log.action_type === 'document_created' ? 'DOC' : 'ADMIN'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
