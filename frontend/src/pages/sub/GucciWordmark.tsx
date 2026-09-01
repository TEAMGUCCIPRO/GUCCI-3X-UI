// The GUCCI TEAM wordmark: 🅣 🅔 🅐 🅜  🅖 🅤 🅒 🅒 🅘
// Sticker emojis (crowns / bolts / spinners) are intentionally stripped — the
// letters themselves carry the neon gaming animation.
export const GUCCI_WORDMARK = '🅣 🅔 🅐 🅜  🅖 🅤 🅒 🅒 🅘';

const STICKER_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{2B00}-\u{2BFF}]/gu;

export default function GucciWordmark({
  text,
  className = '',
}: {
  text?: string;
  className?: string;
}) {
  const cleaned = (text || GUCCI_WORDMARK).replace(STICKER_RE, '').replace(/\s+$/u, '').trim();
  const source = cleaned || GUCCI_WORDMARK;
  const tokens = source.split(' ');

  let letterIndex = 0;

  return (
    <span className={`gucci-wordmark ${className}`.trim()} aria-label="TEAM GUCCI">
      {tokens.map((tok, i) => {
        if (!tok) {
          return <span key={`gap-${i}`} className="gucci-wordmark-gap" aria-hidden="true" />;
        }
        const delay = `${(letterIndex++ * 0.11).toFixed(2)}s`;
        return (
          <span key={`${tok}-${i}`} className="gucci-letter" style={{ animationDelay: delay }}>
            <span className="gucci-letter-glyph" style={{ animationDelay: delay }}>
              {tok}
            </span>
          </span>
        );
      })}
    </span>
  );
}
