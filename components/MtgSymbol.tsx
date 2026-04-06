import React from 'react';

interface MtgSymbolProps {
  symbol: string;
  size?: number;
  className?: string;
}

const COLORED_SYMBOLS: Record<string, { bg: string; border: string; text: string; label: string; content: string }> = {
  W: { bg: '#f4efda', border: '#c8b870', text: '#604030', label: 'White', content: '☀' },
  U: { bg: '#2060a8', border: '#184880', text: '#ffffff', label: 'Blue', content: '💧' },
  B: { bg: '#1a1410', border: '#504030', text: '#d0c0a0', label: 'Black', content: '💀' },
  R: { bg: '#c83820', border: '#982010', text: '#ffffff', label: 'Red', content: '🔥' },
  G: { bg: '#286020', border: '#1c4818', text: '#d8f0c0', label: 'Green', content: '🌲' },
  C: { bg: '#d8d8d0', border: '#a8a8a0', text: '#484840', label: 'Colorless', content: '◇' },
  S: { bg: '#c0e0f8', border: '#80b8e0', text: '#103050', label: 'Snow', content: '❄' },
};

const NUMERIC_BG = '#8a7a6a';
const NUMERIC_BORDER = '#5a4a3a';
const NUMERIC_TEXT = '#f0e8d8';

