import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import BlogList from './pages/BlogList';
import BlogPost from './pages/BlogPost';
import NotFound from './pages/NotFound';
import useDevToolsDetector from './hooks/useDevToolsDetector';
import { initConsoleProtection, initDOMTamperProtection, initInteractionProtection } from './utils/security';

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
  const isDevToolsOpen = useDevToolsDetector();
  const [tampered, setTampered] = useState(false);

  useEffect(() => {
    initConsoleProtection();
    const disconnectObserver = initDOMTamperProtection(() => {
      setTampered(true);
    });
    const disconnectInteraction = initInteractionProtection();

    return () => {
      disconnectObserver();
      disconnectInteraction();
    };
  }, []);

  useEffect(() => {
    if (!isDevToolsOpen && tampered) {
      setTampered(false);
    }
  }, [isDevToolsOpen, tampered]);

  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    const handleKeyDown = (e) => {
      const isInput = e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA');

      // Disable F12
      if (e.keyCode === 123 || e.key === 'F12') {
        e.preventDefault();
      }

      // Disable Ctrl+Shift+I (Inspect), Ctrl+Shift+J (Console), Ctrl+Shift+C (Element Select), Ctrl+Shift+P (Command palette)
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67 || e.keyCode === 80 ||
         e.key === 'I' || e.key === 'J' || e.key === 'C' || e.key === 'P' ||
         e.key === 'i' || e.key === 'j' || e.key === 'c' || e.key === 'p')
      ) {
        e.preventDefault();
      }

      // Disable Mac shortcuts: Cmd+Option+I, Cmd+Option+J, Cmd+Option+C, Cmd+Option+U
      if (
        e.metaKey &&
        e.altKey &&
        (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67 || e.keyCode === 85 ||
         e.key === 'I' || e.key === 'J' || e.key === 'C' || e.key === 'U' ||
         e.key === 'i' || e.key === 'j' || e.key === 'c' || e.key === 'u')
      ) {
        e.preventDefault();
      }

      // Disable Ctrl+U / Cmd+U (View Source)
      if ((e.ctrlKey || e.metaKey) && (e.keyCode === 85 || e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
      }

      // Disable Ctrl+S / Cmd+S (Save page)
      if ((e.ctrlKey || e.metaKey) && (e.keyCode === 83 || e.key === 's' || e.key === 'S')) {
        e.preventDefault();
      }

      // Disable Ctrl+P / Cmd+P (Print / Save as PDF)
      if ((e.ctrlKey || e.metaKey) && (e.keyCode === 80 || e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
      }

      // Disable Ctrl+C / Cmd+C / Ctrl+X / Cmd+X outside input/textarea
      if (!isInput && (e.ctrlKey || e.metaKey) && (e.keyCode === 67 || e.keyCode === 88 || e.key === 'c' || e.key === 'C' || e.key === 'x' || e.key === 'X')) {
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (isDevToolsOpen || tampered) {
    return <NotFound />;
  }

  return (
    <>
      <Navbar settings={settings} />
      <Routes location={location}>
        <Route path="/" element={<Home socialLinks={socialLinks} />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/about" element={<About />} />
        <Route path="/blog" element={<BlogList settings={settings} />} />
        <Route path="/blog/:slug" element={<BlogPost settings={settings} />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
