import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Button,
  Card,
  Col,
  ConfigProvider,
  Descriptions,
  Divider,
  Dropdown,
  Layout,
  Menu,
  message,
  Popover,
  QRCode,
  Row,
  Space,
  Tag,
  Tooltip,
} from 'antd';
import {
  AndroidOutlined,
  AppleOutlined,
  CopyOutlined,
  DownOutlined,
  DownloadOutlined,
  MoonFilled,
  MoonOutlined,
  QrcodeOutlined,
  SunOutlined,
  TranslationOutlined,
} from '@ant-design/icons';

import { ClipboardManager, IntlUtil, LanguageManager } from '@/utils';
import {
  amneziawgConfigFromLink,
  isPostQuantumLink,
  wireguardConfigFromLink,
} from '@/lib/xray/inbound-link';
import { LinkTags, parseLinkParts } from '@/lib/xray/link-label';
import ConfigBlock from '@/components/clients/ConfigBlock';
import { setMessageInstance } from '@/utils/messageBus';
import { pauseAnimationsUntilLeave, useTheme } from '@/hooks/useTheme';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import SubUsageSummary from './SubUsageSummary';
import './SubPage.css';

const QR_SIZE = 240;

const subData = window.__SUB_PAGE_DATA__ || {};

const sId = subData.sId || '';
const enabled = !!subData.enabled;
const download = subData.download || '0';
const upload = subData.upload || '0';
const total = subData.total || '∞';
const used = subData.used || '0';
const remained = subData.remained || '';
const totalByte = Number(subData.totalByte || 0);
const expireMs = Number(subData.expire || 0) * 1000;
const lastOnlineMs = Number(subData.lastOnline || 0);
const subUrl = subData.subUrl || '';
const subJsonUrl = subData.subJsonUrl || '';
const subClashUrl = subData.subClashUrl || '';
const subTitle = subData.subTitle || '';
const links: string[] = Array.isArray(subData.links) ? subData.links : [];
const linkEmails: string[] = Array.isArray(subData.emails) ? subData.emails : [];
const subEmail = [...new Set(linkEmails.filter(Boolean))].join(', ');
const datepicker = subData.datepicker || 'gregorian';
const announce = subData.announce || '';

const appendRawView = (url: string) => `${url}${url.includes('?') ? '&' : '?'}view=raw`;

const isUnlimited = totalByte <= 0 && expireMs === 0;
const isActive = (() => {
  if (!enabled) return false;
  if (totalByte > 0) {
    const usedByteCalc =
      Number(subData.usedByte || 0) ||
      Number(subData.downloadByte || 0) + Number(subData.uploadByte || 0);
    if (usedByteCalc >= totalByte) return false;
  }
  if (expireMs > 0 && Date.now() >= expireMs) return false;
  return true;
})();

