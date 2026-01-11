import React, { useState, useEffect, useRef, useCallback } from 'react';
import LoadingLogo from './LoadingLogo';
import './Hero.css';

// TypeScript interfaces for hero.json structure
interface HeroSettings {
  typewriterSpeedMs: number;
  typewriterHoldMs: number;
  blurFadeDurationMs: number;
  deviceRaiseDurationMs: number;
  deviceLowerDurationMs: number;
  sequenceTransitionMs: number;
}

interface HeroContent {
  heroHeading: string;
  heroDescription: string;
  questionText: string;
  parkAgainButtonText: string;
}

interface HeroQuestion {
  id: number;
  label: string;
  finalStatement: string;
}

interface SequenceStep {
  type: 'background' | 'ipad' | 'iphone';
  action: 'play' | 'raise' | 'lower' | 'video_ended';
  src?: string;
  start: 'immediate' | 'with_previous' | 'after_previous' | 'after_delay';
  delay: number;
}

interface Sequence {
  preloadVideos: string[];
  steps: SequenceStep[];
}

interface HeroAssets {
  basePath: string;
  introVideo: string;
  backgroundVideos: string[];
  deviceVideos: string[];
  deviceImages: {
    ipad: string;
    iphone: string;
  };
}

interface HeroData {
  settings: HeroSettings;
  content: HeroContent;
  questions: HeroQuestion[];
  sequences: Record<string, Sequence>;
  assets: HeroAssets;
}

type HeroPhase =
  | 'initial'
  | 'ready'
  | 'intro'
  | 'question'
  | 'loading_sequence'
  | 'playing_sequence'
  | 'lowering_devices'
  | 'typewriter'
  | 'fading_typewriter'
  | 'complete';

interface DeviceState {
  visible: boolean;
  raised: boolean;
  videoSrc: string | null;
}

