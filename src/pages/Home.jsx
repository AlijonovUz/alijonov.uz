import React from 'react';
import { Link } from 'react-router-dom';
import profilePic from '../assets/images/alijonov.jpg';
import useStaggerAnimation from '../hooks/useStaggerAnimation';

const Home = ({ socialLinks }) => {
  const animRef = useStaggerAnimation();

  return (
    <section id="home" className="flex align-items-center">
        <div className="container">
            <div className="row justify-between">
                <div className="col-xl-8 col-lg-10 col-12 stagger-animation" ref={animRef}>
                    <div className="about flex align-items-center">
                        <img className="anim-item profile-picture align-self-start" src={profilePic} alt="Abdulbosit" />
                        <div className="about-detail anim-item">
                            <h1 className="title">Abdulbosit Alijonov</h1>
                             <h3 className="desc">Backend developer</h3>
                            <div className="social-links flex align-items-center">
                                {socialLinks && socialLinks.map(link => (
                                    <a key={link.platform} target="_blank" href={link.url} rel="noreferrer">
                                        <img src={new URL(`../assets/icons/${link.platform}.svg`, import.meta.url).href} width="22" alt={link.platform} />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="detail">
                        <p className="size-big anim-item">I write about non-technical stuff in the technical world.</p>
                        <div className="btns-wrapper anim-item">
                            <Link to="/blog" className="btn btn-primary">Read Blog</Link>
                            <Link to="/about" className="btn btn-secondary">About Me</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
  );
};

export default Home;
