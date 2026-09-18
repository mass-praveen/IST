import { useState, useEffect, useRef } from 'react';
import { Palette, Check } from 'lucide-react';
import './ThemeSelector.css';

export const appThemes = [
  { id: 'indigo', name: 'Royal Indigo', color: '#6366f1', preview: 'linear-gradient(135deg, #6366f1, #38bdf8)' },
  { id: 'emerald', name: 'Cyber Emerald', color: '#10b981', preview: 'linear-gradient(135deg, #10b981, #14b8a6)' },
  { id: 'ocean', name: 'Electric Ocean', color: '#0ea5e9', preview: 'linear-gradient(135deg, #0ea5e9, #60a5fa)' },
  { id: 'purple', name: 'Royal Amethyst', color: '#8b5cf6', preview: 'linear-gradient(135deg, #8b5cf6, #d946ef)' },
  { id: 'amber', name: 'Sunset Amber', color: '#f59e0b', preview: 'linear-gradient(135deg, #f59e0b, #fb923c)' },
  { id: 'midnight', name: 'Midnight OLED', color: '#050505', preview: 'linear-gradient(135deg, #050505, #171717)' }
];

export default function ThemeSelector() {
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('ist_app_theme') || 'indigo';
  });
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const applyTheme = (themeId) => {
    setCurrentTheme(themeId);
    document.documentElement.setAttribute('data-theme', themeId);
    localStorage.setItem('ist_app_theme', themeId);
    setIsOpen(false);
  };

  useEffect(() => {
    // Apply saved theme on initial load
    const saved = localStorage.getItem('ist_app_theme') || 'indigo';
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeObj = appThemes.find(t => t.id === currentTheme) || appThemes[0];

  return (
    <div className="theme-selector-container" ref={dropdownRef}>
      <button 
        className="theme-selector-trigger flex-center"
        onClick={() => setIsOpen(!isOpen)}
        title="Change App Color Theme"
      >
        <div 
          className="theme-color-preview-circle" 
          style={{ background: activeObj.preview }}
        />
        <Palette size={15} />
        <span className="theme-trigger-label">{activeObj.name}</span>
      </button>

      {isOpen && (
        <div className="theme-dropdown-menu glass-panel-premium animate-scale-up">
          <div className="theme-dropdown-header">
            <span className="theme-header-title">Theme Palette (5 Colors)</span>
          </div>

          <div className="theme-options-list">
            {appThemes.map((theme) => {
              const isSelected = theme.id === currentTheme;
              return (
                <button
                  key={theme.id}
                  className={`theme-option-row flex-center ${isSelected ? 'selected' : ''}`}
                  onClick={() => applyTheme(theme.id)}
                >
                  <div 
                    className="theme-swatch" 
                    style={{ background: theme.preview }}
                  />
                  <span className="theme-name">{theme.name}</span>
                  {isSelected && <Check size={14} className="theme-check-icon text-accent" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
