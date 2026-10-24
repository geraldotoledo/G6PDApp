import React, { useState, useEffect } from 'react';
import { ProfileMode } from './engine/types.ts';
import { DEFAULT_G6PD_DATABASE } from './data/defaultRules.ts';
import { Header } from './components/Header.tsx';
import { Navigation, ActiveTab } from './components/Navigation.tsx';
import { ScannerScreen } from './components/ScannerScreen.tsx';
import { SafePantryScreen } from './components/SafePantryScreen.tsx';
import { DrugSearchScreen } from './components/DrugSearchScreen.tsx';
import { EmergencyCardScreen } from './components/EmergencyCardScreen.tsx';
import { AboutScreen } from './components/AboutScreen.tsx';
import { OnboardingModal } from './components/OnboardingModal.tsx';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('SCANNER');
  const [profileMode, setProfileMode] = useState<ProfileMode>(() => {
    return (localStorage.getItem('g6pd_profile_mode') as ProfileMode) || 'BRAZIL_PEDIATRIC';
  });

  const [pantrySelectedText, setPantrySelectedText] = useState<string>('');
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('g6pd_disclaimer_accepted_v1');
    if (!accepted) {
      setShowOnboarding(true);
    }
  }, []);

  const handleProfileModeChange = (mode: ProfileMode) => {
    setProfileMode(mode);
    localStorage.setItem('g6pd_profile_mode', mode);
  };

  const handleAnalyzeFromPantry = (ingredients: string) => {
    setPantrySelectedText(ingredients);
    setActiveTab('SCANNER');
  };

  return (
    <div className="app-container">
      <Header
        profileMode={profileMode}
        onProfileModeChange={handleProfileModeChange}
        rulesVersion={DEFAULT_G6PD_DATABASE.rulesVersion}
      />

      <main style={{ minHeight: 'calc(100vh - 200px)' }}>
        {activeTab === 'SCANNER' && (
          <ScannerScreen
            profileMode={profileMode}
            initialText={pantrySelectedText}
            onClearInitialText={() => setPantrySelectedText('')}
          />
        )}
        {activeTab === 'PANTRY' && (
          <SafePantryScreen onAnalyzeProduct={handleAnalyzeFromPantry} />
        )}
        {activeTab === 'DRUGS' && (
          <DrugSearchScreen profileMode={profileMode} />
        )}
        {activeTab === 'EMERGENCY' && (
          <EmergencyCardScreen />
        )}
        {activeTab === 'ABOUT' && (
          <AboutScreen />
        )}
      </main>

      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {showOnboarding && (
        <OnboardingModal onAccept={() => setShowOnboarding(false)} />
      )}
    </div>
  );
};

export default App;
