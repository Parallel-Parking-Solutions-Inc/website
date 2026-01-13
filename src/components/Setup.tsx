import React, { useState, useEffect, useRef } from 'react';
import './Setup.css';

// Button interface
interface SetupButton {
  label: string;
  url: string;
  style: 'primary' | 'secondary';
}

// Chip interface
interface SetupChip {
  icon?: string;
  label: string;
}

// Text typer interface
interface SetupTextTyper {
  messages: string[];
}

// Area interfaces
interface SetupMediaArea {
  gridArea: string;
  type: 'media';
  video?: string;
  videoZoom?: number;
  video_zoom?: number;
}

interface SetupTextArea {
  gridArea: string;
  type: 'text';
  backgroundColor?: string;
  header?: string;
  text?: string;
  secondaryText?: string;
  button?: SetupButton;
  secondaryButton?: SetupButton;
  chips?: SetupChip[];
  logos?: string[];
  textTyper?: SetupTextTyper;
}

type SetupArea = SetupMediaArea | SetupTextArea;

interface SetupSlide {
  layout: string;
  areas: SetupArea[];
}

interface SetupTab {
  id: string;
  label: string;
}

interface SetupData {
  tabs: SetupTab[];
  slides: Record<string, SetupSlide>;
}

// TextTyper component for typewriter effect
const TextTyper: React.FC<{ messages: string[] }> = ({ messages }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (messages.length === 0) return;

    const currentMessage = messages[currentIndex];

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (displayedText.length < currentMessage.length) {
          setDisplayedText(currentMessage.slice(0, displayedText.length + 1));
        } else {
          // Finished typing, wait then start deleting
          setTimeout(() => setIsDeleting(true), 1500);
        }
      } else {
        // Deleting
        if (displayedText.length > 0) {
          setDisplayedText(displayedText.slice(0, -1));
        } else {
          // Finished deleting, move to next message
          setIsDeleting(false);
          setCurrentIndex((prev) => (prev + 1) % messages.length);
        }
      }
    }, isDeleting ? 30 : 50);

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, currentIndex, messages]);

  return (
    <div className="setup-text-typer">
      <span>{displayedText}</span>
      <span className="setup-text-typer-cursor">|</span>
    </div>
  );
};

interface SetupProps {
  onFirstVideoReady?: () => void;
  startDeferredPreload?: boolean;
}

