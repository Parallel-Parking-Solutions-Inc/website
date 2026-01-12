import React, { useState, useRef, useEffect, useCallback } from 'react';
import './Home.css';
import LoadingLogo from '../components/LoadingLogo';
import TrustBadges from '../components/TrustBadges';
import FeatureGrid from '../components/FeatureGrid';
import Ecosystem from '../components/Ecosystem';
import Setup from '../components/Setup';
import Hero from '../components/Hero';
import { useScrollToSection } from '../hooks/useScrollToSection';

const Home: React.FC = () => {
  const [pageLoading, setPageLoading] = useState(true);
  const [heroReady, setHeroReady] = useState(false);
  // Demo video and tutorial videos are disabled to avoid loading large media assets.
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'desktop'>('desktop');
  // Tutorial thumbnails and arrows are disabled to avoid loading tutorial assets
  const [notificationVisible, setNotificationVisible] = useState(false);
  // videoRef disabled because demo video section is commented out
  const notificationRef = useRef<HTMLDivElement>(null);
  const { scrollToSection } = useScrollToSection();

  // Stable callback for Hero to prevent re-renders when sidebar toggles
  const handleHeroReady = useCallback(() => {
    setHeroReady(true);
  }, []);

  useEffect(() => {
    if (heroReady) {
      setPageLoading(false);
    }
  }, [heroReady]);

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

  // Tutorial thumbnails and scroll arrows are disabled to avoid loading tutorial assets

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

  // Animate sections on scroll
  useEffect(() => {
    const sections = document.querySelectorAll('.home-section');
    const animationObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Add a small delay for staggered effect
            setTimeout(() => {
              entry.target.classList.add('animate-in');
            }, 50);
            // Stop observing once animation has been triggered
            animationObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    sections.forEach((section) => {
      animationObserver.observe(section);
    });

    return () => {
      sections.forEach((section) => {
        animationObserver.unobserve(section);
      });
    };
  }, []);

  // Animate operator screenshots and app content independently
  useEffect(() => {
    const animatableElements = document.querySelectorAll('.operator-screenshots, .app-hero-content');
    const elementObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('animate-in');
            }, 50);
            elementObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    animatableElements.forEach((element) => {
      elementObserver.observe(element);
    });

    return () => {
      animatableElements.forEach((element) => {
        elementObserver.unobserve(element);
      });
    };
  }, []);

  // scrollToEnd disabled because tutorial thumbnails are disabled

  // play/pause and video load handlers removed because demo video is disabled

  // Video modal functions disabled because tutorial videos are not rendered

  return (
    <div className="home-page">
      {(
        <div className={`page-loading-overlay ${pageLoading ? 'page-loading-overlay--visible' : 'page-loading-overlay--hidden'}`}>
          <LoadingLogo text="" />
        </div>
      )}
      <div className="home-page-container">
        <div className="home-content">
          {/* Section 1: Hero */}
          <section id="hero">
            <Hero onIntroReady={handleHeroReady} />
          </section>

          {/* Section 2: Setup */}
          <section className="home-section home-section-centered" id="setup">
            <h2>Setup everything. In minutes.</h2>
            <p>Let parallel do the heavy lifting, simple setup, then sitback, and relax.</p>
            <Setup />
          </section>

          {/* Section 3: Ecosystem (moved after Setup) */}
          <section className="home-section home-section-centered" id="ecosystem">
            <h2>One platform. One ecosystem.</h2>
            <p>Let parallel do the heavy lifting, simple setup, then sitback, and relax.</p>
            <Ecosystem animateOnVisible={true} />
          </section>

          {/* Section 4: Trust Badges (moved after Ecosystem) */}
          <section className="home-section home-section-centered" id="trust-badges">
            <h2>Trusted by parking lots worldwild.</h2>
            <TrustBadges />
          </section>

          {/* Section 5: Operator Portal (includes Feature Grid) */}
          <section className="home-section home-section-centered" id="operator-portal">
              <div className="operator-feature-grid">
                <h2>Everything you need to manage your lot. All powered by AI.</h2>
                <FeatureGrid />
              </div>
            <h2 className="operator-main-title">The most powerful tool in parking.</h2>
            <p>
              Parallel Operator provides real-time analytics, management controls, access governance, and AI to maximize performance.
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

              {/* Operator Tutorials disabled to avoid loading tutorial assets */}
              {/**
               * Operator Tutorials are intentionally disabled to prevent loading
               * tutorial thumbnails and video assets. If you want to re-enable
               * them later, uncomment the block below and remove these comments.
               */}
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

          {/* Demo video section disabled to avoid loading large video asset.
             To re-enable: restore the section and related handlers above. */}
        </div>
      </div>

      {/* YoutubeVideoModal is disabled to avoid loading YouTube iframe or tutorial assets.
          If you want to re-enable video modals later, restore the related state,
          functions and import at the top of this file. */}
    </div>
  );
};

export default Home;
