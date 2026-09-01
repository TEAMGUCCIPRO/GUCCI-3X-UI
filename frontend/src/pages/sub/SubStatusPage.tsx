import GucciWordmark from './GucciWordmark';
import SubPromoBanner from './SubPromoBanner';

export type SubStatusKind = 'disabled' | 'removed' | 'expired' | 'depleted';

const COPY: Record<SubStatusKind, { title: string; body: string; state: string }> = {
  disabled: {
    title: 'سرویس شما غیرفعال شده است',
    body: 'کاربر گرامی، این سرویس توسط مالک سرویس غیرفعال شده است و در حال حاضر امکان استفاده از لینک اشتراک وجود ندارد.',
    state: 'وضعیت سرویس: غیرفعال',
  },
  removed: {
    title: 'کاربر گرامی این سرویس شما منقضی و حذف شده است',
    body: 'کاربر گرامی، این سرویس توسط مالک سرویس منقضی و حذف شده است و در حال حاضر امکان استفاده از لینک اشتراک وجود ندارد.',
    state: 'وضعیت سرویس: غیرفعال',
  },
  expired: {
    title: 'سرویس شما منقضی شده است',
    body: 'کاربر گرامی، مدت زمان این سرویس به پایان رسیده است و در حال حاضر امکان استفاده از لینک اشتراک وجود ندارد.',
    state: 'وضعیت سرویس: منقضی',
  },
  depleted: {
    title: 'حجم سرویس شما به پایان رسیده است',
    body: 'کاربر گرامی، حجم این سرویس به طور کامل مصرف شده است و در حال حاضر امکان استفاده از لینک اشتراک وجود ندارد.',
    state: 'وضعیت سرویس: اتمام حجم',
  },
};

// Full-screen neon status page shown instead of the dashboard when the
// subscription is disabled, expired, out of quota or deleted. The promo block
// underneath is the exact same component used on the active page.
export default function SubStatusPage({
  kind,
  announce,
}: {
  kind: SubStatusKind;
  announce: string;
}) {
  const copy = COPY[kind];
  const tone = kind === 'disabled' ? 'amber' : 'red';

  return (
    <div className={`gucci-status-wrap gucci-status--${tone}`}>
      <div className="gucci-status-card">
        <div className="gucci-status-beam" aria-hidden="true" />
        <div className="gucci-status-icon" aria-hidden="true">
          <span>🚫</span>
        </div>

        <GucciWordmark text={announce} className="gucci-wordmark--hero" />

        <h1 className="gucci-status-title">
          {copy.title} <span className="gucci-status-title-emoji">🚫</span>
        </h1>
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
  );
}
