import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';
import Home from './pages/Home';
import Legal from './pages/Legal';
import TermsOfServiceApp from './pages/TermsOfService_App';
import PrivacyPolicyApp from './pages/PrivacyPolicy_App';
import TermsOfServiceOperator from './pages/TermsOfService_Operator';
import PrivacyPolicyOperator from './pages/PrivacyPolicy_Operator';
import Contact from './pages/Contact';
import Careers from './pages/Careers';
import './App.css';
import TeamMember from './pages/TeamMember';
import Decks from './pages/Decks';

const AppShell = () => {
  const location = useLocation();
  const isOperatorRedirect = new URLSearchParams(location.search).has('redirect-from-operator');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(isOperatorRedirect);

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  return (
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
            <Route path="/legal/app/terms-of-service" element={<TermsOfServiceApp />} />
            <Route path="/legal/app/privacy-policy" element={<PrivacyPolicyApp />} />
            <Route path="/legal/operator/terms-of-service" element={<TermsOfServiceOperator />} />
            <Route path="/legal/operator/privacy-policy" element={<PrivacyPolicyOperator />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/team/:id" element={<TeamMember />} />
            <Route
              path="/decks/:deckName"
              element={
                <Decks
                  isSidebarCollapsed={isSidebarCollapsed}
                  onCollapseSidebar={setIsSidebarCollapsed}
                />
              }
            />
          </Routes>
        </main>
        <Footer isSidebarCollapsed={isSidebarCollapsed} />
      </div>
      <CookieConsent />
    </div>
  );
};

function AppComponent() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}

export default AppComponent;
