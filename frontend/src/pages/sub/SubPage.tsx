import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
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
} from 'antd';
import {
  AndroidOutlined,
  AppleOutlined,
  CopyOutlined,
  DownOutlined,
  DownloadOutlined,
  QrcodeOutlined,
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
import { useTheme } from '@/hooks/useTheme';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { theme as antdTheme } from 'antd';
import SubUsageSummary from './SubUsageSummary';
import UserAvatar from './UserAvatar';
import SubPromoBanner from './SubPromoBanner';
import SubStatusPage, { type SubStatusKind } from './SubStatusPage';
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
const rawSubUrl = subData.subUrl || '';

// Fall back to the origin this page is served from, so the link always points
// at the panel's own domain instead of an external host.
const normalizeSubUrl = (url: string, path: string) => {
  if (url) {
    return url;
  }
  const origin = typeof window === 'undefined' ? '' : window.location.origin;
  return `${origin}${path}${sId}`;
};

const subUrl = normalizeSubUrl(rawSubUrl, '/sub/');
const subTitle = subData.subTitle || '';
const links: string[] = Array.isArray(subData.links) ? subData.links : [];
const linkEmails: string[] = Array.isArray(subData.emails) ? subData.emails : [];
const subEmail = [...new Set(linkEmails.filter(Boolean))].join(', ');
const datepicker = subData.datepicker || 'gregorian';
const announce = subData.announce || '🅣 🅔 🅐 🅜  🅖 🅤 🅒 🅒 🅘';

const appendRawView = (url: string) => `${url}${url.includes('?') ? '&' : '?'}view=raw`;

const isUnlimited = totalByte <= 0 && expireMs === 0;
const usedByteTotal =
  Number(subData.usedByte || 0) ||
  Number(subData.downloadByte || 0) + Number(subData.uploadByte || 0);
const isQuotaDepleted = totalByte > 0 && usedByteTotal >= totalByte;
const isExpired = expireMs > 0 && Date.now() >= expireMs;

// 'removed' is injected by the panel when the subId no longer matches any
// client (deleted user / invalid link) — the page then shows the status
// notice plus the same promo block instead of a blank 404.
const notice = subData.notice || '';
const isRemoved = notice === 'removed';

const isActive = (() => {
  if (isRemoved) return false;
  if (!enabled) return false;
  if (isQuotaDepleted) return false;
  if (isExpired) return false;
  return true;
})();

const statusKind: SubStatusKind | null = (() => {
  if (isRemoved) return 'removed';
  if (!enabled) return 'disabled';
  if (isExpired) return 'expired';
  if (isQuotaDepleted) return 'depleted';
  return null;
})();

const statusNoticeText = (() => {
  if (isRemoved) {
    return 'این اشتراک حذف شده یا لینک آن معتبر نیست. برای دریافت اشتراک جدید از راه‌های ارتباطی بالا با ما در تماس باشید.';
  }
  if (!enabled) {
    return 'اشتراک شما غیرفعال شده است. برای فعال‌سازی از راه‌های ارتباطی بالا با ما در تماس باشید.';
  }
  if (isQuotaDepleted) {
    return 'حجم اشتراک شما به پایان رسیده است. برای تمدید از راه‌های ارتباطی بالا با ما در تماس باشید.';
  }
  if (isExpired) {
    return 'اشتراک شما منقضی شده است. برای تمدید از راه‌های ارتباطی بالا با ما در تماس باشید.';
  }
  return '';
})();


export default function SubPage() {
  const { t } = useTranslation();
  const { isDark, isUltra } = useTheme();
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

  const userDisplayName = subEmail || sId || 'کاربر گرامی';

  const cardTitle = (
    <div className="subpage-header-user">
      <UserAvatar seed={userDisplayName} size={52} isActive={isActive} />
      <div className="subpage-header-text">
        <span className="subpage-header-title">
          <span>داشبورد کاربری</span>
        </span>
        <span className="subpage-header-subtitle">{userDisplayName}</span>
      </div>
    </div>
  );

  const cardExtra = (
    <div className="subpage-header-extra">
      <Popover
        rootClassName="dark"
        placement="bottomLeft"
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
          className="toolbar-btn lang-switcher-btn"
          aria-label={t('pages.settings.language')}
          icon={<TranslationOutlined />}
        />
      </Popover>
    </div>
  );

  const subAntdTheme = useMemo(() => {
    return {
      hashed: false,
      algorithm: antdTheme.darkAlgorithm,
      token: {
        colorBgBase: isUltra ? '#070312' : '#0e061e',
        colorBgLayout: isUltra ? '#070312' : '#0e061e',
        colorBgContainer: isUltra ? '#0f0724' : '#170b33',
        colorBgElevated: isUltra ? '#160a36' : '#23104c',
        colorPrimary: '#a855f7',
        colorText: '#faf5ff',
        colorTextSecondary: '#d8b4fe',
        colorTextTertiary: '#c084fc',
        colorBorder: 'rgba(168, 85, 247, 0.4)',
        colorBorderSecondary: 'rgba(168, 85, 247, 0.25)',
      },
      components: {
        Card: {
          colorBgContainer: isUltra ? '#0f0724' : '#150a2e',
          colorBorderSecondary: 'rgba(168, 85, 247, 0.5)',
        },
        Descriptions: {
          colorText: '#faf5ff',
          colorTextLabel: '#e9d5ff',
          colorSplit: 'rgba(168, 85, 247, 0.4)',
        },
        Tabs: {
          colorPrimary: '#c084fc',
          colorText: '#d8b4fe',
        },
        Button: {
          colorPrimary: '#9333ea',
          colorPrimaryHover: '#a855f7',
          colorPrimaryActive: '#7e22ce',
        },
      },
    };
  }, [isUltra]);

  if (statusKind) {
    return (
      <ConfigProvider theme={subAntdTheme}>
        {messageContextHolder}
        <Layout className={pageClass}>
          <Layout.Content className="content">
            <SubStatusPage
              kind={statusKind}
              announce={announce}
              header={cardTitle}
              extra={cardExtra}
            />
          </Layout.Content>
        </Layout>
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider theme={subAntdTheme}>
      {messageContextHolder}
      <Layout className={pageClass}>
        <Layout.Content className="content">
          <Row justify="center">
            <Col xs={24} sm={22} md={18} lg={14} xl={12}>
              <Card hoverable className="subscription-card" title={cardTitle} extra={cardExtra}>
                <SubPromoBanner announce={announce} />
                {!isActive && statusNoticeText && (
                  <div className="sub-status-notice">{statusNoticeText}</div>
                )}
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

                {!isRemoved && subUrl && (
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
                              href={appendRawView(subUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              icon={<DownloadOutlined />}
                              aria-label={t('download')}
                              title={t('download')}
                            />
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
                                    {t('subscription.title')}
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
