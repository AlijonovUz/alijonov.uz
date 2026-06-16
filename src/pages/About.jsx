import React, { useEffect, useState } from 'react';

const About = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <section className="section-title">
          <div className="container">
              <div className="section-content">
                  <h1>About Me</h1>
              </div>
          </div>
      </section>

      <section id="about-me" className="article-wrapper flex align-items-center" style={{ padding: 0 }}>
          <div className="container content">
              <div className="row justify-center">
                  <article className="col-lg-8 col-md-10 col-12">
                      <p>I am <strong>Abdulbosit Alijonov</strong>, a <strong>Backend Developer</strong> from Uzbekistan.</p>

                      <p>I specialize in building backend systems using Python and PHP, along with modern web technologies, with a strong
                          focus on efficiency, simplicity, and reliability.</p>

                      <p>I have hands-on experience in developing REST APIs, Telegram bots, and integrating payment systems. I
                          enjoy solving complex backend problems and optimizing systems for better performance.</p>

                      <p>Beyond coding, I actively share knowledge through tutorials, blog posts, and personal projects. I
                          believe in continuous learning and constantly improving my skills.</p>

                      <p>While my primary focus is backend development, I also have experience with frontend technologies
                          including HTML, CSS, Bootstrap, TailwindCSS, and JavaScript.</p>

                      <p>You can connect with me and follow my latest updates on my{' '}
                          <a href="https://t.me/abdulbosit_alijonov" target="_blank" rel="noreferrer">Telegram Channel</a>.
                      </p>
                  </article>
              </div>
          </div>
      </section>

      <div className="progress-bar">
          <div className="bar" style={{ width: `${scrollProgress}%` }}></div>
      </div>
    </>
  );
};

export default About;
