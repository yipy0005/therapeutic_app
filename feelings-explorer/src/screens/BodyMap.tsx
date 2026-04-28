import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import type { BodyRegion } from '../types';
import { BackButton } from '../components/BackButton';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { SpeakerButton } from '../components/SpeakerButton';
import styles from './BodyMap.module.css';
import bodyMapSrc from '../assets/body-map/child-body.png';

// ---------------------------------------------------------------------------
// Region definitions — each maps to an SVG shape + hit area
// ---------------------------------------------------------------------------
interface RegionDef {
  id: BodyRegion;
  label: string;
  // Silhouette shape props (ellipse or rect)
  shape: 'ellipse' | 'rect';
  shapeProps: Record<string, number | string>;
  // Primary hit area
  hitX: number;
  hitY: number;
  hitW: number;
  hitH: number;
  // Optional extra hit rects (for split regions like hands)
  extraHitRects?: Array<{ x: number; y: number; w: number; h: number }>;
  // Label position
  labelX: number;
  labelY: number;
}

// SVG viewBox: 0 0 1024 1536 — coordinates match body-map.png exactly
// Labels sit to the right of the body (labelX: 795)
const REGIONS: RegionDef[] = [
  {
    id: 'head',
    label: 'Head',
    shape: 'rect',
    shapeProps: { x: 292, y: 99, width: 443, height: 216, rx: 30 },
    hitX: 292, hitY: 99, hitW: 443, hitH: 216,
    labelX: 795, labelY: 207,
  },
  {
    id: 'throat',
    label: 'Throat',
    shape: 'rect',
    shapeProps: { x: 382, y: 530, width: 255, height: 100, rx: 20 },
    hitX: 382, hitY: 530, hitW: 255, hitH: 100,
    labelX: 795, labelY: 580,
  },
  {
    id: 'chest',
    label: 'Chest',
    shape: 'rect',
    shapeProps: { x: 277, y: 630, width: 473, height: 170, rx: 25 },
    hitX: 277, hitY: 630, hitW: 473, hitH: 170,
    labelX: 795, labelY: 715,
  },
  {
    id: 'tummy',
    label: 'Tummy',
    shape: 'rect',
    shapeProps: { x: 292, y: 800, width: 443, height: 150, rx: 25 },
    hitX: 292, hitY: 800, hitW: 443, hitH: 150,
    labelX: 795, labelY: 960,
  },
  {
    id: 'hands',
    label: 'Hands',
    shape: 'ellipse',
    // Two ellipses rendered at each hand position (sides of body)
    shapeProps: { cx: 162, cy: 846, rx: 60, ry: 81 },
    // Primary hit covers left hand only; extraHitRects covers right hand
    // Neither overlaps the torso center (x 292–735)
    hitX: 105, hitY: 800, hitW: 187, hitH: 150,
    extraHitRects: [{ x: 732, y: 800, w: 187, h: 150 }],
    labelX: 795, labelY: 800,
  },
  {
    id: 'legs',
    label: 'Knees',
    shape: 'rect',
    shapeProps: { x: 292, y: 1116, width: 443, height: 144, rx: 25 },
    hitX: 292, hitY: 1116, hitW: 443, hitH: 144,
    labelX: 795, labelY: 1188,
  },
];

// ---------------------------------------------------------------------------
// BodyRegionGroup — renders one tappable region
// ---------------------------------------------------------------------------
interface BodyRegionGroupProps {
  region: RegionDef;
  selected: boolean;
  onToggle: (id: BodyRegion) => void;
}

function BodyRegionGroup({ region, selected, onToggle }: BodyRegionGroupProps) {
  const handleClick = () => onToggle(region.id);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle(region.id);
    }
  };

  const groupClass = `${styles.region} ${selected ? styles.selected : ''}`;

  return (
    <g
      className={groupClass}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={region.label}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {/* Silhouette shape */}
      {region.id === 'hands' ? (
        <>
          <ellipse className={styles.silhouette} cx={162} cy={846} rx={60} ry={81} />
          <ellipse className={styles.silhouette} cx={862} cy={846} rx={60} ry={81} />
        </>
      ) : region.shape === 'ellipse' ? (
        <ellipse
          className={styles.silhouette}
          cx={region.shapeProps.cx as number}
          cy={region.shapeProps.cy as number}
          rx={region.shapeProps.rx as number}
          ry={region.shapeProps.ry as number}
        />
      ) : (
        <rect
          className={styles.silhouette}
          x={region.shapeProps.x as number}
          y={region.shapeProps.y as number}
          width={region.shapeProps.width as number}
          height={region.shapeProps.height as number}
          rx={region.shapeProps.rx as number}
        />
      )}

      {/* Transparent hit area(s) for minimum 44×44 touch target */}
      <rect
        className={styles.hitArea}
        x={region.hitX}
        y={region.hitY}
        width={region.hitW}
        height={region.hitH}
      />
      {region.extraHitRects?.map((r, i) => (
        <rect
          key={i}
          className={styles.hitArea}
          x={r.x}
          y={r.y}
          width={r.w}
          height={r.h}
        />
      ))}

      {/* Label */}
      <text className={styles.regionLabel} x={region.labelX} y={region.labelY}>
        {region.label}
      </text>
    </g>
  );
}

// ---------------------------------------------------------------------------
// BodyMap screen
// ---------------------------------------------------------------------------
export function BodyMap() {
  const { dispatch } = useSession();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Set<BodyRegion>>(new Set());

  const toggleRegion = (id: BodyRegion) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleNext = () => {
    const regions = Array.from(selected);
    dispatch({ type: 'SET_BODY_REGIONS', payload: regions });
    navigate('/intensity');
  };

  return (
    <main className={styles.screen}>
      <BackButton onClick={() => navigate('/')} />
      <h1 className={styles.prompt}>
        Where do you feel it in your body?
        <SpeakerButton text="Where do you feel it in your body?" />
      </h1>

      <div className={styles.svgWrapper}>
        <div className={styles.bodyMapContainer}>
          <img src={bodyMapSrc} alt="" className={styles.bodyMapImg} aria-hidden="true" />
          <svg
            className={styles.bodySvg}
            viewBox="0 0 1024 1536"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Body map"
            role="group"
          >
            {REGIONS.map((region) => (
              <BodyRegionGroup
                key={region.id}
                region={region}
                selected={selected.has(region.id)}
                onToggle={toggleRegion}
              />
            ))}
          </svg>
        </div>
      </div>

      <button
        type="button"
        className={styles.nextButton}
        disabled={selected.size === 0}
        onClick={handleNext}
        aria-disabled={selected.size === 0}
      >
        Next →
      </button>
      <ProgressIndicator currentStep="body-map" />
    </main>
  );
}
