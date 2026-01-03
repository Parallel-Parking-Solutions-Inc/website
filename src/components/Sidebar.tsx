import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useScrollToSection } from '../hooks/useScrollToSection';
import './Sidebar.css';

// Navigation Types
interface PageNavItem {
  id: string;
  label: string;
  type: 'page';
  path: string;
}

interface MenuNavItem {
  id: string;
  label: string;
  type: 'menu';
  path: string;
  matchPathPrefix: string;
  menuItems: { id: string; label: string; path: string }[];
}

interface ScrollNavItem {
  id: string;
  label: string;
  type: 'scroll';
  section: string;
  homePath: string;
}

type NavItem = PageNavItem | MenuNavItem | ScrollNavItem;

// Navigation Configuration
const NAVIGATION_CONFIG: NavItem[] = [
  { id: 'home', label: 'Home', type: 'scroll', section: 'home', homePath: '/' },
  { id: 'app', label: 'App', type: 'scroll', section: 'mobile-app', homePath: '/' },
  { id: 'operator', label: 'Operator', type: 'scroll', section: 'operator-portal', homePath: '/' },
  {
    id: 'legal',
    label: 'Legal',
    type: 'menu',
    path: '/legal',
    matchPathPrefix: '/legal',
    menuItems: [
      { id: 'app-terms', label: 'App Terms', path: '/legal/app/terms-of-service' },
      { id: 'app-privacy', label: 'App Privacy', path: '/legal/app/privacy-policy' },
      { id: 'operator-terms', label: 'Operator Terms', path: '/legal/operator/terms-of-service' },
      { id: 'operator-privacy', label: 'Operator Privacy', path: '/legal/operator/privacy-policy' }
    ]
  },
  { id: 'contact', label: 'Contact', type: 'page', path: '/contact' },
  { id: 'careers', label: 'Careers', type: 'page', path: '/careers' }
];

// Type Guards
const isMenuNavItem = (item: NavItem): item is MenuNavItem => item.type === 'menu';
const isScrollNavItem = (item: NavItem): item is ScrollNavItem => item.type === 'scroll';

// Helper to check if a menu is active
const isMenuActive = (item: MenuNavItem, pathname: string): boolean => {
  return pathname.startsWith(item.matchPathPrefix);
};

// Find the active menu (if any)
const getActiveMenu = (pathname: string): MenuNavItem | undefined => {
  return NAVIGATION_CONFIG.find(
    (item) => isMenuNavItem(item) && isMenuActive(item, pathname)
  ) as MenuNavItem | undefined;
};

// Check if a nav item is active
const isNavItemActive = (
  item: NavItem,
  pathname: string,
  activeSection: string
): boolean => {
  if (isMenuNavItem(item)) {
    return isMenuActive(item, pathname);
  }
  if (isScrollNavItem(item)) {
    return pathname === '/' && activeSection === item.section;
  }
  // Page nav item
  return pathname === (item as PageNavItem).path;
};

