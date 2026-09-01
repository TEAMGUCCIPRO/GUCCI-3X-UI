import type { ReactNode } from 'react';

import GucciWordmark from './GucciWordmark';
import SubPromoBanner from './SubPromoBanner';

export type SubStatusKind = 'disabled' | 'removed' | 'expired' | 'depleted';

const COPY: Record<
  SubStatusKind,
  { title: string; body: string; state: string; badge: string }
> = {
  disabled: {
    title: 'سرویس شما غیرفعال شده است',
    body: 'کاربر گرامی، این سرویس توسط مالک سرویس غیرفعال شده است و در حال حاضر امکان استفاده از لینک اشتراک وجود ندارد.',
    state: 'وضعیت سرویس: غیرفعال',
    badge: 'DISABLED',
  },
  removed: {
    title: 'کاربر گرامی این سرویس شما منقضی و حذف شده است',
    body: 'کاربر گرامی، این سرویس توسط مالک سرویس منقضی و حذف شده است و در حال حاضر امکان استفاده از لینک اشتراک وجود ندارد.',
    state: 'وضعیت سرویس: حذف شده',
    badge: 'REMOVED',
  },
  expired: {
    title: 'سرویس شما منقضی شده است',
    body: 'کاربر گرامی، مدت زمان این سرویس به پایان رسیده است و در حال حاضر امکان استفاده از لینک اشتراک وجود ندارد.',
    state: 'وضعیت سرویس: منقضی',
    badge: 'EXPIRED',
  },
  depleted: {
    title: 'حجم سرویس شما به پایان رسیده است',
    body: 'کاربر گرامی، حجم این سرویس به طور کامل مصرف شده است و در حال حاضر امکان استفاده از لینک اشتراک وجود ندارد.',
    state: 'وضعیت سرویس: اتمام حجم',
    badge: 'NO QUOTA',
  },
};

// Full-screen neon gaming status page shown instead of the dashboard when the
// subscription is disabled, expired, out of quota or deleted. The user header
// (avatar / email / language) and the promo block are the exact same pieces
// used on the active subscription page.
export default function SubStatusPage({
  kind,
  announce,
  header,
  extra,
}: {
  kind: SubStatusKind;
  announce: string;
  header?: ReactNode;
  extra?: ReactNode;
}) {
  const copy = COPY[kind];
  const tone = kind === 'disabled' ? 'amber' : 'red';

  return (
    <div className={`gucci-status-wrap gucci-status--${tone}`}>
      <div className="gucci-stage" aria-hidden="true">
        <span className="gucci-stage-orb gucci-stage-orb--1" />
        <span className="gucci-stage-orb gucci-stage-orb--2" />
        <span className="gucci-stage-orb gucci-stage-orb--3" />
        <span className="gucci-stage-scan" />
        <span className="gucci-stage-bolt gucci-stage-bolt--a" />
        <span className="gucci-stage-bolt gucci-stage-bolt--b" />
      </div>

      <div className="gucci-status-shell">
        {(header || extra) && (
          <div className="gucci-status-topbar">
            <div className="gucci-status-topbar-user">{header}</div>
            <div className="gucci-status-topbar-extra">{extra}</div>
          </div>
        )}

        <div className="gucci-status-card">
          <div className="gucci-status-beam" aria-hidden="true" />

          <div className="gucci-status-badge">
            <span className="gucci-status-badge-dot" aria-hidden="true" />
            {copy.badge}
          </div>

          <div className="gucci-status-icon" aria-hidden="true">
            <span className="gucci-status-icon-ring" />
            <span className="gucci-status-icon-glyph">🚫</span>
          </div>

          <GucciWordmark text={announce} className="gucci-wordmark--hero" />

          <h1 className="gucci-status-title">{copy.title}</h1>
          <div className="gucci-status-divider" aria-hidden="true" />

          <p className="gucci-status-body">{copy.body}</p>

          <div className="gucci-status-pill">🔒 {copy.state}</div>

          <div className="gucci-status-support">
            📩 برای دریافت مجدد سرویس یا فعال‌سازی دوباره، لطفاً با پشتیبانی در ارتباط باشید
          </div>

          <SubPromoBanner announce={announce} />

          <div className="gucci-status-footer">GUCCI TEAM • VPN SERVICE</div>
        </div>
      </div>
    </div>
  );
}
