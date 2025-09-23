import { Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage';
import Contact from './pages/Contact';
import Navbar from './components/Navbar';
import About from './pages/About';
import Overview from './pages/Overview';
import RateUs from './pages/RateUs';
import ReportProblem from './pages/ReportProblem';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import AdminDevices from './admin/AdminDevices';
import DeviceDetail from './admin/DeviceDetail';
import AdminProblems from './admin/AdminProblems';
import NotFound from './pages/NotFound';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { GoogleLoginProvider } from './contexts/GoogleLoginContext';
import { LogoutProvider } from './contexts/LogoutContext';
import { AuthProvider } from './contexts/AuthContext';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import GoogleLoginModal from './components/GoogleLoginModal';
import LogoutConfirmationModal from './components/LogoutConfirmationModal';

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <GoogleLoginProvider>
            <LogoutProvider>
            <Routes>
        {/* Admin routes without navbar */}
        <Route path='/admin' element={
          <AdminAuthProvider>
            <AdminLogin />
          </AdminAuthProvider>
        }/>
        <Route path='/admin/dashboard' element={
          <AdminAuthProvider>
            <AdminDashboard />
          </AdminAuthProvider>
        }/>
        <Route path='/admin/devices' element={
          <AdminAuthProvider>
            <AdminDevices />
          </AdminAuthProvider>
        }/>
        <Route path='/admin/problems' element={
          <AdminAuthProvider>
            <AdminProblems />
          </AdminAuthProvider>
        }/>
        <Route path='/admin/device/:deviceId' element={
          <AdminAuthProvider>
            <DeviceDetail />
          </AdminAuthProvider>
        }/>
        
        {/* Regular routes with navbar */}
        <Route path='/*' element={
          <>
            <Navbar/>
            <main className="pt-16">
              <Routes>
                <Route path='/' element={<Homepage/>}/>
                <Route path='/about' element={<About/>}/>
                <Route path='/contact' element={<Contact/>}/>
                <Route path='/overview' element={<Overview/>}/>
                <Route path='/rate-us' element={<RateUs/>}/>
                <Route path='/report-problem' element={<ReportProblem/>}/>
                <Route path='*' element={<NotFound/>}/>
              </Routes>
            </main>
          </>
        }/>
        </Routes>
        <GoogleLoginModal />
        <LogoutConfirmationModal />
            </LogoutProvider>
          </GoogleLoginProvider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
    );
  }

export default App;