function renderSymbolContent(sym: string): React.ReactElement {
  const upper = sym.toUpperCase();

  // Tap symbol
  if (upper === 'T') {
    return (
      <svg
        viewBox="0 0 12 12"
        width="100%"
        height="100%"
        style={{ display: 'block' }}
        aria-label="Tap"
      >
        <circle cx="6" cy="6" r="5" fill="#b89050" stroke="#806020" strokeWidth="0.8" />
        <path
          d="M5 3 L9 6 L5 9"
          fill="none"
          stroke="#fff8e0"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  // Untap symbol
  if (upper === 'Q') {
    return (
      <svg
        viewBox="0 0 12 12"
        width="100%"
        height="100%"
        style={{ display: 'block' }}
        aria-label="Untap"
      >
        <circle cx="6" cy="6" r="5" fill="#50a0c8" stroke="#1878a0" strokeWidth="0.8" />
        <path
          d="M7 9 L3 6 L7 3"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  // Colored mana symbols
  if (COLORED_SYMBOLS[upper]) {
    const { bg, border, text, label, content } = COLORED_SYMBOLS[upper];
    return (
      <svg
        viewBox="0 0 12 12"
        width="100%"
        height="100%"
        style={{ display: 'block' }}
        aria-label={label}
      >
        <circle cx="6" cy="6" r="5.2" fill={bg} stroke={border} strokeWidth="0.8" />
        <text
          x="6"
          y="8.5"
          textAnchor="middle"
          fontSize="6"
          fill={text}
          fontFamily="serif"
          fontWeight="bold"
        >
          {content}
        </text>
      </svg>
    );
  }

  // X, Y, Z generic
  if (['X', 'Y', 'Z'].includes(upper)) {
    return (
      <svg
        viewBox="0 0 12 12"
        width="100%"
        height="100%"
        style={{ display: 'block' }}
        aria-label={upper}
      >
        <circle cx="6" cy="6" r="5.2" fill={NUMERIC_BG} stroke={NUMERIC_BORDER} strokeWidth="0.8" />
        <text
          x="6"
          y="8.8"
          textAnchor="middle"
          fontSize="6.5"
          fill={NUMERIC_TEXT}
          fontFamily="serif"
          fontWeight="bold"
        >
          {upper}
        </text>
      </svg>
    );
  }

  // Numeric generic mana (0–20)
  const num = parseInt(upper, 10);
  if (!isNaN(num)) {
    const fontSize = num >= 10 ? 4.5 : 6.5;
    return (
      <svg
        viewBox="0 0 12 12"
        width="100%"
        height="100%"
        style={{ display: 'block' }}
        aria-label={`${num} generic mana`}
      >
        <circle cx="6" cy="6" r="5.2" fill={NUMERIC_BG} stroke={NUMERIC_BORDER} strokeWidth="0.8" />
        <text
          x="6"
          y="8.8"
          textAnchor="middle"
          fontSize={fontSize}
          fill={NUMERIC_TEXT}
          fontFamily="serif"
          fontWeight="bold"
        >
          {upper}
        </text>
      </svg>
    );
  }

  // Phyrexian hybrid: e.g. W/P
  if (upper.includes('/P')) {
    const colorKey = upper.replace('/P', '');
    const colorData = COLORED_SYMBOLS[colorKey];
    const bg = colorData?.bg ?? NUMERIC_BG;
    const border = colorData?.border ?? NUMERIC_BORDER;
    return (
      <svg
        viewBox="0 0 12 12"
        width="100%"
        height="100%"
        style={{ display: 'block' }}
        aria-label={`Phyrexian ${colorKey}`}
      >
        <circle cx="6" cy="6" r="5.2" fill={bg} stroke={border} strokeWidth="0.8" />
        <text x="6" y="8.5" textAnchor="middle" fontSize="6" fill="#fff" fontFamily="serif" fontWeight="bold">
          Φ
        </text>
      </svg>
    );
  }

  // Hybrid mana: e.g. W/U
  if (upper.includes('/')) {
    const [a, b] = upper.split('/');
    const aData = COLORED_SYMBOLS[a];
    const bData = COLORED_SYMBOLS[b];
    return (
      <svg
        viewBox="0 0 12 12"
        width="100%"
        height="100%"
        style={{ display: 'block' }}
        aria-label={`Hybrid ${a}/${b}`}
      >
        <circle cx="6" cy="6" r="5.2" fill={aData?.bg ?? NUMERIC_BG} stroke={aData?.border ?? NUMERIC_BORDER} strokeWidth="0.8" />
        <clipPath id={`clip-left-${a}${b}`}>
          <rect x="0" y="0" width="6" height="12" />
        </clipPath>
        <circle cx="6" cy="6" r="5.2" fill={bData?.bg ?? NUMERIC_BG} clipPath={`url(#clip-left-${a}${b})`} />
        <line x1="6" y1="0.8" x2="6" y2="11.2" stroke="#fff" strokeWidth="0.6" opacity="0.6" />
      </svg>
    );
  }

  // Fallback
  return (
    <svg viewBox="0 0 12 12" width="100%" height="100%" style={{ display: 'block' }} aria-label={sym}>
      <circle cx="6" cy="6" r="5.2" fill="#888" stroke="#555" strokeWidth="0.8" />
      <text x="6" y="8.5" textAnchor="middle" fontSize="5" fill="#fff" fontFamily="serif" fontWeight="bold">
        ?
      </text>
    </svg>
  );
}

/** Renders a single MTG mana/tap symbol badge. */
export function MtgSymbol({ symbol, size = 16, className = '' }: MtgSymbolProps) {
  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      title={`{${symbol}}`}
    >
      {renderSymbolContent(symbol)}
    </span>
  );
}

/** Parses a mana cost string like "{2}{W}{U}" into symbol tokens. */
export function parseManaString(manaStr: string): string[] {
  if (!manaStr) return [];
  const tokens: string[] = [];
  const regex = /\{([^}]+)\}/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(manaStr)) !== null) {
    tokens.push(match[1]);
  }
  return tokens;
}

/** Renders a full mana cost string as a row of symbol badges. */
export function ManaCostDisplay({
  manaCost,
  size = 18,
  className = '',
}: {
  manaCost: string;
  size?: number;
  className?: string;
}) {
  const symbols = parseManaString(manaCost);
  if (symbols.length === 0) return null;
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`}>
      {symbols.map((sym, i) => (
        <MtgSymbol key={i} symbol={sym} size={size} />
      ))}
    </span>
  );
}

/** Renders rules text with inline mana/tap symbols. */
export function RulesTextWithSymbols({
  text,
  className = '',
  symbolSize = 14,
}: {
  text: string;
  className?: string;
  symbolSize?: number;
}) {
  if (!text) return null;

  const parts = text.split(/(\{[^}]+\})/g);

  return (
    <span className={`inline ${className}`}>
      {parts.map((part, i) => {
        const match = part.match(/^\{([^}]+)\}$/);
        if (match) {
          return (
            <MtgSymbol
              key={i}
              symbol={match[1]}
              size={symbolSize}
              className="mx-[1px] align-middle"
            />
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}
