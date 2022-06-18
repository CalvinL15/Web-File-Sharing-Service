import React from 'react';
import {
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import Header from './components/Header';
import About from './pages/About';
import AdminPage from './pages/AdminPage';
import DownloadPage from './pages/DownloadPage';
import HomePage from './pages/HomePage';
import NotFound from './pages/NotFound';
import './App.css';

function checkPathValidity(pathname: String){
  const params: String[] = pathname.split("/");
  console.log(params);
  if(params.length === 1) return true;
  if(params.length === 2 && params[1] === '') return true;
  if(params.length > 3) return false;
  if(params.length === 3 && params[1] !== 'download') return false;
  if(params[1] === 'about' || params[1] === 'home' 
  || params[1] === 'download' || params[1] === 'admin'){
    return true;
  }
  return false;
}

function App() {
  const location = useLocation();
  const pathname: String = location.pathname;
  const isPathValid = checkPathValidity(pathname);
  return (
    <div className={!isPathValid ? 'bgimg' : ''}>
      <Header />
      <div className="App-body">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/download" element={<DownloadPage />} />
          <Route path="/download/:id" element={<DownloadPage />} />
          <Route path="*" element={<NotFound /> }/>
        </Routes>
      </div>
    </div>
  );
}

export default App;
