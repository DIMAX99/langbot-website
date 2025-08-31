import Head from "next/head";
import React, { useState, useEffect } from "react";
import styles from "../styles/Home.module.css";

const IndexPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const images = [
    "/images/slide1.jpg",
    "/images/slide2.jpg",
    "/images/slide3.jpg",
    "/images/slide4.jpg",
    "/images/slide5.jpg",
  ];

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <header className={styles.header}>
        <h1>LangBot</h1>
        <div className={styles.profileCircle}>
          <span>👤</span>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.heroSection}>
          <h1 className={styles.heroTitle}>
            Master Languages with AI
          </h1>
          <p className={styles.heroSubtitle}>
            Experience personalized language learning powered by advanced AI. 
            Interactive conversations, real-time feedback, and adaptive lessons 
            tailored to your learning style.
          </p>
        </section>

        <section className={styles.slideshow}>
          <div
            className={styles.slideshowInner}
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
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
              <div key={index} className={styles.slide}>
                <img src={src} alt={`Slide ${index + 1}`} />
              </div>
            ))}
          </div>
        </section>

        <section className={styles.languageCards}>
          {languageCards.map((card, index) => (
            <div
              key={index}
              className={styles.languageCard}
              style={{ backgroundColor: card.color }}
            >
              <h2>{card.name}</h2>
            </div>
          ))}
        </section>
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2023 LangBot. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default IndexPage;
