import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Progress, Tag } from 'antd';
import { ClockCircleOutlined, ThunderboltOutlined } from '@ant-design/icons';

import './SubUsageSummary.css';

interface SubUsageSummaryProps {
  usedByte: number;
  totalByte: number;
  usedLabel: string;
  totalLabel: string;
  remainedLabel: string;
  expireMs: number;
  isActive: boolean;
}

// Neon "electric purple" usage bar — the green/amber ramp is gone, high usage
// only shifts the plasma towards pink/red inside the same purple family.
function pickStrokeColor(pct: number): { from: string; mid: string; to: string } {
  if (pct >= 90) return { from: '#f0abfc', mid: '#e879f9', to: '#f43f5e' };
  if (pct >= 75) return { from: '#e9d5ff', mid: '#c084fc', to: '#ec4899' };
  return { from: '#e9d5ff', mid: '#a855f7', to: '#7c3aed' };
}

function formatExpiryChip(expireMs: number): { label: string; color: string } | null {
  if (expireMs <= 0) return null;
  const diff = expireMs - Date.now();
  if (diff <= 0) return { label: 'Expired', color: 'red' };
  const days = Math.floor(diff / 86400000);
  if (days >= 1) return { label: `${days}d`, color: days <= 3 ? 'orange' : 'blue' };
  const hours = Math.max(1, Math.floor(diff / 3600000));
  return { label: `${hours}h`, color: 'orange' };
}

export default function SubUsageSummary({
  usedByte,
  totalByte,
  usedLabel,
  totalLabel,
  remainedLabel,
  expireMs,
  isActive,
}: SubUsageSummaryProps) {
  const { t } = useTranslation();
  const pct = useMemo(() => {
    if (totalByte <= 0) return 0;
    const v = (usedByte / totalByte) * 100;
    if (!Number.isFinite(v)) return 0;
    return Math.max(0, Math.min(100, v));
  }, [usedByte, totalByte]);

  const expiry = formatExpiryChip(expireMs);
  const isUnlimited = totalByte <= 0;
  const stroke = pickStrokeColor(pct);

  return (
    <div className={`usage-summary ${!isActive ? 'is-inactive' : ''}`}>
      <div className="usage-summary-head">
        <div className="usage-summary-labels">
          <span className="usage-summary-used">{usedLabel}</span>
          <span className="usage-summary-sep">/</span>
          <span className="usage-summary-total">{isUnlimited ? '∞' : totalLabel}</span>
        </div>
        <div className="usage-summary-chips">
          {isUnlimited && (
            <Tag color="purple" icon={<ThunderboltOutlined />}>
              {t('subscription.unlimited')}
            </Tag>
          )}
          {expiry && (
            <Tag color={expiry.color} icon={<ClockCircleOutlined />}>
              {expiry.label}
            </Tag>
          )}
        </div>
      </div>
      {!isUnlimited && (
        <div className="usage-summary-bar-wrap">
          <Progress
            percent={pct}
            showInfo={false}
            strokeColor={{ '0%': stroke.from, '50%': stroke.mid, '100%': stroke.to }}
            railColor="rgba(88, 28, 135, 0.45)"
            strokeWidth={12}
            className="usage-summary-bar usage-summary-bar--neon"
          />
          <span className="usage-summary-spark" style={{ left: `${pct}%` }} aria-hidden="true" />
        </div>
      )}
      <div className="usage-summary-foot">
        {!isUnlimited && (
          <>
            <span className="usage-summary-remained">{remainedLabel}</span>
            <span className="usage-summary-pct">{pct.toFixed(1)}%</span>
          </>
        )}
      </div>
    </div>
  );
}