const Hero: React.FC = () => {
  // State
  const [heroData, setHeroData] = useState<HeroData | null>(null);
  const [phase, setPhase] = useState<HeroPhase>('initial');
  const [, setSelectedQuestion] = useState<number | null>(null);
  const [typewriterText, setTypewriterText] = useState('');
  const [ipadState, setIpadState] = useState<DeviceState>({ visible: false, raised: false, videoSrc: null });
  const [iphoneState, setIphoneState] = useState<DeviceState>({ visible: false, raised: false, videoSrc: null });
  const [currentBackgroundSrc, setCurrentBackgroundSrc] = useState<string>('');

  // Refs
  const backgroundVideoRef = useRef<HTMLVideoElement>(null);
  const ipadVideoRef = useRef<HTMLVideoElement>(null);
  const iphoneVideoRef = useRef<HTMLVideoElement>(null);
  const videoEndResolvers = useRef<Map<string, () => void>>(new Map());
  const preloadedVideos = useRef<Set<string>>(new Set());
  const isSequenceRunning = useRef(false);

  // Load hero.json on mount
  useEffect(() => {
    const loadHeroData = async () => {
      try {
        const response = await fetch('/assets/hero/hero.json');
        const data: HeroData = await response.json();
        setHeroData(data);
        setCurrentBackgroundSrc(`${data.assets.basePath}${data.assets.introVideo}`);
      } catch (error) {
        console.error('Failed to load hero data:', error);
      }
    };
    loadHeroData();
  }, []);

  // Preload initial video and set to first frame
  useEffect(() => {
    if (!heroData || !backgroundVideoRef.current) return;

    const video = backgroundVideoRef.current;

    const handleCanPlay = () => {
      video.currentTime = 0;
      video.pause();
      setPhase('ready');
    };

    video.addEventListener('canplaythrough', handleCanPlay, { once: true });
    video.load();

    return () => {
      video.removeEventListener('canplaythrough', handleCanPlay);
    };
  }, [heroData]);

  // Listen for first user interaction when ready
  useEffect(() => {
    if (phase !== 'ready') return;

    const handleInteraction = () => {
      setPhase('intro');
      backgroundVideoRef.current?.play();
    };

    const events = ['mousemove', 'scroll', 'click', 'touchstart', 'keydown'];
    events.forEach(e => window.addEventListener(e, handleInteraction, { once: true, passive: true }));

    return () => {
      events.forEach(e => window.removeEventListener(e, handleInteraction));
    };
  }, [phase]);

  // Handle intro video ended
  const handleIntroVideoEnded = useCallback(() => {
    if (phase === 'intro') {
      // Keep video on last frame
      backgroundVideoRef.current?.pause();
      setPhase('question');
    }
  }, [phase]);

  // Video preloader utility
  const preloadVideo = useCallback((src: string, basePath: string): Promise<void> => {
    const fullSrc = `${basePath}${src}`;

    if (preloadedVideos.current.has(fullSrc)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'auto';
      video.muted = true;
      video.playsInline = true;
      video.src = fullSrc;

      const handleCanPlay = () => {
        preloadedVideos.current.add(fullSrc);
        video.remove();
        resolve();
      };

      const handleError = () => {
        console.error(`Failed to preload video: ${fullSrc}`);
        video.remove();
        reject(new Error(`Failed to load ${src}`));
      };

      video.addEventListener('canplaythrough', handleCanPlay, { once: true });
      video.addEventListener('error', handleError, { once: true });
      video.load();
    });
  }, []);

  const preloadVideos = useCallback(async (videos: string[], basePath: string): Promise<void> => {
    await Promise.all(videos.map(v => preloadVideo(v, basePath)));
  }, [preloadVideo]);

  // Wait for device video to end
  const waitForDeviceVideoEnd = useCallback((deviceType: 'ipad' | 'iphone'): Promise<void> => {
    return new Promise((resolve) => {
      videoEndResolvers.current.set(deviceType, resolve);
    });
  }, []);

  // Device video ended handlers
  const handleIpadVideoEnded = useCallback(() => {
    const resolver = videoEndResolvers.current.get('ipad');
    if (resolver) {
      resolver();
      videoEndResolvers.current.delete('ipad');
    }
  }, []);

  const handleIphoneVideoEnded = useCallback(() => {
    const resolver = videoEndResolvers.current.get('iphone');
    if (resolver) {
      resolver();
      videoEndResolvers.current.delete('iphone');
    }
  }, []);

  // Delay utility
  const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

  // Typewriter animation
  const runTypewriter = useCallback(async (text: string, speedMs: number): Promise<void> => {
    setTypewriterText('');
    for (let i = 0; i <= text.length; i++) {
      setTypewriterText(text.slice(0, i));
      await delay(speedMs);
    }
  }, []);

  // Execute a single step
  const executeStep = useCallback(async (step: SequenceStep, basePath: string): Promise<void> => {
    // Handle delay for after_delay start type
    if (step.start === 'after_delay' && step.delay > 0) {
      await delay(step.delay);
    }

    switch (step.type) {
      case 'background':
        if (step.action === 'play' && step.src) {
          const videoSrc = `${basePath}${step.src}`;
          setCurrentBackgroundSrc(videoSrc);
          // Wait a tick for src to update, then play
          await delay(50);
          if (backgroundVideoRef.current) {
            backgroundVideoRef.current.currentTime = 0;
            backgroundVideoRef.current.play();
          }
        }
        break;

      case 'ipad':
        if (step.action === 'raise' && step.src) {
          const videoSrc = `${basePath}${step.src}`;
          setIpadState({ visible: true, raised: true, videoSrc });
          // Wait for raise animation then play
          await delay(100);
          ipadVideoRef.current?.play();
        } else if (step.action === 'lower') {
          setIpadState(prev => ({ ...prev, raised: false }));
          await delay(heroData?.settings.deviceLowerDurationMs || 400);
          setIpadState({ visible: false, raised: false, videoSrc: null });
        } else if (step.action === 'video_ended') {
          await waitForDeviceVideoEnd('ipad');
        }
        break;

      case 'iphone':
        if (step.action === 'raise' && step.src) {
          const videoSrc = `${basePath}${step.src}`;
          setIphoneState({ visible: true, raised: true, videoSrc });
          await delay(100);
          iphoneVideoRef.current?.play();
        } else if (step.action === 'lower') {
          setIphoneState(prev => ({ ...prev, raised: false }));
          await delay(heroData?.settings.deviceLowerDurationMs || 400);
          setIphoneState({ visible: false, raised: false, videoSrc: null });
        } else if (step.action === 'video_ended') {
          await waitForDeviceVideoEnd('iphone');
        }
        break;
    }
  }, [heroData, waitForDeviceVideoEnd]);

  // Execute full sequence
  const executeSequence = useCallback(async (questionId: number) => {
    if (!heroData || isSequenceRunning.current) return;

    isSequenceRunning.current = true;
    setSelectedQuestion(questionId);

    const sequence = heroData.sequences[questionId.toString()];
    const question = heroData.questions.find(q => q.id === questionId);

    if (!sequence || !question) {
      isSequenceRunning.current = false;
      return;
    }

    // Show loading and preload videos
    setPhase('loading_sequence');
    try {
      await preloadVideos(sequence.preloadVideos, heroData.assets.basePath);
    } catch (error) {
      console.error('Failed to preload sequence videos:', error);
    }

    // Fade out blur and start sequence
    setPhase('playing_sequence');
    await delay(heroData.settings.blurFadeDurationMs);

    // Track which devices are raised during sequence
    let ipadIsRaised = false;
    let iphoneIsRaised = false;

    // Execute steps
    let i = 0;
    while (i < sequence.steps.length) {
      const step = sequence.steps[i];
      const nextStep = sequence.steps[i + 1];

      // Track device states
      if (step.type === 'ipad' && step.action === 'raise') ipadIsRaised = true;
      if (step.type === 'ipad' && step.action === 'lower') ipadIsRaised = false;
      if (step.type === 'iphone' && step.action === 'raise') iphoneIsRaised = true;
      if (step.type === 'iphone' && step.action === 'lower') iphoneIsRaised = false;

      // Check if next step should run with_previous
      if (nextStep && nextStep.start === 'with_previous') {
        // Track next step states too
        if (nextStep.type === 'ipad' && nextStep.action === 'raise') ipadIsRaised = true;
        if (nextStep.type === 'ipad' && nextStep.action === 'lower') ipadIsRaised = false;
        if (nextStep.type === 'iphone' && nextStep.action === 'raise') iphoneIsRaised = true;
        if (nextStep.type === 'iphone' && nextStep.action === 'lower') iphoneIsRaised = false;

        // Run current and next step in parallel
        await Promise.all([
          executeStep(step, heroData.assets.basePath),
          executeStep(nextStep, heroData.assets.basePath)
        ]);
        i += 2;
      } else {
        await executeStep(step, heroData.assets.basePath);
        i++;
      }
    }

    // Lower any raised devices BEFORE typewriter
    setPhase('lowering_devices');

    if (ipadIsRaised) {
      setIpadState(prev => ({ ...prev, raised: false }));
    }
    if (iphoneIsRaised) {
      setIphoneState(prev => ({ ...prev, raised: false }));
    }

    // Wait for lower animation
    if (ipadIsRaised || iphoneIsRaised) {
      await delay(heroData.settings.deviceLowerDurationMs + 200);
    }

    // Hide devices completely
    setIpadState({ visible: false, raised: false, videoSrc: null });
    setIphoneState({ visible: false, raised: false, videoSrc: null });

    // Show typewriter with blur overlay
    setPhase('typewriter');
    await delay(300); // Brief pause before typing
    await runTypewriter(question.finalStatement, heroData.settings.typewriterSpeedMs);

    // Hold for specified duration
    await delay(heroData.settings.typewriterHoldMs);

    // Fade out typewriter/blur
    setPhase('fading_typewriter');

    // Reset background to render_0 frame 1
    setCurrentBackgroundSrc(`${heroData.assets.basePath}${heroData.assets.introVideo}`);
    await delay(50);
    if (backgroundVideoRef.current) {
      backgroundVideoRef.current.currentTime = 0;
      backgroundVideoRef.current.pause();
    }

    // Wait for fade out
    await delay(heroData.settings.blurFadeDurationMs);

    // Show Park Again on top of video (no blur)
    setPhase('complete');
    isSequenceRunning.current = false;
  }, [heroData, preloadVideos, executeStep, runTypewriter]);

  // Handle question button click
  const handleQuestionClick = useCallback((questionId: number) => {
    executeSequence(questionId);
  }, [executeSequence]);

  // Reset to initial state (Park Again)
  const handleParkAgain = useCallback(() => {
    if (!heroData) return;

    // Reset all state
    setSelectedQuestion(null);
    setTypewriterText('');
    setIpadState({ visible: false, raised: false, videoSrc: null });
    setIphoneState({ visible: false, raised: false, videoSrc: null });
    setCurrentBackgroundSrc(`${heroData.assets.basePath}${heroData.assets.introVideo}`);

    // Reset video to first frame
    if (backgroundVideoRef.current) {
      backgroundVideoRef.current.currentTime = 0;
      backgroundVideoRef.current.pause();
    }

    // Back to ready state
    setPhase('ready');
  }, [heroData]);

  // Don't render until data is loaded
  if (!heroData) {
    return (
      <div className="hero">
        <div className="hero__loading">
          <LoadingLogo text="Loading..." />
        </div>
      </div>
    );
  }

  const showTextOverlay = phase === 'initial' || phase === 'ready' || phase === 'intro' || phase === 'complete';
  const showBlurOverlay = phase === 'question' || phase === 'loading_sequence' || phase === 'typewriter';
  const isFadingBlur = phase === 'fading_typewriter';
  const showQuestion = phase === 'question';
  const showLoading = phase === 'loading_sequence';
  const showTypewriter = phase === 'typewriter' || phase === 'fading_typewriter';
  const showParkAgain = phase === 'complete';

  return (
    <div className="hero">
      {/* Background Video Layer */}
      <div className="hero__video-layer">
        <video
          ref={backgroundVideoRef}
          className="hero__video"
          src={currentBackgroundSrc}
          muted
          playsInline
          onEnded={handleIntroVideoEnded}
        />
      </div>

      {/* Hero Text Overlay - visible during intro */}
      <div className={`hero__text-overlay ${showTextOverlay ? '' : 'hero__text-overlay--hidden'}`}>
        <h1 className="hero__heading">{heroData.content.heroHeading}</h1>
        <p className="hero__description">{heroData.content.heroDescription}</p>
      </div>

      {/* Device Mockups */}
      <div className="hero__devices">
        {/* iPad */}
        {ipadState.visible && (
          <div className={`hero__device hero__device--ipad ${ipadState.raised ? 'hero__device--raised' : 'hero__device--lowering'}`}>
            <div className="hero__device-screen">
              <video
                ref={ipadVideoRef}
                className="hero__device-video"
                src={ipadState.videoSrc || ''}
                muted
                playsInline
                onEnded={handleIpadVideoEnded}
              />
            </div>
            <img
              src={`${heroData.assets.basePath}${heroData.assets.deviceImages.ipad}`}
              alt="iPad"
              className="hero__device-frame"
            />
          </div>
        )}

        {/* iPhone */}
        {iphoneState.visible && (
          <div className={`hero__device hero__device--iphone ${iphoneState.raised ? 'hero__device--raised' : 'hero__device--lowering'}`}>
            <div className="hero__device-screen">
              <video
                ref={iphoneVideoRef}
                className="hero__device-video"
                src={iphoneState.videoSrc || ''}
                muted
                playsInline
                onEnded={handleIphoneVideoEnded}
              />
            </div>
            <img
              src={`${heroData.assets.basePath}${heroData.assets.deviceImages.iphone}`}
              alt="iPhone"
              className="hero__device-frame"
            />
          </div>
        )}
      </div>

      {/* Blur Overlay with Question/Typewriter */}
      <div className={`hero__blur-overlay ${showBlurOverlay ? 'hero__blur-overlay--visible' : ''} ${isFadingBlur ? 'hero__blur-overlay--fading' : ''}`}>
        {/* Loading State */}
        {showLoading && (
          <div className="hero__loading-content">
            <LoadingLogo text="Loading experience..." />
          </div>
        )}

        {/* Question Section */}
        {showQuestion && (
          <div className="hero__question">
            <h2 className="hero__question-text">{heroData.content.questionText}</h2>
            <div className="hero__question-buttons">
              {heroData.questions.map((q) => (
                <button
                  key={q.id}
                  className="hero__question-btn"
                  onClick={() => handleQuestionClick(q.id)}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Typewriter Section */}
        {showTypewriter && (
          <div className={`hero__typewriter ${isFadingBlur ? 'hero__typewriter--fading' : ''}`}>
            <p className="hero__typewriter-text">
              {typewriterText}
              <span className="hero__typewriter-cursor" />
            </p>
          </div>
        )}
      </div>

      {/* Park Again Button - directly on video, no blur */}
      {showParkAgain && (
        <div className="hero__park-again">
          <button
            className="hero__park-again-btn"
            onClick={handleParkAgain}
          >
            {heroData.content.parkAgainButtonText}
          </button>
        </div>
      )}
    </div>
  );
};

export default Hero;
