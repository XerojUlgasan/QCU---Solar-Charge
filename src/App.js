import logo from './logo.svg';
import { Routes, Route, Link } from 'react-router-dom';
import Homepage from './pages/Homepage';
import Contact from './pages/Contact';
import Navbar from './components/Navbar';

function App() {
  return (
    <>
      <Navbar/>
      
      <Routes>
        <Route path='/' element={<Homepage/>}/>
        <Route path='/contact' element={<Contact/>}/>
      </Routes>
    </>
  );
}

export default App;
