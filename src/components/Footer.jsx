import React from 'react';

const Footer = () => {
  return (
    <footer>
        <div className="container">
            <div className="row">
                <p>
                    &copy; {new Date().getFullYear()} alijonov.uz
                </p>
            </div>
        </div>
    </footer>
  );
};

export default Footer;
