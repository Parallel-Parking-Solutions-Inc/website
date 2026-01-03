import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';
import Home from './pages/Home';
import Legal from './pages/Legal';
import TermsOfService_App from './pages/TermsOfService_App';
import PrivacyPolicy_App from './pages/PrivacyPolicy_App';
import TermsOfService_Operator from './pages/TermsOfService_Operator';
import PrivacyPolicy_Operator from './pages/PrivacyPolicy_Operator';
import Contact from './pages/Contact';
import Careers from './pages/Careers';
import './App.css';
import TeamMember from './pages/TeamMember';

function AppComponent() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  return (
    <Router>
      <div className="app">
        <TopBar
          onSidebarToggle={handleSidebarToggle}
          isSidebarCollapsed={isSidebarCollapsed}
        />
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onCollapsedChange={setIsSidebarCollapsed}
        />
        <div className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <main className="main-content-inner">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/legal" element={<Legal />} />
              <Route path="/legal/app/terms-of-service" element={<TermsOfService_App />} />
              <Route path="/legal/app/privacy-policy" element={<PrivacyPolicy_App />} />
              <Route path="/legal/operator/terms-of-service" element={<TermsOfService_Operator />} />
              <Route path="/legal/operator/privacy-policy" element={<PrivacyPolicy_Operator />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/team/:id" element={<TeamMember />} />
            </Routes>
          </main>
          <Footer isSidebarCollapsed={isSidebarCollapsed} />
        </div>
        <CookieConsent />
      </div>
    </Router>
  );
}

export default AppComponent;
