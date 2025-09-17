import { Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage';
import Contact from './pages/Contact';
import Navbar from './components/Navbar';
import About from './pages/About';

function App() {
  return (
    <>
      <Navbar/>

      <main className="pt-16">
        <Routes>
          <Route path='/' element={<Homepage/>}/>
          <Route path='/about' element={<About/>}/>
          <Route path='/contact' element={<Contact/>}/>
        </Routes>
      </main>

    </>
  );
}

export default App;