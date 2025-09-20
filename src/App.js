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
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { GoogleLoginProvider } from './contexts/GoogleLoginContext';
import GoogleLoginModal from './components/GoogleLoginModal';

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <GoogleLoginProvider>
          <Routes>
        {/* Admin routes without navbar */}
        <Route path='/admin' element={<AdminLogin />}/>
        <Route path='/admin/dashboard' element={<AdminDashboard />}/>
        <Route path='/admin/devices' element={<AdminDevices />}/>
        <Route path='/admin/problems' element={<AdminProblems />}/>
        <Route path='/admin/device/:deviceId' element={<DeviceDetail />}/>
        
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
              </Routes>
            </main>
          </>
        }/>
        </Routes>
        <GoogleLoginModal />
        </GoogleLoginProvider>
      </NotificationProvider>
    </ThemeProvider>
    );
  }

export default App;