import { Routes, Route, Outlet } from 'react-router-dom';
import Homepage from './pages/Homepage';
import Contact from './pages/Contact';
import About from './pages/About';
import Overview from './pages/Overview';
import RateUs from './pages/RateUs';
import ReportProblem from './pages/ReportProblem';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import AdminDevices from './admin/AdminDevices';
import DeviceDetail from './admin/DeviceDetail';
import AdminProblems from './admin/AdminProblems';
import AdminContactMessages from './admin/AdminContactMessages';
import NotFound from './pages/NotFound';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { GoogleLoginProvider } from './contexts/GoogleLoginContext';
import { LogoutProvider } from './contexts/LogoutContext';
import { AuthProvider } from './contexts/AuthContext';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { SocketProvider } from './contexts/SocketContext';
import GoogleLoginModal from './components/GoogleLoginModal';
import LogoutConfirmationModal from './components/LogoutConfirmationModal';
import RequireAdminAuth from './admin/RequireAdminAuth';
import Navbar from './components/Navbar';

function App() {
  const MainLayout = () => (
    <>
      <Navbar />
      <main className="pt-16">
        <Outlet />
      </main>
    </>
  );

  const AdminLayout = () => (
    <AdminAuthProvider>
      <Outlet />
    </AdminAuthProvider>
  );

  return (
    <ThemeProvider>
      <NotificationProvider>
        <SocketProvider>
          <AuthProvider>
            <GoogleLoginProvider>
              <LogoutProvider>
                <Routes>
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminLogin />} />
                    <Route
                      path="dashboard"
                      element={
                        <RequireAdminAuth>
                          <AdminDashboard />
                        </RequireAdminAuth>
                      }
                    />
                    <Route
                      path="devices"
                      element={
                        <RequireAdminAuth>
                          <AdminDevices />
                        </RequireAdminAuth>
                      }
                    />
                    <Route
                      path="problems"
                      element={
                        <RequireAdminAuth>
                          <AdminProblems />
                        </RequireAdminAuth>
                      }
                    />
                    <Route
                      path="contact"
                      element={
                        <RequireAdminAuth>
                          <AdminContactMessages />
                        </RequireAdminAuth>
                      }
                    />
                    <Route
                      path="device/:deviceId"
                      element={
                        <RequireAdminAuth>
                          <DeviceDetail />
                        </RequireAdminAuth>
                      }
                    />
                  </Route>

                  <Route element={<MainLayout />}>
                    <Route path="/" element={<Homepage />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/overview" element={<Overview />} />
                    <Route path="/rate-us" element={<RateUs />} />
                    <Route path="/report-problem" element={<ReportProblem />} />
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Routes>
                <GoogleLoginModal />
                <LogoutConfirmationModal />
              </LogoutProvider>
            </GoogleLoginProvider>
          </AuthProvider>
        </SocketProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;