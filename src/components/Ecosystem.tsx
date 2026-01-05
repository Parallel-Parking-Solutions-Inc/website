import React, { useState, useEffect, useRef, useMemo } from 'react';
import './Ecosystem.css';

// Type definitions
interface EcosystemSettings {
  sequenceIntervalMs: number;
  minSequenceIntervalMs: number;
  maxSequenceIntervalMs: number;
  lineDrawDurationMs: number;
  pulseTravelDurationMs: number;
  labelFadeInMs: number;
  labelDisplayMs: number;
  labelFadeOutMs: number;
  simultaneousActions: boolean;
  randomizeSequences: boolean;
}

interface EcosystemComponent {
  id: string;
  label: string;
  image: string;
}

interface PathVariant {
  id: string;
  controlPoint: { x: number; y: number };
}

interface PathDefinition {
  from: string;
  to: string;
  variants: PathVariant[];
}

interface SequenceStep {
  path: string;
  label: string;
  delayMs: number;
}

interface Sequence {
  id: string;
  name: string;
  weight: number;
  steps: SequenceStep[];
}

interface EcosystemData {
  settings: EcosystemSettings;
  components: Record<string, EcosystemComponent>;
  paths: Record<string, PathDefinition>;
  sequences: Sequence[];
}

interface ActiveAnimation {
  id: string;
  pathKey: string;
  variantId: string;
  label: string;
  phase: 'drawing' | 'pulsing' | 'visible' | 'fading';
  startTime: number;
  pathD: string;
  pathLength: number;
  fromId: string;
  toId: string;
  labelPosition: { x: number; y: number };
}

interface EcosystemProps {
  showLabels?: boolean;
  enablePulse?: boolean;
  paused?: boolean;
  animateOnVisible?: boolean;
}

// Position configurations for each component (percentages)
const POSITION_CONFIG: Record<string, { left: number; top: number }> = {
  operator: { left: 15, top: 50 },
  backend: { left: 50, top: 25 },
  camera: { left: 50, top: 75 },
  app: { left: 85, top: 50 },
};

// Fine-tune where lines connect to each node (pixels)
const NODE_ANCHOR_OFFSETS: Record<string, { x: number; y: number }> = {
  camera: { x: 0, y: -30 },
  app: { x: -6, y: 0 },
};

// Label position offsets for different paths to avoid overlap
const LABEL_OFFSETS: Record<string, Array<{ x: number; y: number }>> = {
  'camera-backend': [{ x: 0, y: -15 }],
  'backend-operator': [{ x: 0, y: -25 }, { x: 0, y: 0 }, { x: 0, y: 25 }],
  'operator-backend': [{ x: 0, y: -30 }, { x: 0, y: 5 }, { x: 0, y: 35 }],
  'backend-app': [{ x: 0, y: -25 }, { x: 0, y: 0 }, { x: 0, y: 25 }],
  'app-backend': [{ x: 0, y: -30 }, { x: 0, y: 5 }, { x: 0, y: 35 }],
};