const Setup: React.FC<SetupProps> = ({ onFirstVideoReady, startDeferredPreload = false }) => {
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [activeTab, setActiveTab] = useState<string>('');
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({});
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [expandedVideoSrc, setExpandedVideoSrc] = useState<string | null>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const videoRef = useRef<HTMLVideoElement>(null);
  const expandedVideoRef = useRef<HTMLVideoElement>(null);
  const firstVideoReadyRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSetupVisible, setIsSetupVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Load setup data from JSON
  useEffect(() => {
    fetch('/assets/setup/setup.json')
      .then((response) => response.json())
      .then((data: SetupData) => {
        setSetupData(data);
        if (data.tabs.length > 0) {
          setActiveTab(data.tabs[0].id);
        }
      })
      .catch((error) => {
        console.error('Failed to load setup data:', error);
      });
  }, []);

  useEffect(() => {
    if (!setupData || firstVideoReadyRef.current) return;
    const hasVideo = Object.keys(setupData.slides).some(key => {
      const slide = setupData.slides[key];
      return slide.areas.some((area: SetupArea) => area.type === 'media' && (area as SetupMediaArea).video);
    });
    if (!hasVideo) {
      firstVideoReadyRef.current = true;
      onFirstVideoReady?.();
    }
  }, [setupData, onFirstVideoReady]);

  // Update indicator position when active tab changes
  useEffect(() => {
    if (activeTab && tabRefs.current[activeTab]) {
      const tabElement = tabRefs.current[activeTab];
      if (tabElement) {
        setIndicatorStyle({
          left: tabElement.offsetLeft,
          width: tabElement.offsetWidth,
        });
      }
    }
  }, [activeTab, setupData]);

  // Handle window resize for indicator recalculation
  useEffect(() => {
    const handleResize = () => {
      if (activeTab && tabRefs.current[activeTab]) {
        const tabElement = tabRefs.current[activeTab];
        if (tabElement) {
          setIndicatorStyle({
            left: tabElement.offsetLeft,
            width: tabElement.offsetWidth,
          });
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTab]);

  // Reset video playing state when tab changes
  useEffect(() => {
    setIsVideoPlaying(true);
  }, [activeTab]);

  useEffect(() => {
    const updateIsMobile = () => setIsMobile(window.matchMedia('(max-width: 768px)').matches);
    updateIsMobile();
    window.addEventListener('resize', updateIsMobile);
    return () => window.removeEventListener('resize', updateIsMobile);
  }, []);

  // Only mark the setup as visible once it's on screen
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          setIsSetupVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.35 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Preload remaining tab videos after page loading is complete
  useEffect(() => {
    if (!startDeferredPreload || !setupData) return;

    const preloadRemainingVideos = async () => {
      // Get all video URLs from setup data
      const allVideos: string[] = [];
      Object.keys(setupData.slides).forEach((key) => {
        const slide = setupData.slides[key];
        slide.areas.forEach((area) => {
          if (area.type === 'media' && (area as SetupMediaArea).video) {
            allVideos.push((area as SetupMediaArea).video as string);
          }
        });
      });

      // Get the first video (already loaded)
      const firstTabId = setupData.tabs[0]?.id;
      const firstSlide = firstTabId ? setupData.slides[firstTabId] : null;
      const firstVideo = firstSlide?.areas.find(
        (area) => area.type === 'media' && (area as SetupMediaArea).video
      );
      const firstVideoSrc = firstVideo ? (firstVideo as SetupMediaArea).video : null;

      // Preload remaining videos (excluding the first one)
      const videosToPreload = allVideos.filter((v) => v !== firstVideoSrc);

      await Promise.all(
        videosToPreload.map(
          (src) =>
            new Promise<void>((resolve) => {
              const video = document.createElement('video');
              video.preload = 'auto';
              video.muted = true;
              video.src = src;
              video.oncanplaythrough = () => {
                video.remove();
                resolve();
              };
              video.onerror = () => {
                video.remove();
                resolve(); // Don't fail the whole preload on single error
              };
              video.load();
            })
        )
      );
    };

    // Small delay to let the page render first
    const timer = setTimeout(preloadRemainingVideos, 150);
    return () => clearTimeout(timer);
  }, [startDeferredPreload, setupData]);

  const handleTabClick = (tabId: string) => {
    setUserHasInteracted(true);
    setActiveTab(tabId);
  };

  const handleButtonClick = () => {
    setUserHasInteracted(true);
  };

  const handleVideoEnded = () => {
    if (!userHasInteracted && setupData) {
      // Auto-advance to next tab
      const currentIndex = setupData.tabs.findIndex(tab => tab.id === activeTab);
      const nextIndex = (currentIndex + 1) % setupData.tabs.length;
      setActiveTab(setupData.tabs[nextIndex].id);
    }
  };

  const toggleVideoPlayPause = () => {
    const targetVideo = expandedVideoSrc ? expandedVideoRef.current : videoRef.current;
    if (targetVideo) {
      if (isVideoPlaying) {
        targetVideo.pause();
      } else {
        targetVideo.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const openExpandedVideo = (videoSrc?: string) => {
    if (!videoSrc) return;
    if (videoRef.current) {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    }
    setExpandedVideoSrc(videoSrc);
    setIsVideoPlaying(true);
  };

  // Play/pause the primary video based on visibility to avoid autoplaying off-screen
  useEffect(() => {
    const targetVideo = expandedVideoSrc ? expandedVideoRef.current : videoRef.current;
    if (!targetVideo) return;

    if (isSetupVisible) {
      targetVideo.play().then(() => setIsVideoPlaying(true)).catch(() => {});
    } else {
      targetVideo.pause();
      setIsVideoPlaying(false);
    }
  }, [isSetupVisible, expandedVideoSrc]);

  const closeExpandedVideo = () => {
    setExpandedVideoSrc(null);
    setIsVideoPlaying(true);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeExpandedVideo();
      }
    };

    if (expandedVideoSrc) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [expandedVideoSrc]);

  const renderMediaArea = (area: SetupMediaArea, index: number) => {
    const videoZoom = area.videoZoom ?? area.video_zoom ?? 100;
    const videoStyle: React.CSSProperties | undefined =
      videoZoom !== 100 ? { transform: `scale(${videoZoom / 100})` } : undefined;
    const isExpanded = expandedVideoSrc === area.video;

    const areaStyle: React.CSSProperties = {
      gridArea: area.gridArea,
    };

    const handleFirstVideoLoaded = () => {
      if (!firstVideoReadyRef.current) {
        firstVideoReadyRef.current = true;
        onFirstVideoReady?.();
      }
    };

    const handleFirstVideoError = () => {
      if (!firstVideoReadyRef.current) {
        firstVideoReadyRef.current = true;
        onFirstVideoReady?.();
      }
    };

    return (
      <div
        key={index}
        className="setup-area setup-area-media"
        style={areaStyle}
      >
        {area.video ? (
          <>
            <video
              ref={videoRef}
              className="setup-video"
              style={videoStyle}
              autoPlay={isSetupVisible}
              muted
              loop={userHasInteracted}
              playsInline
              onCanPlayThrough={handleFirstVideoLoaded}
              onError={handleFirstVideoError}
              onEnded={handleVideoEnded}
            >
              <source src={area.video} type="video/mp4" />
            </video>
            <div className="setup-video-controls">
              <button
                className="setup-video-control-btn"
                onClick={toggleVideoPlayPause}
                aria-label={isVideoPlaying ? "Pause video" : "Play video"}
              >
                {isVideoPlaying ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="6" y="4" width="4" height="16" fill="white" />
                    <rect x="14" y="4" width="4" height="16" fill="white" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5v14l11-7z" fill="white" />
                  </svg>
                )}
              </button>
              <button
                className="setup-video-zoom-btn"
                onClick={() => openExpandedVideo(area.video)}
                aria-label={isExpanded ? "Shrink video" : "Expand video"}
              >
                <img
                  src={isExpanded ? "/assets/setup/shrink_video.svg" : "/assets/setup/expand_video.svg"}
                  alt=""
                  className="setup-video-icon"
                />
              </button>
            </div>
          </>
        ) : (
          <div className="setup-media-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <polygon points="10,8 16,12 10,16" />
            </svg>
            <span>Video placeholder</span>
          </div>
        )}
      </div>
    );
  };

  const renderTextArea = (area: SetupTextArea, index: number) => {
    const areaStyle: React.CSSProperties = {
      gridArea: area.gridArea,
      ...(area.backgroundColor && { backgroundColor: area.backgroundColor }),
    };

    return (
      <div
        key={index}
        className="setup-area setup-area-text"
        style={areaStyle}
      >
        {/* Header */}
        {area.header && <h4 className="setup-text-header">{area.header}</h4>}

        {/* Body text */}
        {area.text && <p className="setup-text-body">{area.text}</p>}

        {/* Logos */}
        {area.logos && area.logos.length > 0 && (
          <div className="setup-logos">
            {area.logos.map((logo, i) => (
              <img key={i} src={logo} alt="" className="setup-logo" />
            ))}
          </div>
        )}

        {/* Primary Button */}
        {area.button && (
          <a
            href={area.button.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`setup-btn setup-btn-${area.button.style}`}
            onClick={handleButtonClick}
          >
            <span>{area.button.label}</span>
            <span className="legal-nav-arrow" aria-hidden="true">→</span>
          </a>
        )}

        {/* Secondary text */}
        {area.secondaryText && (
          <p className="setup-text-body setup-text-secondary">{area.secondaryText}</p>
        )}

        {/* Secondary Button */}
        {area.secondaryButton && (
          <a
            href={area.secondaryButton.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`setup-btn setup-btn-${area.secondaryButton.style}`}
            onClick={handleButtonClick}
          >
            <span>{area.secondaryButton.label}</span>
            <span className="legal-nav-arrow" aria-hidden="true">→</span>
          </a>
        )}

        {/* Chips */}
        {area.chips && area.chips.length > 0 && (
          <div className="setup-chips">
            {area.chips.map((chip, i) => (
              <div key={i} className="setup-chip">
                {chip.icon && <img src={chip.icon} alt="" className="setup-chip-icon" />}
                <span>{chip.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Text Typer */}
        {area.textTyper && <TextTyper messages={area.textTyper.messages} />}
      </div>
    );
  };

  const renderArea = (area: SetupArea, index: number) => {
    if (area.type === 'media') {
      return renderMediaArea(area as SetupMediaArea, index);
    }
    return renderTextArea(area as SetupTextArea, index);
  };

  const getTabLabel = (tab: SetupTab) => {
    if (!isMobile) return tab.label;
    switch (tab.id) {
      case 'purchase':
        return 'Buy';
      case 'install':
        return 'Install';
      case 'manage':
        return 'Manage';
      case 'analytics':
        return 'Analytics';
      case 'ai-agents':
        return 'AI';
      default:
        return tab.label;
    }
  };

  if (!setupData) {
    return (
      <div className="setup-container" ref={containerRef}>
        <div className="setup-loading">Loading setup...</div>
      </div>
    );
  }

  const currentSlide = setupData.slides[activeTab];

  return (
    <div className="setup-container" ref={containerRef}>
      {/* Tab Navigation Bar */}
      <div className="setup-tabs-wrapper">
        <div className="setup-tabs">
          <div className="setup-tab-indicator" style={indicatorStyle} />
          {setupData.tabs.map((tab) => (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[tab.id] = el;
              }}
              className={`setup-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabClick(tab.id)}
            >
              <span className="setup-tab-label">{getTabLabel(tab)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Slide Content */}
      <div className="setup-slides-container">
        {currentSlide && (
          <div
            className={`setup-slide setup-slide-${currentSlide.layout}`}
            key={activeTab}
          >
            <div className="setup-grid">
              {currentSlide.areas.map((area, index) => renderArea(area, index))}
            </div>
          </div>
        )}
      </div>

      {expandedVideoSrc && (
        <div className="setup-video-modal" onClick={closeExpandedVideo} role="dialog" aria-modal="true">
          <div className="setup-video-modal-content" onClick={(e) => e.stopPropagation()}>
            <video
              ref={expandedVideoRef}
              className="setup-video-modal-player"
              src={expandedVideoSrc}
              autoPlay
              muted
              loop
              playsInline
            />
            <div className="setup-video-modal-controls">
              <button
                className="setup-video-control-btn"
                onClick={toggleVideoPlayPause}
                aria-label={isVideoPlaying ? "Pause video" : "Play video"}
              >
                {isVideoPlaying ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="6" y="4" width="4" height="16" fill="white" />
                    <rect x="14" y="4" width="4" height="16" fill="white" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5v14l11-7z" fill="white" />
                  </svg>
                )}
              </button>
              <button
                className="setup-video-zoom-btn"
                onClick={closeExpandedVideo}
                aria-label="Shrink video"
              >
                <img src="/assets/setup/shrink_video.svg" alt="" className="setup-video-icon" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Setup;
