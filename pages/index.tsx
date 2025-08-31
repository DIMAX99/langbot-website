import Head from "next/head";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import styles from "../styles/Home.module.css";

const Person3D = dynamic(() => import("../components/Person3DFixed"), {
  ssr: false,
  loading: () => (
    <div style={{ 
      width: '100%', 
      height: '400px', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '1.2rem',
      flexDirection: 'column',
      gap: '0.5rem'
    }}>
      <div>🤖</div>
      <div>Loading Avatar...</div>
    </div>
  )
});

const IndexPage = () => {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [user, setUser] = useState<any>(null);
  const images = [
    "/images/slide1.jpg",
    "/images/slide2.jpg",
    "/images/slide3.jpg",
    "/images/slide4.jpg",
    "/images/slide5.jpg",
  ];

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 4000); // Change image every 4 seconds
    return () => clearInterval(interval);
  }, [images.length]);

  const languageCards = [
    { name: "English", icon: "🇺🇸", description: "Master the global language" },
    { name: "Spanish", icon: "🇪🇸", description: "Speak with 500M+ people" },
    { name: "French", icon: "🇫🇷", description: "The language of romance" },
    { name: "German", icon: "🇩🇪", description: "Power of precision" },
    { name: "Japanese", icon: "🇯🇵", description: "Gateway to the East" },
    { name: "Italian", icon: "🇮🇹", description: "Art and culture language" },
  ];

  const handleSlideChange = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>LangBot - AI Language Tutor</title>
        <meta name="description" content="Master any language with AI-powered personalized tutoring. Interactive lessons, real-time feedback, and adaptive learning." />
        <meta name="keywords" content="language learning, AI tutor, multilingual, education" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className={styles.header}>
        <h1>LangBot</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ color: '#ffffff', fontSize: '0.9rem' }}>
                Welcome back, {user.name || user.email}
              </span>
              <button
                onClick={() => {
                  localStorage.removeItem('auth_token');
                  localStorage.removeItem('user');
                  setUser(null);
                }}
                style={{
                  background: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => router.push('/login')}
                style={{
                  background: '#6366f1',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                Login
              </button>
              <button
                onClick={() => router.push('/signup')}
                style={{
                  background: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                Sign Up
              </button>
            </div>
          )}
          <div className={styles.profileCircle}>
            <span>👤</span>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.heroSection}>
          <div className={styles.person3DContainer}>
            <Person3D />
          </div>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Master Languages with AI
            </h1>
            <p className={styles.heroSubtitle}>
              Experience personalized language learning powered by advanced AI.
              Interactive conversations, real-time feedback, and adaptive lessons
              tailored to your learning style.
            </p>
          </div>
        </section>

        <section className={styles.slideshow}>
          <div
            className={styles.slideshowInner}
            style={{ transform: `translateX(-${currentSlide * 20}%)` }}
          >
            {images.map((src, index) => (
              <div key={index} className={styles.slide}>
                <img src={src} alt={`Language learning experience ${index + 1}`} />
              </div>
            ))}
          </div>
          <div className={styles.slideIndicators}>
            {images.map((_, index) => (
              <button
                key={index}
                className={`${styles.indicator} ${index === currentSlide ? styles.active : ''}`}
                onClick={() => handleSlideChange(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </section>

        <section className={styles.languageCards}>
          {languageCards.map((card, index) => (
            <div
              key={index}
              className={styles.languageCard}
              onClick={() => router.push(`/chat?lang=${card.name}`)}
            >
              <div className={styles.languageIcon}>
                {card.icon}
              </div>
              <h2>{card.name}</h2>
              <p>{card.description}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2025 LangBot. Empowering global communication through AI.</p>
      </footer>
    </div>
  );
};

export default IndexPage;
