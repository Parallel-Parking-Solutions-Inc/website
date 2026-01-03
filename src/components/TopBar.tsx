import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import './TopBar.css';

interface TopBarProps {
  onSidebarToggle: () => void;
  isSidebarCollapsed: boolean;
}

// Searchable items for the search functionality
interface SearchResult {
  id: string;
  label: string;
  type: 'page' | 'section' | 'action' | 'content';
  path: string;
  section?: string;
  keywords?: string[];
  priority?: number; // Higher priority = shown first
}

const SEARCHABLE_ITEMS: SearchResult[] = [
  // Priority 1: Pages (highest priority)
  { id: 'home', label: 'Home', type: 'page', path: '/', priority: 100, keywords: ['main', 'start', 'landing'] },
  { id: 'contact', label: 'Contact Us', type: 'page', path: '/contact', priority: 100, keywords: ['email', 'phone', 'support', 'help', 'reach', 'message'] },
  { id: 'careers', label: 'Careers', type: 'page', path: '/careers', priority: 100, keywords: ['jobs', 'hiring', 'work', 'employment', 'openings', 'join', 'team'] },
  { id: 'legal', label: 'Legal', type: 'page', path: '/legal', priority: 100, keywords: ['terms', 'privacy', 'policy', 'documents'] },

  // Priority 2: Actions/Buttons
  { id: 'get-app', label: 'Get the App', type: 'action', path: 'https://app.parkwithparallel.com', priority: 90, keywords: ['download', 'install', 'mobile', 'phone', 'ios', 'android'] },
  { id: 'pay-now', label: 'Pay for Parking', type: 'action', path: 'https://pay.parkwithparallel.com', priority: 90, keywords: ['payment', 'pay', 'parking', 'ticket', 'fee'] },
  { id: 'request-demo', label: 'Request a Demo', type: 'action', path: '/contact', priority: 85, keywords: ['demo', 'trial', 'test', 'try', 'see'] },
  { id: 'operator-login', label: 'Operator Portal Login', type: 'action', path: 'https://operator.parkwithparallel.com', priority: 85, keywords: ['login', 'sign in', 'portal', 'dashboard', 'manage'] },

  // Priority 3: Home Page Sections
  { id: 'mobile-app', label: 'Mobile App', type: 'section', path: '/', section: 'app-hero', priority: 80, keywords: ['app', 'mobile', 'phone', 'download', 'parking app'] },
  { id: 'operator-portal', label: 'Operator Portal', type: 'section', path: '/', section: 'operator-portal', priority: 80, keywords: ['operator', 'portal', 'management', 'dashboard', 'analytics', 'manage'] },
  { id: 'trust-badges', label: 'Trusted Partners', type: 'section', path: '/', section: 'trust-badges', priority: 70, keywords: ['partners', 'trusted', 'clients', 'customers'] },
  { id: 'demo-video', label: 'Demo Video', type: 'section', path: '/', section: 'demo-video', priority: 70, keywords: ['video', 'demo', 'watch', 'see'] },
  { id: 'tutorials', label: 'Operator Tutorials', type: 'section', path: '/', section: 'operator-portal', priority: 70, keywords: ['tutorial', 'guide', 'how to', 'learn', 'training'] },

  // Priority 4: Legal Pages
  { id: 'app-terms', label: 'App Terms of Service', type: 'page', path: '/legal/app/terms-of-service', priority: 60, keywords: ['terms', 'service', 'app', 'conditions', 'agreement'] },
  { id: 'app-privacy', label: 'App Privacy Policy', type: 'page', path: '/legal/app/privacy-policy', priority: 60, keywords: ['privacy', 'data', 'app', 'personal', 'information', 'gdpr'] },
  { id: 'operator-terms', label: 'Operator Terms of Service', type: 'page', path: '/legal/operator/terms-of-service', priority: 60, keywords: ['terms', 'service', 'operator', 'conditions', 'agreement'] },
  { id: 'operator-privacy', label: 'Operator Privacy Policy', type: 'page', path: '/legal/operator/privacy-policy', priority: 60, keywords: ['privacy', 'data', 'operator', 'personal', 'information', 'alpr', 'license plate'] },

  // Priority 5: Content from pages (lower priority, shown as fallback)
  { id: 'content-parking', label: 'Smart Parking Solutions', type: 'content', path: '/', section: 'hero', priority: 50, keywords: ['parking', 'smart', 'solution', 'technology', 'ai', 'automated'] },
  { id: 'content-setup', label: 'Easy Setup', type: 'content', path: '/', section: 'setup', priority: 50, keywords: ['setup', 'install', 'configure', 'quick', 'easy', 'minutes'] },
  { id: 'content-features', label: 'Platform Features', type: 'content', path: '/', section: 'feature-grid', priority: 50, keywords: ['features', 'capabilities', 'tools', 'analytics', 'reports'] },
  { id: 'content-ecosystem', label: 'Parking Ecosystem', type: 'content', path: '/', section: 'ecosystem', priority: 50, keywords: ['ecosystem', 'platform', 'integration', 'unified'] },

  // Career-related content
  { id: 'job-mobile', label: 'Mobile Engineer Position', type: 'content', path: '/careers', priority: 40, keywords: ['mobile', 'engineer', 'react native', 'ios', 'android', 'developer', 'job'] },
  { id: 'job-devops', label: 'DevOps Engineer Position', type: 'content', path: '/careers', priority: 40, keywords: ['devops', 'engineer', 'aws', 'infrastructure', 'deployment', 'job'] },
  { id: 'job-marketing', label: 'Marketing Manager Position', type: 'content', path: '/careers', priority: 40, keywords: ['marketing', 'manager', 'strategy', 'content', 'job'] },
  { id: 'job-business', label: 'Business Development Position', type: 'content', path: '/careers', priority: 40, keywords: ['business', 'development', 'sales', 'partnerships', 'job'] },

  // Contact-related content
  { id: 'content-email', label: 'Email Support', type: 'content', path: '/contact', priority: 40, keywords: ['email', 'support', 'info@parkwithparallel.com', 'contact'] },
  { id: 'content-delete-data', label: 'Delete My Data', type: 'content', path: '/legal', priority: 40, keywords: ['delete', 'data', 'remove', 'gdpr', 'privacy', 'request'] },
];

