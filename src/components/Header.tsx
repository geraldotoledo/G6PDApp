import React from 'react';
import { ShieldAlert, Info, Settings2 } from 'lucide-react';
import { ProfileMode } from '../engine/types.ts';

interface HeaderProps {
  profileMode: ProfileMode;
  onProfileModeChange: (mode: ProfileMode) => void;
  rulesVersion: string;
}

export const Header: React.FC<HeaderProps> = ({
  profileMode,
  onProfileModeChange,
  rulesVersion
}) => {
  return (
    <header className="card" style={{ marginBottom: '16px', background: 'linear-gradient(180deg, #162035, #0f172a)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
          }}>
            <ShieldAlert size={24} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              G6PDApp
              <span className="badge badge-neutral" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>v{rulesVersion}</span>
            </h1>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Segurança Clínica e Leitor de Rótulos • 100% Offline
            </p>
          </div>
        </div>
      </div>

      {/* Seletor de Modo de Proteção Clínica */}
      <div style={{
        marginTop: '14px',
        paddingTop: '12px',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <Settings2 size={15} />
          <span>Protocolo:</span>
        </div>

        <select
          value={profileMode}
          onChange={(e) => onProfileModeChange(e.target.value as ProfileMode)}
          style={{
            background: 'var(--bg-primary)',
            color: 'var(--text-main)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '6px 10px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <option value="BRAZIL_PEDIATRIC">🇧🇷 Brasil Pediátrico (Zero Corantes Artificiais + Sulfitos + CPIC)</option>
          <option value="STRICT_ZERO_DYES">🛡️ Proteção Máxima (Zero Corantes Artificiais e Naturais)</option>
          <option value="GLOBAL_CPIC">🌐 Consenso Internacional (CPIC / OMS estrito)</option>
        </select>
      </div>
    </header>
  );
};