interface SidebarProps {
  isCollapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onCollapsedChange }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeSection, scrollToSection } = useScrollToSection();
  const [isMobile, setIsMobile] = useState(false);

  // Menu transition state
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'to-submenu' | 'to-main' | null>(null);
  const [displayedMenu, setDisplayedMenu] = useState<MenuNavItem | undefined>(undefined);
  const prevPathnameRef = useRef(location.pathname);

  // Check for mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile && !isCollapsed) {
        onCollapsedChange(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isCollapsed, onCollapsedChange]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Handle menu transitions
  useEffect(() => {
    const currentMenu = getActiveMenu(location.pathname);
    const prevMenu = getActiveMenu(prevPathnameRef.current);

    // Determine if we're transitioning between main nav and submenu
    const wasInSubmenu = !!prevMenu;
    const isInSubmenu = !!currentMenu;

    if (wasInSubmenu !== isInSubmenu) {
      // Transitioning between main and submenu
      setIsTransitioning(true);
      setTransitionDirection(isInSubmenu ? 'to-submenu' : 'to-main');

      // After the exit animation, update the displayed menu
      setTimeout(() => {
        setDisplayedMenu(currentMenu);
        // After a brief moment, trigger the enter animation
        setTimeout(() => {
          setIsTransitioning(false);
          setTransitionDirection(null);
        }, 50);
      }, 200); // Match CSS transition duration
    } else {
      // Same menu type, just update immediately
      setDisplayedMenu(currentMenu);
    }

    prevPathnameRef.current = location.pathname;
  }, [location.pathname]);

  // Handle click for scroll nav items
  const handleScrollNavClick = (e: React.MouseEvent, item: ScrollNavItem) => {
    e.preventDefault();
    if (location.pathname === '/') {
      scrollToSection(item.section);
    } else {
      navigate('/');
      sessionStorage.setItem('scrollToSection', item.section);
    }
    if (isMobile) {
      onCollapsedChange(true);
    }
  };

  // Handle click for page nav items
  const handlePageNavClick = () => {
    if (isMobile) {
      onCollapsedChange(true);
    }
  };

  // Handle click for menu nav items
  const handleMenuNavClick = (e: React.MouseEvent, item: MenuNavItem) => {
    e.preventDefault();
    navigate(item.path);
    if (isMobile) {
      onCollapsedChange(true);
    }
  };

  // Handle back button click in submenu
  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/');
    if (isMobile) {
      onCollapsedChange(true);
    }
  };

  // Handle submenu item click
  const handleSubmenuItemClick = () => {
    if (isMobile) {
      onCollapsedChange(true);
    }
  };

  // Render a single nav item
  const renderNavItem = (item: NavItem) => {
    const active = isNavItemActive(item, location.pathname, activeSection);

    if (isScrollNavItem(item)) {
      return (
        <Link
          key={item.id}
          to={item.homePath}
          onClick={(e) => handleScrollNavClick(e, item)}
          className={`sidebar-link ${active ? 'active' : ''}`}
        >
          {item.label}
        </Link>
      );
    }

    if (isMenuNavItem(item)) {
      return (
        <Link
          key={item.id}
          to={item.path}
          onClick={(e) => handleMenuNavClick(e, item)}
          className={`sidebar-link legal-nav-item ${active ? 'active' : ''}`}
        >
          {item.label}
          <span className="legal-hover-arrow">→</span>
        </Link>
      );
    }

    // Page nav item
    const pageItem = item as PageNavItem;
    return (
      <Link
        key={pageItem.id}
        to={pageItem.path}
        onClick={handlePageNavClick}
        className={`sidebar-link ${active ? 'active' : ''}`}
      >
        {pageItem.label}
      </Link>
    );
  };

  // Get transition classes
  const getNavClasses = () => {
    const classes = ['sidebar-nav-content'];
    if (isTransitioning) {
      classes.push('transitioning');
      if (transitionDirection === 'to-submenu') {
        classes.push('exit-left');
      } else if (transitionDirection === 'to-main') {
        classes.push('exit-right');
      }
    }
    return classes.join(' ');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && !isCollapsed && (
        <div className="sidebar-overlay" onClick={() => onCollapsedChange(true)} />
      )}

      <div className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobile ? 'mobile' : ''}`}>
        <nav className="sidebar-nav">
          <div className={getNavClasses()}>
            {displayedMenu ? (
              // Show submenu when a menu nav item is active
              <>
                <Link
                  to="/"
                  className="sidebar-link sidebar-back-link"
                  onClick={handleBackClick}
                >
                  <span className="back-arrow">←</span> Back
                </Link>
                {displayedMenu.menuItems.map((menuItem) => (
                  <Link
                    key={menuItem.id}
                    to={menuItem.path}
                    className={`sidebar-link ${location.pathname === menuItem.path ? 'active' : ''}`}
                    onClick={handleSubmenuItemClick}
                  >
                    {menuItem.label}
                  </Link>
                ))}
              </>
            ) : (
              // Show main navigation
              NAVIGATION_CONFIG.map(renderNavItem)
            )}
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
