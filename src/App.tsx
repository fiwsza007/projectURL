import React, { useState, useEffect } from 'react';
import { Scissors } from 'lucide-react';
import AuthForm from './components/AuthForm';
import Header from './components/Header';
import CreateLinkForm from './components/CreateLinkForm';
import LinkCard from './components/LinkCard';
import Statistics from './components/Statistics';
import Toast from './components/Toast';
import { api } from './services/api';
import { Link, CreateLinkRequest, User, AuthRequest } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  // Check for existing auth token on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Load links when user is authenticated
  useEffect(() => {
    if (user) {
      loadLinks();
    }
  }, [user]);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const response = await api.getCurrentUser();
        if (response.success && response.data) {
          setUser(response.data);
        } else {
          localStorage.removeItem('authToken');
        }
      } catch (error) {
        localStorage.removeItem('authToken');
      }
    }
    setIsInitializing(false);
  };

  const loadLinks = async () => {
    try {
      const response = await api.getAllLinks();
      if (response.success && response.data) {
        setLinks(response.data);
      }
    } catch (error) {
      console.error('Failed to load links:', error);
      showToast('เกิดข้อผิดพลาดในการโหลดข้อมูลลิงก์', 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const handleAuth = async (data: AuthRequest) => {
    setIsAuthLoading(true);
    setAuthError('');
    
    try {
      const response = authMode === 'login' 
        ? await api.login({ email: data.email, password: data.password })
        : await api.register(data);
      
      if (response.success && response.data) {
        localStorage.setItem('authToken', response.data.token);
        setUser(response.data.user);
        showToast(
          authMode === 'login' ? 'เข้าสู่ระบบสำเร็จ!' : 'สมัครสมาชิกสำเร็จ!', 
          'success'
        );
      } else {
        setAuthError(response.error || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Auth error:', error);
      setAuthError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setLinks([]);
    showToast('ออกจากระบบเรียบร้อย', 'success');
  };

  const handleCreateLink = async (data: CreateLinkRequest) => {
    setIsLoading(true);
    try {
      const response = await api.createLink(data);
      
      if (response.success && response.data) {
        showToast('สร้างลิงก์ย่อสำเร็จ!', 'success');
        await loadLinks(); // Reload links to get updated data
      } else {
        showToast(response.error || 'เกิดข้อผิดพลาดในการสร้างลิงก์', 'error');
      }
    } catch (error) {
      console.error('Failed to create link:', error);
      showToast('เกิดข้อผิดพลาดในการสร้างลิงก์', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const response = await api.toggleLinkStatus(id);
      
      if (response.success) {
        showToast('อัปเดตสถานะลิงก์เรียบร้อย', 'success');
        await loadLinks();
      } else {
        showToast(response.error || 'เกิดข้อผิดพลาดในการอัปเดตสถานะ', 'error');
      }
    } catch (error) {
      console.error('Failed to toggle link status:', error);
      showToast('เกิดข้อผิดพลาดในการอัปเดตสถานะ', 'error');
    }
  };

  const handleDeleteLink = async (id: number) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบลิงก์นี้?')) {
      return;
    }

    try {
      const response = await api.deleteLink(id);
      
      if (response.success) {
        showToast('ลบลิงก์เรียบร้อยแล้ว', 'success');
        await loadLinks();
      } else {
        showToast(response.error || 'เกิดข้อผิดพลาดในการลบลิงก์', 'error');
      }
    } catch (error) {
      console.error('Failed to delete link:', error);
      showToast('เกิดข้อผิดพลาดในการลบลิงก์', 'error');
    }
  };

  // Show loading screen while checking auth status
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <Scissors className="h-8 w-8 text-indigo-600" />
          </div>
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  // Show auth form if user is not logged in
  if (!user) {
    return (
      <>
        <AuthForm
          mode={authMode}
          onSubmit={handleAuth}
          onToggleMode={() => {
            setAuthMode(authMode === 'login' ? 'register' : 'login');
            setAuthError('');
          }}
          isLoading={isAuthLoading}
          error={authError}
        />
        
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Link Form */}
          <div className="lg:col-span-1">
            <CreateLinkForm onSubmit={handleCreateLink} isLoading={isLoading} />
          </div>

          {/* Links Management */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <Statistics links={links} />
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                ลิงก์ทั้งหมด ({links.length})
              </h2>
            </div>

            {links.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <Scissors className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  ยังไม่มีลิงก์ที่สร้าง
                </h3>
                <p className="text-gray-600">
                  เริ่มต้นสร้างลิงก์ย่อแรกของคุณได้เลย!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {links.map((link) => (
                  <LinkCard
                    key={link.id}
                    link={link}
                    onToggleStatus={handleToggleStatus}
                    onDelete={handleDeleteLink}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default App;