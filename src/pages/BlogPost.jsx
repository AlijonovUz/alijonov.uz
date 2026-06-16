import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const TELEGRAPH_TOKEN = import.meta.env.VITE_TELEGRAPH_TOKEN;

const BlogPost = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prevPost, setPrevPost] = useState(null);
  const [nextPost, setNextPost] = useState(null);
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

  useEffect(() => {
    const fetchPostAndPagination = async () => {
      try {
        setLoading(true);
        // Fetch current post
        const response = await axios.get(`https://api.telegra.ph/getPage/${slug}?return_content=true`);
        if (response.data.ok) {
          const pageTitle = response.data.result.title.toLowerCase();
          if (pageTitle.includes('deleted') || pageTitle === "o'chirilgan" || pageTitle === "ochirilgan") {
            setBlog(null);
            setLoading(false);
            return;
          }

          setBlog(response.data.result);
          document.title = response.data.result.title + " - Abdulbosit Alijonov";

          // Fetch list to find previous and next
          const listResponse = await axios.get(`https://api.telegra.ph/getPageList?access_token=${TELEGRAPH_TOKEN}&limit=100`);
          if (listResponse.data.ok) {
            const pages = listResponse.data.result.pages.filter(page => {
              const t = page.title.toLowerCase();
              return !t.includes('deleted') && t !== "o'chirilgan" && t !== "ochirilgan";
            });
            const currentIndex = pages.findIndex(p => p.path === slug);

            if (currentIndex !== -1) {
              // Pages are ordered newest first.
              // So older post is at index + 1 (Previous chronologically)
              // Newer post is at index - 1 (Next chronologically)
              if (currentIndex < pages.length - 1) {
                setPrevPost(pages[currentIndex + 1]);
              } else {
                setPrevPost(null);
              }

              if (currentIndex > 0) {
                setNextPost(pages[currentIndex - 1]);
              } else {
                setNextPost(null);
              }
            }
          }
        } else {
          setBlog(null);
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPostAndPagination();
  }, [slug]);

  const renderNode = (node, index) => {
    if (typeof node === 'string') {
      return <React.Fragment key={index}>{node}</React.Fragment>;
    }
    const { tag, attrs, children } = node;
    const Tag = tag;

    const props = { ...attrs, key: index };
    if (props.class) {
      props.className = props.class;
      delete props.class;
    }

    if ((tag === 'img' || tag === 'iframe' || tag === 'video') && props.src && props.src.startsWith('/')) {
      props.src = 'https://telegra.ph' + props.src;
    }

    return (
      <Tag {...props}>
        {children ? children.map((child, i) => renderNode(child, i)) : null}
      </Tag>
    );
  };

  if (!loading && !blog) return <div style={{ textAlign: 'center', marginTop: '100px', minHeight: '80vh' }}>Article not found.</div>;

  return (
    <>
      <div className="progress-bar">
        <div className="bar" style={{ width: `${scrollProgress}%` }}></div>
      </div>

      <section className="flex align-items-start" style={{ minHeight: '80vh' }}>
        <div className="container">
          <div className="row article-wrapper justify-center align-top">
            <div className="article-header col-md-8">
              <h1 className="title">
                {loading ? <span style={{ opacity: 0.5 }}>Yuklanmoqda...</span> : <span dangerouslySetInnerHTML={{ __html: blog.title }} />}
              </h1>
              <div className="date">
                <span>
                  {loading ? "..." : (() => {
                    const pathParts = slug.split('-');
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
                          dateFormatted = `${possibleDay.toString().padStart(2, '0')} ${month}, ${year}`;
                        }
                      }
                    }
                    return dateFormatted;
                  })()}
                </span>
              </div>
            </div>

            <article className="content col-md-8 col-12">
              {loading ? (
                <p style={{ color: '#888' }}>Maqola mazmuni yuklanmoqda...</p>
              ) : (
                blog.content ? blog.content.map((node, i) => renderNode(node, i)) : null
              )}
            </article>

            <div className="div col-lg-7 col-md-8 col-12">
              <div className="subscribe-form " id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form">
                <h6>Obuna Bo'ling</h6>
                <p>
                  Yangi maqola, maruza va darslarimni <a href="https://t.me/abdulbosit_alijonov">@abdulbosit_alijonov</a> telegram kanalimda topishingiz mumkin.
                </p>
              </div>
            </div>

            <ul className="custom-pagination col-md-8 col-12">
              <div className="pagination-list row">
                <li className="col prev">
                  {prevPost && (
                    <Link to={`/blog/${prevPost.path}`} title={prevPost.title}>
                      &larr; Previous
                    </Link>
                  )}
                </li>
                <li className="col"><Link to="/blog">See More</Link></li>
                <li className="col next">
                  {nextPost && (
                    <Link to={`/blog/${nextPost.path}`} title={nextPost.title}>
                      Next &rarr;
                    </Link>
                  )}
                </li>
              </div>
            </ul>
          </div>
        </div>
      </section>

    </>
  );
};

export default BlogPost;
