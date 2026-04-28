import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import type { WeatherMetaphor } from '../types';
import { SpeakerButton } from '../components/SpeakerButton';
import styles from './HomeScreen.module.css';

import appLogoSrc from '../assets/ui/app-logo.png';

// ---------------------------------------------------------------------------
// Weather icon assets
// ---------------------------------------------------------------------------
import sunnySrc from '../assets/weather/sunny.png';
import rainySrc from '../assets/weather/rainy.png';
import stormySrc from '../assets/weather/stormy.png';
import foggySrc from '../assets/weather/foggy.png';
import windySrc from '../assets/weather/windy.png';
import sparklySrc from '../assets/weather/sparkly.png';
import heavyCloudsSrc from '../assets/weather/heavy-clouds.png';

// ---------------------------------------------------------------------------
// Weather card data
// ---------------------------------------------------------------------------
interface WeatherOption {
  id: WeatherMetaphor;
  src: string;
  label: string;
  cssClass: string;
}

const WEATHER_OPTIONS: WeatherOption[] = [
  { id: 'sunny',        src: sunnySrc,       label: 'Sunny',        cssClass: styles.sunny },
  { id: 'rainy',        src: rainySrc,       label: 'Rainy',        cssClass: styles.rainy },
  { id: 'stormy',       src: stormySrc,      label: 'Stormy',       cssClass: styles.stormy },
  { id: 'foggy',        src: foggySrc,       label: 'Foggy',        cssClass: styles.foggy },
  { id: 'windy',        src: windySrc,       label: 'Windy',        cssClass: styles.windy },
  { id: 'sparkly',      src: sparklySrc,     label: 'Sparkly',      cssClass: styles.sparkly },
  { id: 'heavy-clouds', src: heavyCloudsSrc, label: 'Heavy Clouds', cssClass: styles.heavyClouds },
];

// ---------------------------------------------------------------------------
// WeatherCard sub-component
// ---------------------------------------------------------------------------
interface WeatherCardProps {
  option: WeatherOption;
  onSelect: (id: WeatherMetaphor) => void;
}

function WeatherCard({ option, onSelect }: WeatherCardProps) {
  const handleClick = () => onSelect(option.id);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(option.id);
    }
  };

  return (
    <button
      type="button"
      className={`${styles.card} ${option.cssClass}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={option.label}
    >
      <img src={option.src} alt="" className={styles.weatherIcon} aria-hidden="true" />
      <span className={styles.label}>{option.label}</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// HomeScreen
// ---------------------------------------------------------------------------
export function HomeScreen() {
  const { dispatch } = useSession();
  const navigate = useNavigate();

  const handleWeatherSelect = (weather: WeatherMetaphor) => {
    dispatch({ type: 'SET_WEATHER', payload: weather });
    navigate('/body-map');
  };

  return (
    <main className={styles.screen}>
      <div className={styles.logoRow}>
        <img src={appLogoSrc} alt="Feelings Explorer" className={styles.logo} />
      </div>
      <h1 className={styles.prompt}>
        How is your weather today?
        <SpeakerButton text="How is your weather today?" />
      </h1>

      <div className={styles.grid} role="group" aria-label="Weather options">
        {WEATHER_OPTIONS.map((option) => (
          <WeatherCard key={option.id} option={option} onSelect={handleWeatherSelect} />
        ))}
      </div>

      <nav className={styles.nav} aria-label="Other sections">
        <a href="#/badge-collection" className={styles.navButton}>
          🏅 My Badges
        </a>
        <a href="#/parent-safety" className={styles.navButton}>
          👋 For Grown-Ups
        </a>
      </nav>
    </main>
  );
}
