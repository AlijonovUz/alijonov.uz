import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import useStaggerAnimation from '../hooks/useStaggerAnimation';

const TELEGRAPH_TOKEN = import.meta.env.VITE_TELEGRAPH_TOKEN;

const BlogList = () => {
  const [blogsByYearMonth, setBlogsByYearMonth] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Blog - Abdulbosit Alijonov";

    const fetchPosts = async () => {
      try {

        const response = await axios.get(`https://api.telegra.ph/getPageList?access_token=${TELEGRAPH_TOKEN}&limit=100`);
        const pages = response.data.result.pages;

        const grouped = {};
        
        pages.forEach(page => {
          if (page.title.toLowerCase().includes("deleted") || page.title.toLowerCase() === "o'chirilgan" || page.title.toLowerCase() === "ochirilgan") {
            return;
          }

          const pathParts = page.path.split('-');
          let month = new Date().toLocaleString('en-US', { month: 'long' });
          let year = new Date().getFullYear().toString();
          let dateFormatted = `${new Date().getDate().toString().padStart(2, '0')} ${month}, ${year}`;
          
          if (pathParts.length >= 2) {
            const possibleMonth = parseInt(pathParts[pathParts.length - 2]);
            const possibleDay = parseInt(pathParts[pathParts.length - 1]);
            if (!isNaN(possibleMonth) && possibleMonth >= 1 && possibleMonth <= 12) {
              const date = new Date();
              date.setMonth(possibleMonth - 1);
              month = date.toLocaleString('en-US', { month: 'long' });
              if (!isNaN(possibleDay)) {
                dateFormatted = `${possibleDay} ${month}, ${year}`;
              }
            }
          }

          if (!grouped[year]) grouped[year] = {};
          if (!grouped[year][month]) grouped[year][month] = [];

          grouped[year][month].push({
            id: page.path,
            slug: page.path,
            title: page.title,
            description: page.description,
            dateFormatted
          });
        });

        setBlogsByYearMonth(grouped);
      } catch (error) {
        console.error("Error fetching Telegraph posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const years = Object.keys(blogsByYearMonth).sort((a, b) => b - a);

  const animRef = useStaggerAnimation([blogsByYearMonth]);

  return (
    <>
      <section className="section-title">
        <div className="container">
          <div className="section-content">
            <h1>Blog</h1>
          </div>
        </div>
      </section>

      <section className="flex align-items-start" style={{ minHeight: '80vh' }}>
        <div className="container">
          <div className="row justify-between align-top">
            <div id="archive" className="col-md-7 stagger-animation" ref={animRef}>

              {years.length > 0 ? (
                years.map(year => (
                  <React.Fragment key={year}>
                    <h4 className="sticky">{year}</h4>
                    {Object.keys(blogsByYearMonth[year]).map(month => (
                      <React.Fragment key={month}>
                        <h4>{month}</h4>
                        <ul className="list-wrapper">
                          {blogsByYearMonth[year][month].map(blog => (
                            <li key={blog.id}>
                              <Link className="list-item anim-item" to={`/blog/${blog.slug}`}>
                                <div className="date">{blog.dateFormatted}</div>
                                <div className="title" dangerouslySetInnerHTML={{ __html: blog.title }} />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </React.Fragment>
                    ))}
                  </React.Fragment>
                ))
              ) : !loading ? (
                <div className="no-blogs-message" style={{ padding: '15px', fontWeight: 'bold', textAlign: 'center', color: '#333' }}>
                  There are no current blogs.
                </div>
              ) : null}

            </div>

            <div className="subscribe-form col-md-4 sticky" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form">
              <h6>Obuna Bo'ling</h6>
              <p>
                Yangi maqola, maruza va darslarimni <a href="https://t.me/abdulbosit_alijonov" target="_blank" rel="noopener noreferrer">@abdulbosit_alijonov</a> telegram kanalimda topishingiz mumkin.
              </p>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default BlogList;