export default function SubPage() {
  const { t } = useTranslation();
  const { isDark, isUltra, toggleTheme, toggleUltra, antdThemeConfig } = useTheme();
  const [messageApi, messageContextHolder] = message.useMessage();
  useEffect(() => {
    setMessageInstance(messageApi);
  }, [messageApi]);
  const { isMobile } = useMediaQuery(576);
  const [lang, setLang] = useState<string>(() => LanguageManager.getLanguage());

  const onLangChange = useCallback((next: string) => {
    setLang(next);
    LanguageManager.setLanguage(next);
  }, []);

  const cycleTheme = useCallback(() => {
    pauseAnimationsUntilLeave('sub-theme-cycle');
    if (!isDark) {
      toggleTheme();
      if (isUltra) toggleUltra();
    } else if (!isUltra) {
      toggleUltra();
    } else {
      toggleUltra();
      toggleTheme();
    }
  }, [isDark, isUltra, toggleTheme, toggleUltra]);

  const copy = useCallback(
    async (value: string) => {
      if (!value) return;
      const ok = await ClipboardManager.copyText(value);
      if (ok) messageApi.success(t('copied'));
    },
    [t, messageApi],
  );

  const copyAll = useCallback(async () => {
    if (links.length === 0) return;
    const allLinks = links.join('\n');
    const ok = await ClipboardManager.copyText(allLinks);
    if (ok) messageApi.success(t('subscription.copyAllConfigsCopied'));
  }, [t, messageApi]);

  const open = useCallback((url: string) => {
    if (!url) return;
    window.open(url, '_blank');
  }, []);

  const shadowrocketUrl = useMemo(() => {
    if (!subUrl) return '';
    const separator = subUrl.includes('?') ? '&' : '?';
    const rawUrl = subUrl + separator + 'flag=shadowrocket';
    const base64Url = btoa(rawUrl);
    const remark = encodeURIComponent(subTitle || sId || 'Subscription');
    return `shadowrocket://add/sub://${base64Url}?remark=${remark}`;
  }, []);

  const v2boxUrl = useMemo(
    () => `v2box://install-sub?url=${encodeURIComponent(subUrl)}&name=${encodeURIComponent(sId)}`,
    [],
  );
  const streisandUrl = useMemo(() => `streisand://import/${encodeURIComponent(subUrl)}`, []);
  const happUrl = useMemo(() => `happ://add/${subUrl}`, []);
  const incyUrl = useMemo(() => `incy://add/${subUrl}`, []);

  const pageClass = useMemo(() => {
    const classes = ['subscription-page'];
    if (isDark) classes.push('is-dark');
    if (isUltra) classes.push('is-ultra');
    return classes.join(' ');
  }, [isDark, isUltra]);

  const descriptionsItems = useMemo(() => {
    const items = [
      { key: 'subId', label: t('subscription.subId'), children: sId },
      ...(subEmail ? [{ key: 'email', label: t('subscription.email'), children: subEmail }] : []),
      {
        key: 'status',
        label: t('subscription.status'),
        children: !enabled ? (
          <Tag color="red">{t('subscription.inactive')}</Tag>
        ) : isUnlimited ? (
          <Tag color="purple">{t('subscription.unlimited')}</Tag>
        ) : (
          <Tag color={isActive ? 'green' : 'red'}>
            {isActive ? t('subscription.active') : t('subscription.inactive')}
          </Tag>
        ),
      },
      { key: 'down', label: t('subscription.downloaded'), children: download },
      { key: 'up', label: t('subscription.uploaded'), children: upload },
      { key: 'used', label: t('usage'), children: used },
      { key: 'total', label: t('subscription.totalQuota'), children: total },
    ];
    if (totalByte > 0) {
      items.push({ key: 'remained', label: t('remained'), children: remained });
    }
    items.push({
      key: 'lastOnline',
      label: t('lastOnline'),
      children: lastOnlineMs > 0 ? IntlUtil.formatDate(lastOnlineMs, datepicker) : '-',
    });
    items.push({
      key: 'expiry',
      label: t('subscription.expiry'),
      children:
        expireMs === 0 ? t('subscription.noExpiry') : IntlUtil.formatDate(expireMs, datepicker),
    });
    return items;
  }, [t]);

  const androidMenuItems = useMemo(
    () => [
      {
        key: 'android-v2box',
        label: 'V2Box',
        onClick: () =>
          open(
            `v2box://install-sub?url=${encodeURIComponent(subUrl)}&name=${encodeURIComponent(sId)}`,
          ),
      },
      {
        key: 'android-v2rayng',
        label: 'V2RayNG',
        onClick: () => open(`v2rayng://install-config?url=${encodeURIComponent(subUrl)}`),
      },
      { key: 'android-singbox', label: 'Sing-box', onClick: () => copy(subUrl) },
      { key: 'android-v2raytun', label: 'V2RayTun', onClick: () => copy(subUrl) },
      { key: 'android-npvtunnel', label: 'NPV Tunnel', onClick: () => copy(subUrl) },
      { key: 'android-happ', label: 'Happ', onClick: () => open(`happ://add/${subUrl}`) },
      { key: 'android-incy', label: 'Incy', onClick: () => open(`incy://add/${subUrl}`) },
    ],
    [copy, open],
  );

  const iosMenuItems = useMemo(
    () => [
      { key: 'ios-shadowrocket', label: 'Shadowrocket', onClick: () => open(shadowrocketUrl) },
      { key: 'ios-v2box', label: 'V2Box', onClick: () => open(v2boxUrl) },
      { key: 'ios-streisand', label: 'Streisand', onClick: () => open(streisandUrl) },
      { key: 'ios-v2raytun', label: 'V2RayTun', onClick: () => copy(subUrl) },
      { key: 'ios-npvtunnel', label: 'NPV Tunnel', onClick: () => copy(subUrl) },
      { key: 'ios-happ', label: 'Happ', onClick: () => open(happUrl) },
      { key: 'ios-incy', label: 'Incy', onClick: () => open(incyUrl) },
    ],
    [copy, open, shadowrocketUrl, v2boxUrl, streisandUrl, happUrl, incyUrl],
  );

  const langMenuItems = useMemo(
    () =>
      (LanguageManager.supportedLanguages as { value: string; name: string; icon: string }[]).map(
        (l) => ({
          key: l.value,
          label: (
            <Space size={8}>
              <span aria-hidden="true">{l.icon}</span>
              <span>{l.name}</span>
            </Space>
          ),
        }),
      ),
    [],
  );

  const themeIcon = !isDark ? <SunOutlined /> : !isUltra ? <MoonOutlined /> : <MoonFilled />;

  const cardTitle = (
    <Space>
      <span>{t('subscription.title')}</span>
      <Tag>{sId}</Tag>
    </Space>
  );

  const cardExtra = (
    <Space size={8} align="center">
      <Button
        shape="circle"
        size="large"
        className="toolbar-btn"
        aria-label={t('menu.theme')}
        title={t('menu.theme')}
        icon={themeIcon}
        onClick={cycleTheme}
      />
      <Popover
        rootClassName={isDark ? 'dark' : 'light'}
        placement="bottomRight"
        trigger="click"
        styles={{ content: { padding: 4 } }}
        content={
          <Menu
            mode="vertical"
            selectable
            selectedKeys={[lang]}
            items={langMenuItems}
            onClick={({ key }) => onLangChange(key)}
            style={{ border: 'none', minWidth: 160 }}
          />
        }
      >
        <Button
          shape="circle"
          size="large"
          className="toolbar-btn"
          aria-label={t('pages.settings.language')}
          icon={<TranslationOutlined />}
        />
      </Popover>
    </Space>
  );

  return (
    <ConfigProvider theme={antdThemeConfig}>
      {messageContextHolder}
      <Layout className={pageClass}>
        <Layout.Content className="content">
          <Row justify="center">
            <Col xs={24} sm={22} md={18} lg={14} xl={12}>
              <Card hoverable className="subscription-card" title={cardTitle} extra={cardExtra}>
                <div className="gucci-promo-banner">
                  <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#f3e8ff', marginBottom: '8px', letterSpacing: '1px', textShadow: '0 0 10px rgba(192, 132, 252, 0.8)' }}>
                    ⚡️ 👑 G U C C I T E A M 👑 ⚡️
                  </div>
                  <div style={{ fontSize: '13px', color: '#d8b4fe', marginBottom: '18px' }}>
                    برای دریافت پنل و اطلاعات بیشتر حتما با آی‌دی‌های زیر در تلگرام با ما در ارتباط باشید:
                  </div>

                  <Row gutter={[12, 12]}>
                    <Col xs={24} sm={12}>
                      <Button block className="promo-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => open('https://t.me/ThunderEcho3448bot')}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
                        ربات تلگرام
                      </Button>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Button block className="promo-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => open('https://t.me/MR_GUCCI_YT')}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
                        پشتیبانی تلگرام
                      </Button>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Button block className="promo-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => open('https://t.me/VPN_GUCCI_CHANEL')}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
                        کانال اول تلگرام
                      </Button>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Button block className="promo-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => open('https://t.me/VPN_GUCCI_IR')}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
                        کانال دوم تلگرام
                      </Button>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Button block className="promo-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => open('https://t.me/GUCCI_CHAT_IR')}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
                        گروه چت تلگرام
                      </Button>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Button block className="promo-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => open('https://www.instagram.com/vpn_gucci_ir?igsi=MXRsdmhid3pxZmZqMQ%3D%3D&utm_source=qr')}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                        اینستاگرام
                      </Button>
                    </Col>
                    <Col xs={24} span={24}>
                      <Button block className="promo-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => open('https://youtube.com/@vpn_gucci?si=HOdcsuj20CH3aAv5')}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.016 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                        یوتیوب
                      </Button>
                    </Col>
                  </Row>
                </div>
                <Descriptions
                  bordered
                  column={1}
                  size="small"
                  className="info-table"
                  items={descriptionsItems}
                />

                <SubUsageSummary
                  usedByte={
                    Number(subData.usedByte || 0) ||
                    Number(subData.downloadByte || 0) + Number(subData.uploadByte || 0)
                  }
                  totalByte={totalByte}
                  usedLabel={used}
                  totalLabel={total}
                  remainedLabel={remained}
                  expireMs={expireMs}
                  isActive={isActive}
                />

                {(subUrl || subJsonUrl || subClashUrl) && (
                  <>
                    <Divider>{t('subscription.title')}</Divider>
                    <div className="links-section">
                      {subUrl && (
                        <div className="sub-link-row">
                          <Tag color="green" className="sub-link-tag">
                            SUB
                          </Tag>
                          <a
                            href={subUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="sub-link-title sub-link-anchor"
                            title={subUrl}
                          >
                            {sId}
                          </a>
                          <div className="sub-link-actions">
                            <Button
                              size="small"
                              icon={<CopyOutlined />}
                              onClick={() => copy(subUrl)}
                              aria-label={t('copy')}
                              title={t('copy')}
                            />
                            <Popover
                              trigger="click"
                              placement="left"
                              destroyOnHidden
                              content={
                                <div className="sub-link-qr-popover">
                                  <Tag color="green" className="qr-tag">
                                    {t('pages.settings.subSettings')}
                                  </Tag>
                                  <QRCode
                                    value={subUrl}
                                    size={QR_SIZE}
                                    type="svg"
                                    bordered={false}
                                    color="#000000"
                                    bgColor="#ffffff"
                                  />
                                </div>
                              }
                            >
                              <Button
                                size="small"
                                icon={<QrcodeOutlined />}
                                aria-label="QR"
                                title="QR"
                              />
                            </Popover>
                          </div>
                        </div>
                      )}
                      {subJsonUrl && (
                        <div className="sub-link-row">
                          <Tag color="purple" className="sub-link-tag">
                            JSON
                          </Tag>
                          <a
                            href={subJsonUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="sub-link-title sub-link-anchor"
                            title={subJsonUrl}
                          >
                            {sId}
                          </a>
                          <div className="sub-link-actions">
                            <Button
                              size="small"
                              href={appendRawView(subJsonUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              icon={<DownloadOutlined />}
                              aria-label={t('download')}
                              title={t('download')}
                            />
                            <Button
                              size="small"
                              icon={<CopyOutlined />}
                              onClick={() => copy(subJsonUrl)}
                              aria-label={t('copy')}
                              title={t('copy')}
                            />
                            <Popover
                              trigger="click"
                              placement="left"
                              destroyOnHidden
                              content={
                                <div className="sub-link-qr-popover">
                                  <Tag color="purple" className="qr-tag">
                                    {t('pages.settings.subSettings')} JSON
                                  </Tag>
                                  <QRCode
                                    value={subJsonUrl}
                                    size={QR_SIZE}
                                    type="svg"
                                    bordered={false}
                                    color="#000000"
                                    bgColor="#ffffff"
                                  />
                                </div>
                              }
                            >
                              <Button
                                size="small"
                                icon={<QrcodeOutlined />}
                                aria-label="QR"
                                title="QR"
                              />
                            </Popover>
                          </div>
                        </div>
                      )}
                      {subClashUrl && (
                        <div className="sub-link-row">
                          <Tooltip title="Clash / Mihomo">
                            <Tag color="gold" className="sub-link-tag">
                              CLASH
                            </Tag>
                          </Tooltip>
                          <a
                            href={subClashUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="sub-link-title sub-link-anchor"
                            title={subClashUrl}
                          >
                            {sId}
                          </a>
                          <div className="sub-link-actions">
                            <Button
                              size="small"
                              href={appendRawView(subClashUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              icon={<DownloadOutlined />}
                              aria-label={t('download')}
                              title={t('download')}
                            />
                            <Button
                              size="small"
                              icon={<CopyOutlined />}
                              onClick={() => copy(subClashUrl)}
                              aria-label={t('copy')}
                              title={t('copy')}
                            />
                            <Popover
                              trigger="click"
                              placement="left"
                              destroyOnHidden
                              content={
                                <div className="sub-link-qr-popover">
                                  <Tag color="gold" className="qr-tag">
                                    Clash / Mihomo
                                  </Tag>
                                  <QRCode
                                    value={subClashUrl}
                                    size={QR_SIZE}
                                    type="svg"
                                    bordered={false}
                                    color="#000000"
                                    bgColor="#ffffff"
                                  />
                                </div>
                              }
                            >
                              <Button
                                size="small"
                                icon={<QrcodeOutlined />}
                                aria-label="QR"
                                title="QR"
                              />
                            </Popover>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {links.length > 0 && (
                  <>
                    <Divider>{t('pages.inbounds.copyLink')}</Divider>
                    <div className="links-section">
                      <div className="sub-link-row">
                        <span className="sub-link-title">{t('subscription.copyAllConfigs')}</span>
                        <div className="sub-link-actions">
                          <Button
                            size="small"
                            icon={<CopyOutlined />}
                            onClick={copyAll}
                            aria-label={t('subscription.copyAllConfigs')}
                            title={t('subscription.copyAllConfigs')}
                          />
                        </div>
                      </div>
                      {links.map((link, idx) => {
                        const parts = parseLinkParts(link);
                        const fallback = `Link ${idx + 1}`;
                        const rowTitle = parts?.remark || fallback;
                        const qrLabel = parts?.remark || rowTitle;
                        const canQr = !isPostQuantumLink(link);
                        const isWireguardLink =
                          link.startsWith('wireguard://') || link.startsWith('wg://');
                        const isAmneziawgLink = link.startsWith('vpn://');
                        return (
                          <Fragment key={link}>
                            <div className="sub-link-row">
                              {parts ? (
                                <LinkTags parts={parts} />
                              ) : (
                                <Tag className="sub-link-tag">LINK</Tag>
                              )}
                              <span className="sub-link-title" title={rowTitle}>
                                {rowTitle}
                              </span>
                              <div className="sub-link-actions">
                                <Button
                                  size="small"
                                  icon={<CopyOutlined />}
                                  onClick={() => copy(link)}
                                  aria-label={t('copy')}
                                  title={t('copy')}
                                />
                                {canQr && (
                                  <Popover
                                    trigger="click"
                                    placement="left"
                                    destroyOnHidden
                                    content={
                                      <div className="sub-link-qr-popover">
                                        <Tag className="qr-tag">{qrLabel}</Tag>
                                        <QRCode
                                          value={link}
                                          size={220}
                                          type="svg"
                                          bordered={false}
                                          color="#000000"
                                          bgColor="#ffffff"
                                        />
                                      </div>
                                    }
                                  >
                                    <Button
                                      size="small"
                                      icon={<QrcodeOutlined />}
                                      aria-label="QR"
                                      title="QR"
                                    />
                                  </Popover>
                                )}
                              </div>
                            </div>
                            {isWireguardLink && (
                              <ConfigBlock
                                label={t('pages.clients.wireguardConfig')}
                                text={wireguardConfigFromLink(link, rowTitle)}
                                fileName={`${rowTitle || 'peer'}.conf`}
                                qrRemark={rowTitle}
                                tagColor="cyan"
                              />
                            )}
                            {isAmneziawgLink && (
                              <ConfigBlock
                                label={t('pages.clients.amneziaWgConfig')}
                                text={amneziawgConfigFromLink(link)}
                                fileName={`${rowTitle || 'peer'}.conf`}
                                qrRemark={rowTitle}
                                tagColor="purple"
                              />
                            )}
                          </Fragment>
                        );
                      })}
                    </div>
                  </>
                )}

                <Row gutter={[8, 8]} justify="center" className="apps-row">
                  <Col xs={24} sm={12} className="app-col">
                    <Dropdown trigger={['click']} menu={{ items: androidMenuItems }}>
                      <Button block={isMobile} size="large" type="primary">
                        <AndroidOutlined /> Android <DownOutlined />
                      </Button>
                    </Dropdown>
                  </Col>
                  <Col xs={24} sm={12} className="app-col">
                    <Dropdown trigger={['click']} menu={{ items: iosMenuItems }}>
                      <Button block={isMobile} size="large" type="primary">
                        <AppleOutlined /> iOS <DownOutlined />
                      </Button>
                    </Dropdown>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </Layout.Content>
      </Layout>
    </ConfigProvider>
  );
}
