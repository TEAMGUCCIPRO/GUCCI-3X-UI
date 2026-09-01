import { Button, Col, Row } from 'antd';

import GucciWordmark from './GucciWordmark';

// Official brand glyphs (Font Awesome brand paths — the exact app icons).
const TELEGRAM_ICON =
  'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z';
const INSTAGRAM_ICON =
  'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z';
const YOUTUBE_ICON =
  'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z';

export const promoItems = [
  { label: 'ربات تلگرام', url: 'https://t.me/ThunderEcho3448bot', icon: TELEGRAM_ICON, kind: 'telegram', theme: 'purple' },
  { label: 'پشتیبانی تلگرام', url: 'https://t.me/MR_GUCCI_YT', icon: TELEGRAM_ICON, kind: 'telegram', theme: 'red' },
  { label: 'کانال اول تلگرام', url: 'https://t.me/VPN_GUCCI_CHANEL', icon: TELEGRAM_ICON, kind: 'telegram', theme: 'blue' },
  { label: 'کانال دوم تلگرام', url: 'https://t.me/VPN_GUCCI_IR', icon: TELEGRAM_ICON, kind: 'telegram', theme: 'yellow' },
  { label: 'کانال سوم تلگرام', url: 'https://t.me/GUCCI_CHANEL_IR', icon: TELEGRAM_ICON, kind: 'telegram', theme: 'purple' },
  { label: 'گروه چت تلگرام', url: 'https://t.me/GUCCI_CHAT_IR', icon: TELEGRAM_ICON, kind: 'telegram', theme: 'silver' },
  { label: 'اینستاگرام', url: 'https://www.instagram.com/vpn_gucci_ir?igsi=MXRsdmhid3pxZmZqMQ%3D%3D&utm_source=qr', icon: INSTAGRAM_ICON, kind: 'instagram', theme: 'insta' },
  { label: 'یوتیوب', url: 'https://youtube.com/@vpn_gucci?si=HOdcsuj20CH3aAv5', icon: YOUTUBE_ICON, kind: 'youtube', theme: 'yt' },
];

// The channel/support promo block shown on the subscription page. Rendered
// identically on the active page, the disabled/expired page and the
// removed-subscription page — same markup, colors, buttons and animations.
export default function SubPromoBanner({ announce }: { announce: string }) {
  const open = (url: string) => {
    if (!url) return;
    window.open(url, '_blank');
  };

  return (
    <div className="gucci-promo-banner">
      <div className="promo-title">
        <GucciWordmark text={announce} />
      </div>
      <div className="promo-subtitle">
        برای دریافت پنل و اطلاعات بیشتر حتما با آی‌دی‌های زیر در تلگرام با ما در ارتباط باشید:
      </div>

      <Row gutter={[12, 12]} className="promo-grid">
        {promoItems.map((item) => (
          <Col key={item.label} xs={24} sm={12}>
            <Button
              block
              className={`promo-btn promo-btn--${item.theme}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
              }}
              onClick={() => open(item.url)}
            >
              <span className={`app-icon app-icon--${item.kind}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d={item.icon} />
                </svg>
              </span>
              <span className="promo-label">{item.label}</span>
            </Button>
          </Col>
        ))}
      </Row>
    </div>
  );
}
