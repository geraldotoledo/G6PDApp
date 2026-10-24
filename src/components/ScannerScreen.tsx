import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Search,
  RotateCcw,
  BookOpen,
  Info
} from 'lucide-react';
import { AnalysisResult, ProfileMode } from '../engine/types.ts';
import { analyzeIngredientsText } from '../engine/ruleEngine.ts';
import { AiHandoffModal } from './AiHandoffModal.tsx';

interface ScannerScreenProps {
  profileMode: ProfileMode;
}

export const ScannerScreen: React.FC<ScannerScreenProps> = ({ profileMode }) => {
  const [inputText, setInputText] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);

  // Amostras reais para teste rápido
  const sampleRealBiscuits = [
    {
      label: 'Biscoito c/ Sulfito e TBHQ (Real)',
      text: 'INGREDIENTES: Farinha de trigo enriquecida com ferro e ácido fólico, açúcar, gordura vegetal hidrogenada, amido de milho, sal, conservador metabissulfito de sódio (INS 223), antioxidante TBHQ (INS 319) e aromatizante. ALÉRGICOS: CONTÉM DERIVADOS DE TRIGO E SOJA. CONTÉM GLÚTEN.'
    },
    {
      label: 'Piraquê Maltado c/ Caramelo IV (Real)',
      text: 'Ingredientes: Farinha de trigo enriquecida com ferro e ácido fólico, açúcar refinado, gordura vegetal, extrato de malte, corante caramelo IV (processo sulfito-amônia), corante natural urucum, corante natural cúrcuma, sal e fermentos químicos. ALÉRGICOS: CONTÉM DERIVADOS DE TRIGO E CEVADA. CONTÉM GLÚTEN.'
    },
    {
      label: 'Piraquê Coco Seguro (Real)',
      text: 'INGREDIENTES: Farinha de trigo enriquecida com ferro e ácido fólico, açúcar, gordura vegetal, coco ralado desidratado, amido de milho, sal, fermentos químicos e aromatizante. ALÉRGICOS: CONTÉM DERIVADOS DE TRIGO. CONTÉM GLÚTEN.'
    },
    {
      label: 'Farinha c/ Sulfato Ferroso (Safe Lookalike)',
      text: 'Ingredientes: Farinha de trigo, açúcar, sulfato ferroso (ferro), sulfato de zinco (zinco), vitamina K1 (fitomenadiona), sal e aromatizante. ALÉRGICOS: CONTÉM TRIGO. CONTÉM GLÚTEN.'
    },
    {
      label: 'Ibuprofeno Pediátrico (Bula)',
      text: 'Composição: Cada ml de suspensão oral contém 100 mg de Ibuprofeno. Veículo/Excipientes: sorbitol, benzoato de sódio, aroma de morango, ácido cítrico e água purificada.'
    }
  ];

  const analysis: AnalysisResult | null = inputText.trim()
    ? analyzeIngredientsText(inputText, { profileMode })
    : null;

  // Função para renderizar o texto com destaque colorido nas palavras identificadas
  const renderHighlightedText = () => {
    if (!analysis || !inputText) return null;

    const normalized = analysis.normalizedText;
    const spans = [...analysis.highlightSpans];

    if (spans.length === 0) {
      return <span>{inputText}</span>;
    }

    const elements: React.ReactNode[] = [];
    let lastIdx = 0;

    spans.forEach((span, index) => {
      // Texto antes do span
      if (span.start > lastIdx) {
        elements.push(<span key={`text-${index}`}>{normalized.substring(lastIdx, span.start)}</span>);
      }

      // Span com destaque
      let className = 'hl-yellow';
      if (span.type === 'RED') className = 'hl-red';
      if (span.type === 'SAFE_LOOKALIKE') className = 'hl-safe';

      elements.push(
        <mark
          key={`span-${index}`}
          className={className}
          title={span.message || span.ruleName || ''}
        >
          {normalized.substring(span.start, span.end)}
        </mark>
      );

      lastIdx = span.end;
    });

    if (lastIdx < normalized.length) {
      elements.push(<span key="text-end">{normalized.substring(lastIdx)}</span>);
    }

    return elements;
  };

  return (
    <div>
      {/* Caixa de Entrada de Texto do Rótulo */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Search size={16} />
            Texto do Rótulo ou Bula
          </label>
          {inputText && (
            <button
              onClick={() => setInputText('')}
              className="btn btn-secondary"
              style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '6px' }}
            >
              <RotateCcw size={12} />
              Limpar
            </button>
          )}
        </div>

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Cole aqui o texto do rótulo lido pela câmera, bula do medicamento ou lista de ingredientes..."
          rows={4}
          style={{
            width: '100%',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            color: 'var(--text-main)',
            padding: '12px',
            fontSize: '0.88rem',
            fontFamily: 'var(--font-sans)',
            resize: 'vertical',
            lineHeight: '1.5'
          }}
        />

        {/* Botões rápidos de amostras reais */}
        <div style={{ marginTop: '10px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '6px', fontWeight: 600 }}>
            Exemplos Reais para Teste:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {sampleRealBiscuits.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => setInputText(sample.text)}
                style={{
                  background: 'var(--bg-card-subtle)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-muted)',
                  fontSize: '0.72rem',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Veredito do Semáforo */}
      {analysis && (
        <>
          <div className={`traffic-banner ${
            analysis.status === 'RED_BLOCKED' ? 'red' :
            analysis.status === 'YELLOW_ATTENTION' || analysis.status === 'YELLOW_INCOMPLETE_SCAN' ? 'yellow' : 'green'
          }`}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {analysis.status === 'RED_BLOCKED' && <AlertOctagon size={36} color="#ef4444" />}
                {(analysis.status === 'YELLOW_ATTENTION' || analysis.status === 'YELLOW_INCOMPLETE_SCAN') && (
                  <AlertTriangle size={36} color="#f59e0b" />
                )}
                {analysis.status === 'GREEN_SAFE' && <CheckCircle2 size={36} color="#10b981" />}

                <div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                    {analysis.statusTitle}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '2px', opacity: 0.9 }}>
                    {analysis.summary}
                  </div>
                </div>
              </div>

              <span className={`badge ${
                analysis.status === 'RED_BLOCKED' ? 'badge-red' :
                analysis.status === 'YELLOW_ATTENTION' || analysis.status === 'YELLOW_INCOMPLETE_SCAN' ? 'badge-yellow' : 'badge-green'
              }`}>
                {analysis.statusBadge}
              </span>
            </div>
          </div>

          {/* Alerta de Leitura Incompleta (Blindagem 1) */}
          {analysis.status === 'YELLOW_INCOMPLETE_SCAN' && (
            <div className="card" style={{ borderLeft: '4px solid #f59e0b', background: 'rgba(245, 158, 11, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Info size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.84rem', lineHeight: '1.5' }}>
                  <strong>Trava de Segurança Anti-Falso-Negativo:</strong> O aplicativo não encontrou termos proibidos no trecho lido, mas a lista de ingredientes parece cortada no início ou no fim (sem os avisos de "ALÉRGICOS" ou ponto final).
                  <br />
                  <em>Para 100% de segurança, aproxime a câmera sem reflexo para enquadrar a lista inteira.</em>
                </div>
              </div>
            </div>
          )}

          {/* Alerta de Excipientes em Medicamentos Pediátricos (Blindagem 3) */}
          {analysis.pediatricSyrupAlerts.length > 0 && (
            <div className="card" style={{ borderLeft: '4px solid #3b82f6', background: 'rgba(59, 130, 246, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Info size={20} color="#3b82f6" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#93c5fd', marginBottom: '4px' }}>
                    Atenção aos Excipientes Pediátricos
                  </div>
                  {analysis.pediatricSyrupAlerts.map((alert, idx) => (
                    <div key={idx} style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                      {alert}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Botão de Destaque: Analisar a Fundo com Minha IA */}
          <div style={{ marginBottom: '16px' }}>
            <button
              className="btn btn-ai"
              style={{ width: '100%', padding: '14px', fontSize: '0.98rem' }}
              onClick={() => setShowAiModal(true)}
            >
              <Sparkles size={20} />
              ✨ Analisar a Fundo com Minha IA (Gemini, ChatGPT, Claude)
            </button>
          </div>

          {/* Texto com Destaque Colorido */}
          <div className="card">
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
              Texto Analisado e Destaques
            </h4>
            <div className="highlight-box">
              {renderHighlightedText()}
            </div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', background: '#ef4444', borderRadius: '2px', display: 'inline-block' }}></span>
                Proibido / Restrito
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', background: '#f59e0b', borderRadius: '2px', display: 'inline-block' }}></span>
                Cautela / Ambíguo
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '2px', display: 'inline-block' }}></span>
                Nutriente Seguro (Não é sulfito)
              </span>
            </div>
          </div>

          {/* Detalhamento das Regras Disparadas */}
          {analysis.matches.length > 0 && (
            <div className="card">
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase' }}>
                Substâncias Identificadas ({analysis.matches.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {analysis.matches.map((match, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      padding: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                        {match.rule.name}
                      </span>
                      <span className={`badge ${
                        match.effectiveRisk === 'HIGH_RISK' || match.effectiveRisk === 'RESTRICTED_BR'
                          ? 'badge-red'
                          : match.effectiveRisk === 'CAUTION' ? 'badge-yellow' : 'badge-green'
                      }`}>
                        {match.effectiveRisk}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                      {match.rule.clinicalMechanism}
                    </p>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                      <span>Fonte: <strong>{match.rule.protocolSource}</strong></span>
                      {match.rule.insCode && <span>• INS: <strong>{match.rule.insCode}</strong></span>}
                      {match.rule.eNumber && <span>• E-Number: <strong>{match.rule.eNumber}</strong></span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Falsos Amigos Seguros Reconhecidos */}
          {analysis.safeLookalikesDetected.length > 0 && (
            <div className="card">
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#6ee7b7', marginBottom: '10px', textTransform: 'uppercase' }}>
                Nutrientes Seguros Reconhecidos ({analysis.safeLookalikesDetected.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {analysis.safeLookalikesDetected.map((safe, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '8px',
                      padding: '10px',
                      fontSize: '0.8rem'
                    }}
                  >
                    <strong style={{ color: '#a7f3d0' }}>{safe.term}:</strong> {safe.explanation}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de Handoff para IA */}
      {showAiModal && analysis && (
        <AiHandoffModal
          analysis={analysis}
          onClose={() => setShowAiModal(false)}
        />
      )}
    </div>
  );
};
