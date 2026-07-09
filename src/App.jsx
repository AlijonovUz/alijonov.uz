import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import BlogList from './pages/BlogList';
import BlogPost from './pages/BlogPost';

function App() {
  const [settings] = useState({
    resume_file: '/resume.pdf',
    telegram_channel: 'https://t.me/abdulbosit_alijonov'
  });

  const [socialLinks] = useState([
    { platform: 'telegram', url: 'https://t.me/alijonovuz' },
    { platform: 'github', url: 'https://github.com/alijonovuz' },
    { platform: 'linkedin', url: 'https://linkedin.com/in/alijonovuz' },
    { platform: 'instagram', url: 'https://instagram.com/alijonov.uz_' }
  ]);

  const location = useLocation();

  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    const handleKeyDown = (e) => {
      // Disable F12
      if (e.keyCode === 123) {
        e.preventDefault();
      }
      // Disable Ctrl+Shift+I (Inspect), Ctrl+Shift+J (Console), Ctrl+Shift+C (Element Select)
      if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
        e.preventDefault();
      }
      // Disable Ctrl+U (View Source)
      if (e.ctrlKey && e.keyCode === 85) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      <Navbar settings={settings} />
      <Routes location={location}>
        <Route path="/" element={<Home socialLinks={socialLinks} />} />
        <Route path="/about" element={<About />} />
        <Route path="/blog" element={<BlogList settings={settings} />} />
        <Route path="/blog/:slug" element={<BlogPost settings={settings} />} />
        <Route path="/:slug" element={<BlogPost settings={settings} />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
