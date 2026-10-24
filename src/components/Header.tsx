import React, { useState } from 'react';
import { ShieldAlert, RefreshCw, Settings2, Check, AlertCircle } from 'lucide-react';
import { ProfileMode } from '../engine/types.ts';
import { syncRulesFromRemote, SyncCheckResult } from '../services/rulesSync.ts';

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
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncCheckResult | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await syncRulesFromRemote();
      setSyncResult(res);
      setTimeout(() => setSyncResult(null), 5000);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <header className="card" style={{ marginBottom: '14px', background: 'linear-gradient(180deg, #162035, #0f172a)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', minWidth: 0, width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
            flexShrink: 0
          }}>
            <ShieldAlert size={22} color="#ffffff" />
          </div>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              G6PDApp
              <span className="badge badge-neutral" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>v{rulesVersion}</span>
            </h1>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Segurança Clínica e Leitor de Rótulos • 100% Offline
            </p>
          </div>
        </div>

        {/* Botão de Sincronização de Regras */}
        <button
          onClick={handleSync}
          disabled={syncing}
          className="btn btn-secondary"
          style={{ padding: '6px 10px', fontSize: '0.72rem', borderRadius: '8px', flexShrink: 0 }}
          title="Verificar atualização da base clínica no GitHub"
        >
          <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
          <span className="no-print">Sincronizar</span>
        </button>
      </div>

      {/* Notificação de Sincronização */}
      {syncResult && (
        <div style={{
          marginTop: '10px',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '0.75rem',
          background: syncResult.updated ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
          border: `1px solid ${syncResult.updated ? '#10b981' : '#3b82f6'}`,
          color: syncResult.updated ? '#6ee7b7' : '#93c5fd',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          {syncResult.updated ? <Check size={14} /> : <AlertCircle size={14} />}
          <span>{syncResult.message}</span>
        </div>
      )}

      {/* Seletor de Modo de Proteção Clínica (Otimizado e Truncado para Mobile) */}
      <div style={{
        marginTop: '12px',
        paddingTop: '10px',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        width: '100%',
        minWidth: 0,
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Settings2 size={14} />
            <span style={{ fontWeight: 600 }}>Protocolo de Proteção:</span>
          </div>
        </div>

        <div style={{ width: '100%', minWidth: 0, overflow: 'hidden' }}>
          <select
            value={profileMode}
            onChange={(e) => onProfileModeChange(e.target.value as ProfileMode)}
            style={{
              width: '100%',
              maxWidth: '100%',
              minWidth: 0,
              background: 'var(--bg-primary)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              display: 'block',
              boxSizing: 'border-box'
            }}
          >
            <option value="BRAZIL_PEDIATRIC">🇧🇷 Brasil Pediátrico (Zero Corantes Artificiais + Sulfitos)</option>
            <option value="STRICT_ZERO_DYES">🛡️ Proteção Máxima (Zero Corantes Totais)</option>
            <option value="GLOBAL_CPIC">🌐 Consenso Internacional (CPIC / OMS Estrito)</option>
          </select>
        </div>
      </div>
    </header>
  );
};
