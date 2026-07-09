import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ settings }) => {
  const [scrolled, setScrolled] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header--title flex align-items-center ${scrolled ? 'show-bg' : ''} ${navOpen ? 'show-nav' : ''}`}>
        <div className="container">
            <div className="align-items-center flex">
                <div className="logo-wrapper">
                    <Link className="logo" to="/">Alijonov's Blog</Link>
                </div>
                <ul className="nav align-items-center">
                    {settings?.resume_file && <li><a className="list-item" href={settings.resume_file} target="_blank" rel="noreferrer" onClick={() => setNavOpen(false)}>Resume</a></li>}
                    <li><Link className="list-item" to="/blog" onClick={() => setNavOpen(false)}>Blog</Link></li>
                    <li><Link className="list-item" to="/about" onClick={() => setNavOpen(false)}>About</Link></li>
                    {settings?.telegram_channel && <li><a className="list-item" href={settings.telegram_channel} target="_blank" rel="noreferrer" onClick={() => setNavOpen(false)}>Channel</a></li>}
                </ul>
                <div className="burger-menu" onClick={() => setNavOpen(!navOpen)}>
                    <div className="bar bar--top"></div>
                    <div className="bar bar--middle"></div>
                    <div className="bar bar--bottom"></div>
                </div>
            </div>
        </div>
    </header>
  );
};

export default Navbar;
