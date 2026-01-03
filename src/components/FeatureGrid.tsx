import React, { useEffect, useState } from 'react';
import './FeatureGrid.css';

type SmallFeature = {
  icon: string;
  text: string;
};

type LargeFeature = {
  icon: string;
  text: string;
  background: string;
  backText: string;
};

type FeaturesData = {
  smallFeatures: SmallFeature[];
  largeFeatures: LargeFeature[];
};

const FeatureGrid: React.FC = () => {
  const [features, setFeatures] = useState<FeaturesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

  useEffect(() => {
    const loadFeatures = async () => {
      try {
        const response = await fetch('/assets/feature_grid/features.json');
        if (!response.ok) throw new Error('Failed to load features');
        const data: FeaturesData = await response.json();
        setFeatures(data);
      } catch (error) {
        console.error('Unable to load features:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadFeatures();
  }, []);

  const handleLargeFeatureHover = (index: number, isHovering: boolean) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (isHovering) {
        newSet.add(index);
      } else {
        newSet.delete(index);
      }
      return newSet;
    });
  };

  if (isLoading || !features) {
    return null;
  }

  // Grid is 10 columns x 6 rows
  // Large features (2x2 each) in center: cols 4-7, rows 2-5
  const COLS = 10;
  const ROWS = 6;

  // Build small feature positions (skipping center 4x4 block)
  const smallPositions: { row: number; col: number }[] = [];
  for (let row = 1; row <= ROWS; row++) {
    for (let col = 1; col <= COLS; col++) {
      const inCenterCols = col >= 4 && col <= 7;
      const inCenterRows = row >= 2 && row <= 5;
      if (!(inCenterCols && inCenterRows)) {
        smallPositions.push({ row, col });
      }
    }
  }

  // Large feature positions (top-left of each 2x2)
  const largePositions = [
    { col: 4, row: 2 },
    { col: 6, row: 2 },
    { col: 4, row: 4 },
    { col: 6, row: 4 },
  ];

  return (
    <div className="feature-grid-wrapper">
      {/* Top border line */}
      <div className="feature-grid-line feature-grid-line-top" />
      {/* Bottom border line */}
      <div className="feature-grid-line feature-grid-line-bottom" />

      <div className="feature-grid">
        {/* Small cells */}
        {smallPositions.map((pos, index) => {
          const feature = features.smallFeatures[index];
          if (!feature) return null;

          return (
            <div
              key={`small-${index}`}
              className="feature-cell-small"
              data-col={pos.col}
              data-row={pos.row}
              style={{
                gridColumn: pos.col,
                gridRow: pos.row
              }}
            >
              <div className="feature-icon">
                <img
                  src={`/assets/feature_grid/${feature.icon}`}
                  alt=""
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <span className="feature-text">{feature.text}</span>
            </div>
          );
        })}

        {/* Large cells (2x2) */}
        {features.largeFeatures.map((feature, index) => {
          const pos = largePositions[index];
          if (!pos) return null;
          const isFlipped = flippedCards.has(index);

          return (
            <div
              key={`large-${index}`}
              className={`feature-cell-large ${isFlipped ? 'flipped' : ''}`}
              data-col={pos.col}
              data-row={pos.row}
              style={{
                gridColumn: `${pos.col} / span 2`,
                gridRow: `${pos.row} / span 2`
              }}
              onMouseEnter={() => handleLargeFeatureHover(index, true)}
              onMouseLeave={() => handleLargeFeatureHover(index, false)}
            >
              <div className="feature-card-inner">
                <div
                  className="feature-card-front"
                  style={{
                    backgroundImage: `url(/assets/feature_grid/${feature.background})`
                  }}
                >
                  <div className="feature-large-label">
                    <div className="feature-large-icon">
                      <img
                        src={`/assets/feature_grid/${feature.icon}`}
                        alt=""
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <span className="feature-large-text">{feature.text}</span>
                  </div>
                </div>
                <div className="feature-card-back">
                  <p className="feature-back-text">{feature.backText}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeatureGrid;
