import React, { useEffect, useState, useRef } from 'react';
import './TrustBadges.css';

type LogosData = {
  settings: {
    grayscale: boolean;
    speed: number;
    hover_speed: number;
  };
  logos: string[];
};

interface TrustBadgesProps {
  onReady?: () => void;
}

const TrustBadges: React.FC<TrustBadgesProps> = ({ onReady }) => {
  const [logos, setLogos] = useState<string[]>([]);
  const [settings, setSettings] = useState({
    grayscale: true,
    speed: 30,
    hover_speed: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const trackRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const positionRef = useRef<number>(0);
  const isHoveredRef = useRef<boolean>(false);
  const lastTimeRef = useRef<number>(0);
  const singleSetWidthRef = useRef<number>(0);
  const hasAnnouncedReadyRef = useRef<boolean>(false);
  const announceReady = () => {
    if (!hasAnnouncedReadyRef.current) {
      hasAnnouncedReadyRef.current = true;
      onReady?.();
    }
  };

  useEffect(() => {
    const loadLogos = async () => {
      try {
        const response = await fetch('/assets/logos/logos.json');
        if (!response.ok) throw new Error('Failed to load logos');
        const data: LogosData = await response.json();
        setLogos(data.logos || []);
        setSettings(data.settings || settings);
      } catch (error) {
        console.error('Unable to load trust badges:', error);
      } finally {
        setIsLoading(false);
        announceReady();
      }
    };
    loadLogos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!trackRef.current || logos.length === 0) return;

    const track = trackRef.current;

    // Calculate width after images load
    const calculateWidth = () => {
      const fullWidth = track.scrollWidth;
      singleSetWidthRef.current = fullWidth / 3;
      announceReady();
    };

    // Wait for images to load
    const images = track.querySelectorAll('img');
    let loadedCount = 0;

    const onImageLoad = () => {
      loadedCount++;
      if (loadedCount === images.length) {
        calculateWidth();
      }
    };

    images.forEach(img => {
      if (img.complete) {
        loadedCount++;
      } else {
        img.addEventListener('load', onImageLoad);
      }
    });

    if (loadedCount === images.length) {
      calculateWidth();
    }

    // Animation using requestAnimationFrame
    const animate = (currentTime: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = currentTime;
      }

      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      // Calculate width if not yet set
      if (singleSetWidthRef.current === 0) {
        singleSetWidthRef.current = track.scrollWidth / 3;
      }

      const singleSetWidth = singleSetWidthRef.current;

      if (singleSetWidth > 0) {
        // Calculate movement based on speed setting
        const currentSpeed = isHoveredRef.current ? settings.hover_speed : settings.speed;
        const pixelsPerSecond = currentSpeed > 0 ? singleSetWidth / currentSpeed : 0;
        const movement = (pixelsPerSecond * deltaTime) / 1000;

        // Update position
        positionRef.current -= movement;

        // Seamless loop: when we've scrolled past one full set,
        // reset by exactly one set width (this is invisible because sets are identical)
        while (positionRef.current <= -singleSetWidth) {
          positionRef.current += singleSetWidth;
        }

        // Apply transform
        track.style.transform = `translateX(${positionRef.current}px)`;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    // Hover handlers
    const handleMouseEnter = () => {
      isHoveredRef.current = true;
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
    };

    track.addEventListener('mouseenter', handleMouseEnter);
    track.addEventListener('mouseleave', handleMouseLeave);

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      track.removeEventListener('mouseenter', handleMouseEnter);
      track.removeEventListener('mouseleave', handleMouseLeave);
      images.forEach(img => {
        img.removeEventListener('load', onImageLoad);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.speed, settings.hover_speed, logos.length]);

  if (isLoading) {
    return null;
  }

  if (!logos || logos.length === 0) {
    return null;
  }

  return (
    <div
      className="trust-badges-wrapper"
      role="region"
      aria-label="Trusted partners"
    >
      <div
        ref={trackRef}
        className="trust-badges-track"
      >
        {/* Render logos three times for seamless infinite scroll */}
        {[...Array(3)].map((_, setIndex) => (
          <React.Fragment key={`set-${setIndex}`}>
            {logos.map((filename, index) => (
              <div key={`logo-${setIndex}-${index}`} className="trust-badge-item">
                <img
                  src={`/assets/logos/${filename}`}
                  alt={`Partner ${index + 1}`}
                  loading="eager"
                  style={{
                    filter: settings.grayscale ? 'grayscale(100%)' : 'none'
                  }}
                />
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default TrustBadges;
