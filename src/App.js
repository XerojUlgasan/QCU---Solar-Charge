import { Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage';
import Contact from './pages/Contact';
import Navbar from './components/Navbar';
import About from './pages/About';
import Overview from './pages/Overview';

function App() {
  return (
    <>
      <Navbar/>

      <main className="pt-16">
        <Routes>
          <Route path='/' element={<Homepage/>}/>
          <Route path='/about' element={<About/>}/>
          <Route path='/contact' element={<Contact/>}/>
          <Route path='/overview' element={<Overview/>}/>
        </Routes>
      </main>

    </>
  );
}

export default App;