const TopBar: React.FC<TopBarProps> = ({ onSidebarToggle, isSidebarCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // State
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showPayDropdown, setShowPayDropdown] = useState(false);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
  const [scrollPhase, setScrollPhase] = useState<'idle' | 'hide' | 'show'>('idle');

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const payDropdownRef = useRef<HTMLDivElement>(null);
  const hasMountedRef = useRef(false);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track whether we just crossed the scroll threshold to drive animations
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    const nextPhase = isScrolled ? 'hide' : 'show';
    setScrollPhase(nextPhase);

    const timeout = window.setTimeout(() => setScrollPhase('idle'), 450);
    return () => window.clearTimeout(timeout);
  }, [isScrolled]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
        setIsSearchExpanded(false);
        setSearchQuery('');
      }
      if (payDropdownRef.current && !payDropdownRef.current.contains(e.target as Node)) {
        setShowPayDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search icon click
  const handleSearchIconClick = () => {
    setIsSearchExpanded(true);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  // Filter search results with keyword matching and priority sorting
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();

    // Score each item based on match quality
    const scoredItems = SEARCHABLE_ITEMS.map((item) => {
      let score = 0;
      const labelLower = item.label.toLowerCase();

      // Exact label match gets highest score
      if (labelLower === query) {
        score = 1000;
      }
      // Label starts with query
      else if (labelLower.startsWith(query)) {
        score = 500;
      }
      // Label contains query
      else if (labelLower.includes(query)) {
        score = 300;
      }
      // Keyword exact match
      else if (item.keywords?.some((k) => k.toLowerCase() === query)) {
        score = 200;
      }
      // Keyword starts with query
      else if (item.keywords?.some((k) => k.toLowerCase().startsWith(query))) {
        score = 150;
      }
      // Keyword contains query
      else if (item.keywords?.some((k) => k.toLowerCase().includes(query))) {
        score = 100;
      }

      // Add priority to score (priority is typically 40-100)
      if (score > 0) {
        score += (item.priority || 50);
      }

      return { item, score };
    });

    // Filter items with score > 0 and sort by score (highest first)
    return scoredItems
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((s) => s.item)
      .slice(0, 8); // Show up to 8 results
  }, [searchQuery]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedResultIndex(-1);
  }, [searchResults]);

  // Handle search result selection
  const handleSearchSelect = (result: SearchResult) => {
    // Handle external links (actions that start with http)
    if (result.path.startsWith('http')) {
      window.open(result.path, '_blank', 'noopener,noreferrer');
      setSearchQuery('');
      setIsSearchFocused(false);
      return;
    }

    // Handle sections (scroll to section)
    if ((result.type === 'section' || result.type === 'content') && result.section) {
      if (location.pathname === '/' || result.path === '/') {
        if (location.pathname === '/') {
          // Already on home, scroll to section
          const element = document.getElementById(result.section);
          if (element) {
            const offset = 100;
            const elementPosition = element.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
          }
        } else {
          // Navigate to home and store section to scroll to
          navigate('/');
          sessionStorage.setItem('scrollToSection', result.section);
        }
      } else {
        // Navigate to the path (for content on other pages)
        navigate(result.path);
      }
    } else {
      // Regular page navigation
      navigate(result.path);
    }
    setSearchQuery('');
    setIsSearchFocused(false);
  };

  // Keyboard navigation for search
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedResultIndex((prev) =>
        prev < searchResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedResultIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedResultIndex >= 0) {
      e.preventDefault();
      handleSearchSelect(searchResults[selectedResultIndex]);
    } else if (e.key === 'Escape') {
      setIsSearchFocused(false);
      setIsSearchExpanded(false);
      setSearchQuery('');
      searchInputRef.current?.blur();
    }
  };

  // Handle Pay Now button click
  const handlePayClick = (e: React.MouseEvent) => {
    if (isScrolled) {
      e.preventDefault();
      setShowPayDropdown(!showPayDropdown);
    }
  };

  const scrollPhaseClass =
    scrollPhase === 'hide' ? 'scroll-hide' : scrollPhase === 'show' ? 'scroll-show' : '';

  const searchHidden = isScrolled && !isSearchExpanded;
  const searchScrollClass = isSearchExpanded ? '' : scrollPhaseClass;

  return (
    <header className={`topbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="topbar-left">
        <img
          src="/assets/Logo_Parallel.svg"
          alt="Parallel Logo"
          className="topbar-logo"
        />
        <button
          className="topbar-sidebar-toggle"
          onClick={onSidebarToggle}
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <img
            src={isSidebarCollapsed ? '/assets/SidebarOpened.svg' : '/assets/SidebarClosed.svg'}
            alt={isSidebarCollapsed ? 'Expand' : 'Collapse'}
            className="topbar-toggle-icon"
          />
        </button>
      </div>

      <div className="topbar-right">
        <div
          className={`topbar-search-container ${isSearchExpanded ? 'expanded' : ''} ${searchHidden ? 'hidden' : ''} ${searchScrollClass}`}
          ref={searchContainerRef}
          style={{ ['--sidebar-offset' as string]: isSidebarCollapsed ? '0px' : '200px' }}
        >
          <button
            className="topbar-search-toggle"
            onClick={handleSearchIconClick}
            aria-label="Search"
          >
            <Search size={20} />
          </button>
          <div className="topbar-search">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search pages & sections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onKeyDown={handleSearchKeyDown}
              className="topbar-search-input"
            />
          </div>
          {isSearchExpanded && isSearchFocused && searchResults.length > 0 && (
            <div className="topbar-search-dropdown">
              {searchResults.map((result, index) => (
                <button
                  key={result.id}
                  className={`topbar-search-result ${index === selectedResultIndex ? 'selected' : ''}`}
                  onClick={() => handleSearchSelect(result)}
                  onMouseEnter={() => setSelectedResultIndex(index)}
                >
                  <span className="search-result-label">{result.label}</span>
                  <span className="search-result-type" data-type={result.type}>{result.type}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <a
          href="https://app.parkwithparallel.com"
          className={`topbar-btn topbar-btn-get-app ${isScrolled ? 'hidden' : ''} ${scrollPhaseClass}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Get App
        </a>

        <div className="topbar-pay-container" ref={payDropdownRef}>
          <a
            href="https://pay.parkwithparallel.com"
            className={`topbar-btn topbar-btn-pay ${isScrolled ? 'with-dropdown' : ''}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handlePayClick}
          >
            Pay Now
            <span className="topbar-arrow-separator" />
            <span className={`topbar-dropdown-arrow ${showPayDropdown ? 'open' : ''}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
          </a>

          {isScrolled && showPayDropdown && (
            <div className="topbar-pay-dropdown">
              <a
                href="https://apps.apple.com/app/parallel-parking/id6446042703"
                target="_blank"
                rel="noopener noreferrer"
                className="pay-dropdown-item"
              >
                <img src="/assets/app_ios_download.svg" alt="Download on iOS" className="pay-dropdown-icon" />
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=com.parallel.parking"
                target="_blank"
                rel="noopener noreferrer"
                className="pay-dropdown-item"
              >
                <img src="/assets/app_android_download.svg" alt="Get on Android" className="pay-dropdown-icon" />
              </a>
              <a
                href="https://pay.parkwithparallel.com"
                target="_blank"
                rel="noopener noreferrer"
                className="pay-dropdown-item"
              >
                <img src="/assets/app_web.svg" alt="Pay on Web" className="pay-dropdown-icon" />
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
