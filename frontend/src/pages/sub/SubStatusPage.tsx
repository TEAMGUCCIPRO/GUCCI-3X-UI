import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import GucciWordmark from './GucciWordmark';
import SubPromoBanner from './SubPromoBanner';

export type SubStatusKind = 'disabled' | 'removed' | 'expired' | 'depleted';

const BADGE: Record<SubStatusKind, string> = {
  disabled: 'DISABLED',
  removed: 'REMOVED',
  expired: 'EXPIRED',
  depleted: 'NO QUOTA',
};

// Full-screen neon gaming status page shown instead of the dashboard when the
// subscription is disabled, expired, out of quota or deleted. The user header
// (avatar / email / language) and the promo block are the exact same pieces
// used on the active subscription page, and every string is translated.
export default function SubStatusPage({
  kind,
  announce,
  header,
  extra,
  configName,
}: {
  kind: SubStatusKind;
  announce: string;
  header?: ReactNode;
  extra?: ReactNode;
  configName?: string;
}) {
  const { t } = useTranslation();
  const tone = kind === 'disabled' ? 'amber' : 'red';

  const title = t(`subscription.gucci.${kind}Title`);
  const body = t(`subscription.gucci.${kind}Body`);
  const state = t(`subscription.gucci.${kind}State`);

  return (
    <div className={`gucci-status-wrap gucci-status--${tone}`}>
      <div className="gucci-stage" aria-hidden="true">
        <span className="gucci-stage-orb gucci-stage-orb--1" />
        <span className="gucci-stage-orb gucci-stage-orb--2" />
        <span className="gucci-stage-orb gucci-stage-orb--3" />
        <span className="gucci-stage-scan" />
        <span className="gucci-stage-bolt gucci-stage-bolt--a" />
        <span className="gucci-stage-bolt gucci-stage-bolt--b" />
        <span className="gucci-stage-vignette" />
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
            {BADGE[kind]}
          </div>

          <div className="gucci-status-icon" aria-hidden="true">
            <span className="gucci-status-icon-ring" />
            <span className="gucci-status-icon-glyph">🚫</span>
          </div>

          <GucciWordmark text={announce} className="gucci-wordmark--hero" />

          <h1 className="gucci-status-title">{title}</h1>
          <div className="gucci-status-divider" aria-hidden="true" />

          {configName && (
            <div className="gucci-status-config">
              <span className="gucci-status-config-label">
                {t('subscription.gucci.configName')}
              </span>
              <span className="gucci-status-config-value">{configName}</span>
            </div>
          )}

          <p className="gucci-status-body">{body}</p>

          <div className="gucci-status-pill">🔒 {state}</div>

          <div className="gucci-status-support">{t('subscription.gucci.support')}</div>

          <SubPromoBanner announce={announce} />

          <div className="gucci-status-footer">{t('subscription.gucci.footer')}</div>
        </div>
      </div>
    </div>
  );
}
