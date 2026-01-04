import { useEffect, useState } from 'react';

export const useScrollToSection = () => {
  const [activeSection, setActiveSection] = useState('home');

  const scrollToSection = (sectionId: string) => {
    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.offsetTop - 100; // Offset for better visibility
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const trackedSections = ['operator-portal', 'mobile-app'];
      const scrollPosition = window.scrollY + 150; // Offset for better detection

      // Sort sections by their position on the page so we always pick the one furthest down the page that we've reached
      const orderedSections = trackedSections
        .map((section) => {
          const element = document.getElementById(section);
          return element ? { section, offsetTop: element.offsetTop } : null;
        })
        .filter((item): item is { section: string; offsetTop: number } => !!item)
        .sort((a, b) => a.offsetTop - b.offsetTop);

      let currentSection = 'home';

      orderedSections.forEach(({ section, offsetTop }) => {
        if (offsetTop <= scrollPosition) {
          currentSection = section;
        }
      });

      setActiveSection(currentSection);

      // If we're at the very top, set to home
      if (window.scrollY < 50) {
        setActiveSection('home');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { activeSection, scrollToSection };
};
