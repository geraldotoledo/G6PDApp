import React from 'react';
import { ScanText, Pill, AlertCircle, BookOpen } from 'lucide-react';

export type ActiveTab = 'SCANNER' | 'DRUGS' | 'EMERGENCY' | 'ABOUT';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'SCANNER' as ActiveTab, label: 'Analisador', icon: ScanText },
    { id: 'DRUGS' as ActiveTab, label: 'Remédios & INS', icon: Pill },
    { id: 'EMERGENCY' as ActiveTab, label: 'Emergência', icon: AlertCircle },
    { id: 'ABOUT' as ActiveTab, label: 'Diretrizes', icon: BookOpen }
  ];

  return (
    <nav className="bottom-nav no-print">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={20} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
