import React, { useState, useRef, useEffect } from 'react';
import './Home.css';
import LoadingLogo from '../components/LoadingLogo';
import YoutubeVideoModal from '../components/YoutubeVideoModal';
import TrustBadges from '../components/TrustBadges';
import FeatureGrid from '../components/FeatureGrid';
import Ecosystem from '../components/Ecosystem';
import Setup from '../components/Setup';
import Hero from '../components/Hero';
import { useScrollToSection } from '../hooks/useScrollToSection';

const Home: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<{ id: string; title: string } | null>(null);
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'desktop'>('desktop');
  const [showTutorialScrollArrow, setShowTutorialScrollArrow] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const tutorialThumbnailsRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const { scrollToSection } = useScrollToSection();

  // Handle navigation from other pages
  useEffect(() => {
    const sectionToScroll = sessionStorage.getItem('scrollToSection');
    const scrollToTutorials = sessionStorage.getItem('scrollToTutorials');

    if (sectionToScroll) {
      // Clear the stored section
      sessionStorage.removeItem('scrollToSection');
      // Wait for the page to be fully rendered, then scroll
      setTimeout(() => {
        scrollToSection(sectionToScroll);

        // If we need to scroll to tutorials, do that after scrolling to operator portal
        if (scrollToTutorials) {
          sessionStorage.removeItem('scrollToTutorials');
          setTimeout(() => {
            const tutorialsSection = document.querySelector('.operator-tutorials');
            if (tutorialsSection) {
              tutorialsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 500);
        }
      }, 200);
    }
  }, [scrollToSection]);

  // Detect device type
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setDeviceType('ios');
    } else if (/android/.test(userAgent)) {
      setDeviceType('android');
    } else {
      setDeviceType('desktop');
    }
  }, []);

  // Check if scroll arrows should be shown
  useEffect(() => {
    const checkScrollArrows = () => {
      if (tutorialThumbnailsRef.current) {
        const { scrollWidth, clientWidth } = tutorialThumbnailsRef.current;
        setShowTutorialScrollArrow(scrollWidth > clientWidth);
      }
    };

    checkScrollArrows();
    window.addEventListener('resize', checkScrollArrows);
    return () => window.removeEventListener('resize', checkScrollArrows);
  }, []);

  // Notification popup scroll animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setNotificationVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.5 }
    );

    if (notificationRef.current) {
      observer.observe(notificationRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const scrollToEnd = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollTo({
        left: ref.current.scrollWidth,
        behavior: 'smooth'
      });
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoLoad = () => {
    setIsVideoLoading(false);
  };

  const handleVideoError = () => {
    setIsVideoLoading(false);
  };

  const openVideoModal = (videoId: string, title: string) => {
    setCurrentVideo({ id: videoId, title });
    setModalOpen(true);
  };

  const closeVideoModal = () => {
    setModalOpen(false);
    setCurrentVideo(null);
  };

  return (
    <div className="home-page">
      <div className="home-page-container">
        <div className="home-content">
          {/* Section 1: Hero */}
          <section id="hero">
            <Hero />
          </section>

          {/* Section 2: Trust Badges */}
          <section className="home-section home-section-centered" id="trust-badges">
            <h2>Trusted by parking lots worldwild.</h2>
            <TrustBadges />
          </section>

          {/* Section 3: Ecosystem */}
          <section className="home-section home-section-centered" id="ecosystem">
            <h2>One platform. One ecosystem.</h2>
            <p>Let parallel do the heavy lifting, simple setup, then sitback, and relax.</p>
            <Ecosystem animateOnVisible={true} />
          </section>

          {/* Section 4: Setup */}
          <section className="home-section home-section-centered" id="setup">
            <h2>Setup everything. In minutes.</h2>
            <p>Let parallel do the heavy lifting, simple setup, then sitback, and relax.</p>
            <Setup />
          </section>

          {/* Section 5: Feature Grid */}
          <section className="home-section home-section-centered" id="feature-grid">
            <h2>Everything you need to manage your lot. All powered by AI.</h2>
            <FeatureGrid />
          </section>

          {/* Section 6: Operator Portal */}
          <section className="home-section home-section-centered" id="operator-portal">
            <h2>The most powerful tool in parking.</h2>
            <p>
              The Parallel Operator Portal provides comprehensive tools for managing parking operations, viewing analytics, and configuring your parking solutions. Access real-time data, manage user accounts, and optimize your parking lot performance.
            </p>
              <div className="operator-buttons">
                <a href="/contact" className="legal-nav-link">
                  Request a Demo
                  <span className="legal-nav-arrow">→</span>
                </a>
                <a href="https://operator.parkwithparallel.com" className="legal-nav-link">
                  <img src="/assets/Logo_Operator_Inline.svg" alt="Operator Logo" style={{ height: '16px' }} />
                  <span className="legal-nav-arrow">→</span>
                </a>
              </div>
              <div className="operator-screenshots">
                <img src="/assets/images/operator1.jpg" alt="Parallel Operator Portal Screenshot 1" />
              </div>
              <div className="home-highlight">
                <p>
                  If you already own Parallel and would like to manage your lot, visit the operator portal at{' '}
                  <a href="https://operator.parkwithparallel.com" className="home-link">operator.parkwithparallel.com</a>
                </p>
              </div>

              <div className="operator-tutorials">
                <h2>Operator Tutorials</h2>
                <p>
                  Tutorials on features of the operator portal and how to use them. Please note more tutorials are available within the web app itself.
                </p>
                <div className="tutorial-thumbnails-container">
                  <div className="tutorial-thumbnails" ref={tutorialThumbnailsRef}>
                    <div className="tutorial-thumbnail" onClick={() => openVideoModal('V2lEswZgZEw', 'Dashboard Tutorial')}>
                      <img src="/assets/images/tutorial_thumnail_dashboard.jpg" alt="Dashboard Tutorial" />
                      <div className="play-button-overlay">
                        <button className="play-button" aria-label="Play Dashboard Tutorial">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 5v14l11-7z" fill="white" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="tutorial-thumbnail" onClick={() => openVideoModal('D4K5Z3psYAI', 'Registry Tutorial')}>
                      <img src="/assets/images/tutorial_thumnail_registry.jpg" alt="Registry Tutorial" />
                      <div className="play-button-overlay">
                        <button className="play-button" aria-label="Play Registry Tutorial">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 5v14l11-7z" fill="white" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="tutorial-thumbnail" onClick={() => openVideoModal('HoAepPFQdG8', 'Advanced Settings Tutorial')}>
                      <img src="/assets/images/tutorial_thumnail_advanced.jpg" alt="Advanced Settings Tutorial" />
                      <div className="play-button-overlay">
                        <button className="play-button" aria-label="Play Advanced Settings Tutorial">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 5v14l11-7z" fill="white" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  {showTutorialScrollArrow && (
                    <button
                      className="scroll-arrow scroll-arrow-right"
                      onClick={() => scrollToEnd(tutorialThumbnailsRef)}
                      aria-label="Scroll to see more tutorials"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </section>

          {/* Section 7: Mobile App */}
          <section className="home-section" id="mobile-app">
            {/* App Hero */}
            <div className="app-hero-section">
              <h2>Parking that doesn't suck.</h2>
              <p className="app-hero-subtitle">
                Built to keep drivers informed. Not guessing.
                <br />
                Arrive on time, because you're not stressed about parking.
              </p>

              <div className="app-hero-content">
                {/* Left side: Phone mockup with notification popup */}
                <div className="app-hero-left" ref={notificationRef}>
                  <div className={`app-notification-popup ${notificationVisible ? 'visible' : ''}`}>
                    <img src="/assets/app_icon.png" alt="Parallel" className="notification-logo" />
                    <p>Drive in, Ding! All good to park. Full transparency to feel secure.</p>
                  </div>
                  <div className="app-phone-mockup">
                    <img src="/assets/images/app_hero.png" alt="Parallel App" />
                  </div>
                </div>

                {/* Right side: Content */}
                <div className="app-hero-right">
                  <h3>Drive in. Drive out.</h3>
                  <div className="app-hero-text">
                    <p>
                      Parking is unpredictable. It can make you late, lead to unexpected tickets, or leave you unsure if you are even allowed to be there. Parallel removes that uncertainty entirely.
                    </p>
                    <p>
                      Cameras automatically check you in when you arrive. All you have to do is check out. Accounts and billing can be fully automated. You have 48 hours to pay and we remind you, but parking is not free. If unpaid, your plate is flagged and future entries across Parallel lots may result in ticketing or towing. Pay once or enable autopay to stay clear.
                    </p>
                    <p>
                      Look for the blue check to know you are safe to park. Everything updates in real time so there are no hidden fees or surprises.
                    </p>
                  </div>
                  <div className="app-buttons">
                    {deviceType === 'ios' && (
                      <>
                        <a href="https://apps.apple.com/ca/app/parallel-mobile/id6751863179" className="app-store-btn" target="_blank" rel="noopener noreferrer">
                          <img src="/assets/app_ios_download.svg" alt="Download on the App Store" />
                        </a>
                        <a href="https://pay.parkwithparallel.com" className="app-store-btn" target="_blank" rel="noopener noreferrer">
                          <img src="/assets/app_web.svg" alt="Use on Web" />
                        </a>
                      </>
                    )}
                    {deviceType === 'android' && (
                      <>
                        <a href="https://play.google.com/store/apps/details?id=com.parkwithparallel.app" className="app-store-btn" target="_blank" rel="noopener noreferrer">
                          <img src="/assets/app_android_download.svg" alt="Get it on Google Play" />
                        </a>
                        <a href="https://pay.parkwithparallel.com" className="app-store-btn" target="_blank" rel="noopener noreferrer">
                          <img src="/assets/app_web.svg" alt="Use on Web" />
                        </a>
                      </>
                    )}
                    {deviceType === 'desktop' && (
                      <>
                        <a href="https://apps.apple.com/ca/app/parallel-mobile/id6751863179" className="app-store-btn" target="_blank" rel="noopener noreferrer">
                          <img src="/assets/app_ios_download.svg" alt="Download on the App Store" />
                        </a>
                        <a href="https://play.google.com/store/apps/details?id=com.parkwithparallel.app" className="app-store-btn" target="_blank" rel="noopener noreferrer">
                          <img src="/assets/app_android_download.svg" alt="Get it on Google Play" />
                        </a>
                        <a href="https://pay.parkwithparallel.com" className="app-store-btn" target="_blank" rel="noopener noreferrer">
                          <img src="/assets/app_web.svg" alt="Use on Web" />
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* App Features - existing content, do not modify */}
            <div className="app-features-section" id="app-features">
              <div className="app-hero-image">
                <img src="/assets/images/apphero.jpg" alt="Parallel App Features" />
              </div>
            </div>
          </section>

          {/* Section 9: Demo Video */}
          <section id="demo-video" className="home-section home-section-centered">
            <h2>Everything just works.</h2>
            <p>Drive in. Session Start. Alert User. Pay Bill. Collect Data.</p>
            <div className="hero-video-wrapper">
              <div className="hero-video-container">
                {isVideoLoading && (
                  <div className="video-loading-overlay">
                    <LoadingLogo text="Loading video..." />
                  </div>
                )}
                <video
                  ref={videoRef}
                  className="hero-video"
                  autoPlay
                  muted
                  loop
                  playsInline
                  poster="/assets/images/apphero.jpg"
                  onLoadedData={handleVideoLoad}
                  onError={handleVideoError}
                  style={{ opacity: isVideoLoading ? 0 : 1 }}
                >
                  <source src="/assets/images/all_video.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <button
                  className="video-control-btn"
                  onClick={togglePlayPause}
                  aria-label={isPlaying ? "Pause video" : "Play video"}
                  style={{ opacity: isVideoLoading ? 0 : 1 }}
                >
                  {isPlaying ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="6" y="4" width="4" height="16" fill="white" />
                      <rect x="14" y="4" width="4" height="16" fill="white" />
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 5v14l11-7z" fill="white" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {currentVideo && (
        <YoutubeVideoModal
          isOpen={modalOpen}
          onClose={closeVideoModal}
          videoId={currentVideo.id}
          title={currentVideo.title}
        />
      )}
    </div>
  );
};

export default Home;