const Ecosystem: React.FC<EcosystemProps> = ({
  showLabels = true,
  enablePulse = true,
  paused = false,
  animateOnVisible = false, // Changed default to false so it starts immediately
}) => {
  const [data, setData] = useState<EcosystemData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true); // Start visible
  const [, forceUpdate] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const sequenceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepTimeoutsRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const activeAnimationsRef = useRef<ActiveAnimation[]>([]);
  const activeNodesRef = useRef<Set<string>>(new Set());
  const occupiedPositionsRef = useRef<Array<{ x: number; y: number; expireTime: number }>>([]);
  const [dimensions, setDimensions] = useState({ width: 1100, height: 380 });
  const dimensionsRef = useRef(dimensions);
  const isRunningRef = useRef(false);
  const dataRef = useRef<EcosystemData | null>(null);

  // Keep dataRef in sync
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Keep dimensionsRef in sync
  useEffect(() => {
    dimensionsRef.current = dimensions;
  }, [dimensions]);

  // Load JSON data
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/assets/ecosystem/ecosystem.json');
        if (!response.ok) throw new Error('Failed to load');
        const jsonData: EcosystemData = await response.json();
        setData(jsonData);
      } catch (error) {
        console.error('Unable to load ecosystem configuration:', error);
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const next = { width: rect.width, height: rect.height };
        // Skip state churn if unchanged
        if (dimensionsRef.current.width !== next.width || dimensionsRef.current.height !== next.height) {
          dimensionsRef.current = next;
          setDimensions(next);
        }
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [data]);

  // Intersection Observer for visibility
  useEffect(() => {
    if (!animateOnVisible) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => setIsVisible(entry.isIntersecting));
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, [animateOnVisible]);

  // Main animation system
  useEffect(() => {
    console.log('Ecosystem effect: data=', !!data, 'paused=', paused, 'isVisible=', isVisible);
    if (!data || paused || !isVisible) {
      console.log('Ecosystem: Conditions not met, stopping');
      // Stop if conditions not met
      isRunningRef.current = false;
      if (sequenceTimeoutRef.current) {
        clearTimeout(sequenceTimeoutRef.current);
        sequenceTimeoutRef.current = null;
      }
      stepTimeoutsRef.current.forEach(t => clearTimeout(t));
      stepTimeoutsRef.current = [];
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    // Already running, don't restart
    if (isRunningRef.current) {
      console.log('Ecosystem: Already running, skipping start');
      return;
    }
    isRunningRef.current = true;
    console.log('Ecosystem: Starting animation system');

    const settings = data.settings;

    // Helper: get position in pixels
    const getPosition = (componentId: string) => {
      const config = POSITION_CONFIG[componentId];
      if (!config) return { x: 0, y: 0 };
      const anchorOffset = NODE_ANCHOR_OFFSETS[componentId] || { x: 0, y: 0 };
      return {
        x: (config.left / 100) * dimensionsRef.current.width + anchorOffset.x,
        y: (config.top / 100) * dimensionsRef.current.height + anchorOffset.y,
      };
    };

    // Helper: generate SVG path
    const generatePath = (fromId: string, toId: string, variant: PathVariant): string => {
      const from = getPosition(fromId);
      const to = getPosition(toId);
      const midX = (from.x + to.x) / 2 + variant.controlPoint.x;
      const midY = (from.y + to.y) / 2 + variant.controlPoint.y;
      return `M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`;
    };

    // Helper: calculate path length
    const calculatePathLength = (pathD: string): number => {
      const tempPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      tempPath.setAttribute('d', pathD);
      return tempPath.getTotalLength();
    };

    // Helper: weighted random selection
    const selectWeightedRandom = <T extends { weight: number }>(items: T[]): T => {
      const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
      let random = Math.random() * totalWeight;
      for (const item of items) {
        random -= item.weight;
        if (random <= 0) return item;
      }
      return items[items.length - 1];
    };

    // Helper: get label position
    const getLabelPosition = (
      fromId: string,
      toId: string,
      variant: PathVariant,
      pathKey: string,
      duration: number
    ) => {
      const from = getPosition(fromId);
      const to = getPosition(toId);
      const currentTime = performance.now();

      const baseX = (from.x + to.x) / 2 + variant.controlPoint.x * 0.3;
      const baseY = (from.y + to.y) / 2 + variant.controlPoint.y * 0.3;

      const offsets = LABEL_OFFSETS[pathKey] || [{ x: 0, y: -20 }];

      // Clean up expired positions
      occupiedPositionsRef.current = occupiedPositionsRef.current.filter(
        pos => pos.expireTime > currentTime
      );

      for (const offset of offsets) {
        const x = baseX + offset.x;
        const y = baseY + offset.y - 15;

        const isOccupied = occupiedPositionsRef.current.some(
          pos => Math.abs(pos.x - x) < 80 && Math.abs(pos.y - y) < 30
        );

        if (!isOccupied) {
          occupiedPositionsRef.current.push({ x, y, expireTime: currentTime + duration });
          return { x, y };
        }
      }

      return { x: baseX + offsets[0].x, y: baseY + offsets[0].y - 15 };
    };

    // Run a single sequence
    const runSequence = () => {
      console.log('Ecosystem: Running sequence, isRunning:', isRunningRef.current);
      if (!isRunningRef.current) return;

      const currentData = dataRef.current;
      if (!currentData) return;

      const sequence = selectWeightedRandom(currentData.sequences);
      console.log('Ecosystem: Selected sequence:', sequence.name);
      const totalDuration = settings.lineDrawDurationMs + settings.pulseTravelDurationMs +
                            settings.labelDisplayMs + settings.labelFadeOutMs;

      // Clear previous step timeouts
      stepTimeoutsRef.current.forEach(t => clearTimeout(t));
      stepTimeoutsRef.current = [];

      sequence.steps.forEach((step, index) => {
        const stepTimeout = setTimeout(() => {
          if (!isRunningRef.current) return;

          const pathDef = currentData.paths[step.path];
          if (!pathDef) return;

          const variant = pathDef.variants[Math.floor(Math.random() * pathDef.variants.length)];
          const pathD = generatePath(pathDef.from, pathDef.to, variant);
          const pathLength = calculatePathLength(pathD);
          const labelPosition = getLabelPosition(pathDef.from, pathDef.to, variant, step.path, totalDuration);

          const animation: ActiveAnimation = {
            id: `${sequence.id}-${index}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            pathKey: step.path,
            variantId: variant.id,
            label: step.label,
            phase: 'drawing',
            startTime: performance.now(),
            pathD,
            pathLength,
            fromId: pathDef.from,
            toId: pathDef.to,
            labelPosition,
          };

          activeAnimationsRef.current = [...activeAnimationsRef.current, animation];
          activeNodesRef.current.add(pathDef.from);
          activeNodesRef.current.add(pathDef.to);
          console.log('Ecosystem: Added animation for', step.path, 'pathD:', pathD.substring(0, 50));
          forceUpdate(n => n + 1);
        }, step.delayMs);

        stepTimeoutsRef.current.push(stepTimeout);
      });

      // Schedule next sequence
      const nextInterval = settings.minSequenceIntervalMs +
        Math.random() * (settings.maxSequenceIntervalMs - settings.minSequenceIntervalMs);

      sequenceTimeoutRef.current = setTimeout(runSequence, nextInterval);
    };

    // Animation frame loop
    const animationLoop = (currentTime: number) => {
      if (!isRunningRef.current) return;

      const updatedAnimations: ActiveAnimation[] = [];
      let needsUpdate = false;

      for (const anim of activeAnimationsRef.current) {
        const elapsed = currentTime - anim.startTime;

        if (anim.phase === 'drawing') {
          if (elapsed >= settings.lineDrawDurationMs) {
            anim.phase = enablePulse ? 'pulsing' : 'visible';
            anim.startTime = currentTime;
            needsUpdate = true;
          }
        } else if (anim.phase === 'pulsing') {
          if (elapsed >= settings.pulseTravelDurationMs) {
            anim.phase = 'visible';
            anim.startTime = currentTime;
            needsUpdate = true;
          }
        } else if (anim.phase === 'visible') {
          if (elapsed >= settings.labelDisplayMs) {
            anim.phase = 'fading';
            anim.startTime = currentTime;
            needsUpdate = true;
          }
        } else if (anim.phase === 'fading') {
          if (elapsed >= settings.labelFadeOutMs) {
            needsUpdate = true;
            continue; // Remove this animation
          }
        }

        updatedAnimations.push(anim);
      }

      if (needsUpdate) {
        activeAnimationsRef.current = updatedAnimations;

        // Update active nodes
        const newActiveNodes = new Set<string>();
        for (const anim of updatedAnimations) {
          newActiveNodes.add(anim.fromId);
          newActiveNodes.add(anim.toId);
        }
        activeNodesRef.current = newActiveNodes;

        forceUpdate(n => n + 1);
      }

      animationFrameRef.current = requestAnimationFrame(animationLoop);
    };

    // Start everything
    animationFrameRef.current = requestAnimationFrame(animationLoop);
    sequenceTimeoutRef.current = setTimeout(runSequence, 500);

    // Cleanup only on unmount or when data/paused/isVisible changes
    return () => {
      isRunningRef.current = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (sequenceTimeoutRef.current) {
        clearTimeout(sequenceTimeoutRef.current);
        sequenceTimeoutRef.current = null;
      }
      stepTimeoutsRef.current.forEach(t => clearTimeout(t));
      stepTimeoutsRef.current = [];
    };
  }, [data, paused, isVisible, enablePulse]);

  // Generate ambient connection lines
  const ambientPaths = useMemo((): Array<{ key: string; d: string }> => {
    if (!data) return [];

    const getPosition = (componentId: string) => {
      const config = POSITION_CONFIG[componentId];
      if (!config) return { x: 0, y: 0 };
      const anchorOffset = NODE_ANCHOR_OFFSETS[componentId] || { x: 0, y: 0 };
      return {
        x: (config.left / 100) * dimensionsRef.current.width + anchorOffset.x,
        y: (config.top / 100) * dimensionsRef.current.height + anchorOffset.y,
      };
    };

    const generatePath = (fromId: string, toId: string, variant: PathVariant): string => {
      const from = getPosition(fromId);
      const to = getPosition(toId);
      const midX = (from.x + to.x) / 2 + variant.controlPoint.x;
      const midY = (from.y + to.y) / 2 + variant.controlPoint.y;
      return `M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`;
    };

    const ambientPathKeys = ['camera-backend', 'backend-operator', 'backend-app'];

    return ambientPathKeys
      .filter(key => data.paths[key])
      .map((key: string) => {
        const pathDef = data.paths[key];
        const variant = pathDef.variants[0];
        const d = generatePath(pathDef.from, pathDef.to, variant);
        return { key, d };
      });
  }, [data, dimensions.width, dimensions.height]);

  const settings = data?.settings;
  const activeAnimations = activeAnimationsRef.current;
  const activeNodes = activeNodesRef.current;

  if (isLoading || !data) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="ecosystem-wrapper"
      role="img"
      aria-label="Parallel ecosystem showing data flow between Camera, Backend, Operator Portal, and Mobile App"
    >
      <svg className="ecosystem-svg" preserveAspectRatio="none">
        <defs>
          <linearGradient id="eco-line-gradient" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.4" />
            <stop offset="50%" stopColor="var(--color-primary)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Ambient connection lines */}
        {ambientPaths.map((item) => (
          <path
            key={`ambient-${item.key}`}
            d={item.d}
            className="ecosystem-ambient-line"
          />
        ))}

        {/* Active animation lines */}
        {activeAnimations.map((anim) => {
          let lineClass = 'ecosystem-line';
          if (anim.phase === 'drawing') {
            lineClass += ' ecosystem-line-drawing';
          } else if (anim.phase === 'fading') {
            lineClass += ' ecosystem-line-fading';
          } else {
            lineClass += ' ecosystem-line-visible';
          }

          return (
            <g key={anim.id}>
              <path
                d={anim.pathD}
                className={lineClass}
                stroke="url(#eco-line-gradient)"
                style={{
                  '--draw-duration': `${settings?.lineDrawDurationMs || 700}ms`,
                  '--fade-duration': `${settings?.labelFadeOutMs || 400}ms`,
                } as React.CSSProperties}
              />

              {enablePulse && anim.phase === 'pulsing' && (
                <circle r="4" className="ecosystem-pulse ecosystem-pulse-animated">
                  <animateMotion
                    dur={`${settings?.pulseTravelDurationMs || 500}ms`}
                    path={anim.pathD}
                    fill="freeze"
                  />
                </circle>
              )}
            </g>
          );
        })}
      </svg>

      {showLabels && (
        <div className="ecosystem-labels-container">
          {activeAnimations.map((anim) => (
            <div
              key={`label-${anim.id}`}
              className={`ecosystem-label ${anim.phase === 'fading' ? 'ecosystem-label-fading' : 'ecosystem-label-visible'}`}
              style={{
                left: anim.labelPosition.x,
                top: anim.labelPosition.y,
              }}
            >
              {anim.label}
            </div>
          ))}
        </div>
      )}

      <div className="ecosystem-nodes">
        {Object.keys(data.components).map((compId: string) => {
          const comp = data.components[compId];
          const config = POSITION_CONFIG[comp.id];
          if (!config) return null;

          return (
            <div
              key={comp.id}
              className={`ecosystem-node ${activeNodes.has(comp.id) ? 'active' : ''}`}
              data-component={comp.id}
              style={{ left: `${config.left}%`, top: `${config.top}%` }}
            >
              <img
                src={`/assets/ecosystem/${comp.image}`}
                alt={comp.label}
                className="ecosystem-node-image"
              />
              <span className="ecosystem-node-label">{comp.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Ecosystem;
