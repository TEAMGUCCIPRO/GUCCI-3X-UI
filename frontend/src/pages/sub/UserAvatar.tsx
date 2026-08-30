import React, { useMemo } from 'react';

interface UserAvatarProps {
  seed: string;
  size?: number;
  isActive?: boolean;
}

// 12 unique, deterministic cyberpunk/gamer SVG avatars (6 masculine, 6 feminine)
export const UserAvatar: React.FC<UserAvatarProps> = ({ seed, size = 52, isActive = true }) => {
  const avatarIndex = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) % 12;
  }, [seed]);

  const avatar = useMemo(() => {
    const palette = [
      { bg1: '#3b0764', bg2: '#7e22ce', hair: '#c084fc', skin: '#fcd34d', acc: '#f43f5e', visor: '#38bdf8' },
      { bg1: '#1e1b4b', bg2: '#4338ca', hair: '#818cf8', skin: '#fed7aa', acc: '#fbbf24', visor: '#ec4899' },
      { bg1: '#064e3b', bg2: '#059669', hair: '#34d399', skin: '#fde68a', acc: '#a855f7', visor: '#facc15' },
      { bg1: '#881337', bg2: '#e11d48', hair: '#fb7185', skin: '#fecdd3', acc: '#38bdf8', visor: '#a855f7' },
      { bg1: '#172554', bg2: '#2563eb', hair: '#60a5fa', skin: '#fef08a', acc: '#f97316', visor: '#4ade80' },
      { bg1: '#451a03', bg2: '#d97706', hair: '#fde047', skin: '#ffedd5', acc: '#8b5cf6', visor: '#06b6d4' },
      { bg1: '#581c87', bg2: '#9333ea', hair: '#e879f9', skin: '#fed7aa', acc: '#22c55e', visor: '#f59e0b' },
      { bg1: '#0f172a', bg2: '#334155', hair: '#94a3b8', skin: '#fef3c7', acc: '#ef4444', visor: '#3b82f6' },
      { bg1: '#701a75', bg2: '#c026d3', hair: '#f472b6', skin: '#fde68a', acc: '#06b6d4', visor: '#10b981' },
      { bg1: '#134e4a', bg2: '#0d9488', hair: '#2dd4bf', skin: '#ffedd5', acc: '#e11d48', visor: '#eab308' },
      { bg1: '#7c2d12', bg2: '#ea580c', hair: '#fb923c', skin: '#fef08a', acc: '#6366f1', visor: '#ec4899' },
      { bg1: '#312e81', bg2: '#6366f1', hair: '#a5b4fc', skin: '#fecdd3', acc: '#14b8a6', visor: '#f43f5e' },
    ][avatarIndex];

    const isFemale = avatarIndex % 2 === 1;

    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`bgGrad-${avatarIndex}`} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor={palette.bg1} />
            <stop offset="1" stopColor={palette.bg2} />
          </linearGradient>
          <linearGradient id={`hairGrad-${avatarIndex}`} x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
            <stop stopColor={palette.hair} />
            <stop offset="1" stopColor={palette.acc} />
          </linearGradient>
          <linearGradient id={`ringGrad-${avatarIndex}`} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fef08a" />
            <stop offset="0.5" stopColor="#c084fc" />
            <stop offset="1" stopColor="#38bdf8" />
          </linearGradient>
        </defs>

        {/* Circular Background with Dual Neon Ring */}
        <circle cx="50" cy="50" r="48" fill={`url(#bgGrad-${avatarIndex})`} />
        <circle cx="50" cy="50" r="47" stroke={`url(#ringGrad-${avatarIndex})`} strokeWidth="3" opacity="0.9" />

        {/* Neck and Shoulders */}
        <path d="M30 88C30 75 40 70 50 70C60 70 70 75 70 88" fill={palette.acc} opacity="0.85" />
        <path d="M42 64H58V74H42V64Z" fill={palette.skin} />

        {/* Face */}
        <ellipse cx="50" cy="52" rx="20" ry="22" fill={palette.skin} />

        {/* Hair Styles */}
        {isFemale ? (
          <>
            {/* Long Feminine Cyberpunk Hair */}
            <path
              d="M26 48C24 64 28 82 32 88C34 76 34 54 36 46C38 32 62 32 64 46C66 54 66 76 68 88C72 82 76 64 74 48C74 30 64 22 50 22C36 22 26 30 26 48Z"
              fill={`url(#hairGrad-${avatarIndex})`}
            />
            <path d="M32 38C40 28 60 28 68 38C62 34 38 34 32 38Z" fill={palette.hair} />
          </>
        ) : (
          <>
            {/* Spiky / Short Masculine Cyberpunk Hair */}
            <path
              d="M28 44C26 34 34 22 50 20C66 22 74 34 72 44C68 36 64 34 58 32C52 30 48 30 42 32C36 34 32 36 28 44Z"
              fill={`url(#hairGrad-${avatarIndex})`}
            />
            <path d="M36 24L42 16L48 22L54 14L60 22L66 18L68 28" stroke={palette.hair} strokeWidth="4" strokeLinecap="round" />
          </>
        )}

        {/* Cyber Visor / Glasses / Eyes */}
        {avatarIndex % 3 === 0 ? (
          /* Glowing Cyber Visor */
          <path
            d="M34 46H66C68 46 69 48 68 50L64 56C63 58 61 59 59 59H41C39 59 37 58 36 56L32 50C31 48 32 46 34 46Z"
            fill={palette.visor}
            stroke="#ffffff"
            strokeWidth="1.5"
            filter="drop-shadow(0 0 4px #38bdf8)"
          />
        ) : avatarIndex % 3 === 1 ? (
          /* Gamer Headphones + Cute Eyes */
          <>
            <circle cx="42" cy="50" r="3.5" fill="#1e1b4b" />
            <circle cx="58" cy="50" r="3.5" fill="#1e1b4b" />
            <circle cx="43.5" cy="48.5" r="1.5" fill="#ffffff" />
            <circle cx="59.5" cy="48.5" r="1.5" fill="#ffffff" />
            {/* Headphone band */}
            <path d="M26 48C26 30 74 30 74 48" stroke={palette.acc} strokeWidth="4" strokeLinecap="round" fill="none" />
            <rect x="22" y="44" width="8" height="14" rx="4" fill={palette.visor} />
            <rect x="70" y="44" width="8" height="14" rx="4" fill={palette.visor} />
          </>
        ) : (
          /* Sleek Neon Sunglasses */
          <>
            <rect x="33" y="46" width="14" height="9" rx="2" fill="#0f172a" stroke={palette.visor} strokeWidth="1.5" />
            <rect x="53" y="46" width="14" height="9" rx="2" fill="#0f172a" stroke={palette.visor} strokeWidth="1.5" />
            <line x1="47" y1="49" x2="53" y2="49" stroke={palette.visor} strokeWidth="2" />
          </>
        )}

        {/* Smile */}
        <path d="M45 62Q50 66 55 62" stroke="#475569" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Cyber Head Tattoo / Lightning Accent */}
        <circle cx="50" cy="30" r="2.5" fill={palette.visor} filter="drop-shadow(0 0 3px #fff)" />
      </svg>
    );
  }, [avatarIndex, size]);

  return (
    <div className="user-avatar-wrapper" style={{ width: size, height: size }}>
      {avatar}
      <span
        className={`user-avatar-status ${isActive ? 'user-avatar-status--active' : 'user-avatar-status--inactive'}`}
        title={isActive ? 'فعال' : 'غیرفعال'}
      />
    </div>
  );
};

export default UserAvatar;
