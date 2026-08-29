import React, { useState } from 'react';
import { Card, Tabs, Button, Row, Col, Typography, Tag, Space, message } from 'antd';
import {
  AndroidOutlined,
  AppleOutlined,
  WindowsOutlined,
  DownloadOutlined,
  LinkOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

interface AppItem {
  id: string;
  name: string;
  descFa: string;
  descEn: string;
  iconBg: string;
  iconText: string;
  badge?: string;
  badgeColor?: string;
  downloadUrl: string;
  importScheme?: (subUrl: string, subId: string) => string;
}

interface AppsDownloadSectionProps {
  subUrl: string;
  subId: string;
}

export const AppsDownloadSection: React.FC<AppsDownloadSectionProps> = ({ subUrl, subId }) => {
  const [activeTab, setActiveTab] = useState<string>('android');

  const base64Sub = typeof window !== 'undefined' ? btoa(subUrl) : '';

  const androidApps: AppItem[] = [
    {
      id: 'v2box-android',
      name: 'V2Box',
      descFa: 'کلاینت قدرتمند، مدرن و پرسرعت برای اندروید',
      descEn: 'Powerful & modern V2Ray client for Android',
      iconBg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      iconText: 'V2',
      badge: 'پیشنهادی',
      badgeColor: '#10b981',
      downloadUrl: 'https://play.google.com/store/apps/details?id=dev.hexasoftware.v2box',
      importScheme: (url, id) => `v2box://install-sub?url=${encodeURIComponent(url)}&name=${encodeURIComponent(id || 'GUCCI')}`,
    },
    {
      id: 'v2rayng',
      name: 'V2rayNG',
      descFa: 'محبوب‌ترین و پایدارترین کلاینت V2Ray برای تمامی گوشی‌های اندروید',
      descEn: 'Most popular & stable V2Ray client for Android',
      iconBg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      iconText: 'NG',
      badge: 'محبوب',
      badgeColor: '#3b82f6',
      downloadUrl: 'https://github.com/2dust/v2rayNG/releases/latest',
      importScheme: (url) => `v2rayng://install-config?url=${encodeURIComponent(url)}`,
    },
    {
      id: 'happ-android',
      name: 'Happ Proxy',
      descFa: 'کلاینت پیشرفته نسل جدید با اتصال پایدار و ضدفیلتر',
      descEn: 'Advanced next-gen proxy client with anti-censorship',
      iconBg: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      iconText: 'HP',
      badge: 'نسل جدید',
      badgeColor: '#8b5cf6',
      downloadUrl: 'https://play.google.com/store/apps/details?id=com.happproxy',
      importScheme: (url) => `happ://add/${url}`,
    },
    {
      id: 'singbox-android',
      name: 'Sing-box',
      descFa: 'کلاینت فوق‌العاده سبک، سریع با کمترین مصرف باتری و اینترنت',
      descEn: 'Ultra-fast, low battery & memory universal proxy platform',
      iconBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      iconText: 'SB',
      downloadUrl: 'https://github.com/SagerNet/sing-box/releases/latest',
      importScheme: (url) => `sing-box://import-remote-profile?url=${encodeURIComponent(url)}`,
    },
    {
      id: 'npvtunnel',
      name: 'NPV Tunnel',
      descFa: 'کلاینت سبک و کاربرپسند مخصوص عبور از فیلترینگ شدید',
      descEn: 'Lightweight proxy client for strict networks',
      iconBg: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
      iconText: 'NP',
      downloadUrl: 'https://play.google.com/store/apps/details?id=com.napsternetlabs.napsternetv',
    },
    {
      id: 'v2raytun-android',
      name: 'V2RayTun',
      descFa: 'ابزار حرفه‌ای اتصال با تنظیمات هوشمند DNS و فرگمنت',
      descEn: 'Professional tunneling client with smart routing',
      iconBg: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
      iconText: 'VT',
      downloadUrl: 'https://play.google.com/store/apps/details?id=com.v2raytun.android',
    },
  ];

  const iosApps: AppItem[] = [
    {
      id: 'v2box-ios',
      name: 'V2Box',
      descFa: 'بهترین کلاینت رایگان و ضدفیلتر برای آیفون و آیپد (iOS)',
      descEn: 'Best free & fast proxy client for iPhone & iPad',
      iconBg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      iconText: 'V2',
      badge: 'پیشنهادی iOS',
      badgeColor: '#10b981',
      downloadUrl: 'https://apps.apple.com/us/app/v2box-v2ray-client/id6446814690',
      importScheme: (url, id) => `v2box://install-sub?url=${encodeURIComponent(url)}&name=${encodeURIComponent(id || 'GUCCI')}`,
    },
    {
      id: 'streisand-ios',
      name: 'Streisand',
      descFa: 'کلاینت اختصاصی و هوشمند iOS با اتصال پایدار به انواع پروتکل‌ها',
      descEn: 'Smart iOS proxy client supporting all protocols',
      iconBg: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
      iconText: 'ST',
      badge: 'محبوب',
      badgeColor: '#ec4899',
      downloadUrl: 'https://apps.apple.com/us/app/streisand/id6450534064',
      importScheme: (url) => `streisand://import/${url}`,
    },
    {
      id: 'shadowrocket-ios',
      name: 'Shadowrocket',
      descFa: 'قدرتمندترین و پرامکانات‌ترین کلاینت پروکسی در اپ استور',
      descEn: 'Most comprehensive and powerful iOS proxy tool',
      iconBg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      iconText: 'SR',
      badge: 'حرفه‌ای',
      badgeColor: '#3b82f6',
      downloadUrl: 'https://apps.apple.com/us/app/shadowrocket/id932747118',
      importScheme: (url) => `shadowrocket://add/sub://${base64Sub}`,
    },
    {
      id: 'happ-ios',
      name: 'Happ',
      descFa: 'کلاینت ساده، سریع و ضدفیلتر مخصوص آیفون و آیپد',
      descEn: 'Fast and reliable modern iOS proxy client',
      iconBg: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      iconText: 'HP',
      downloadUrl: 'https://apps.apple.com/us/app/happ-proxy-utility/id6504287215',
      importScheme: (url) => `happ://add/${url}`,
    },
    {
      id: 'singbox-ios',
      name: 'Sing-box',
      descFa: 'کلاینت رسمی Sing-box با مصرف حداقل رم و باتری',
      descEn: 'Official universal proxy platform for iOS',
      iconBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      iconText: 'SB',
      downloadUrl: 'https://apps.apple.com/us/app/sing-box/id6451272673',
      importScheme: (url) => `sing-box://import-remote-profile?url=${encodeURIComponent(url)}`,
    },
    {
      id: 'incy-ios',
      name: 'Incy',
      descFa: 'کلاینت هوشمند با قابلیت هدایت خودکار ترافیک داخلی',
      descEn: 'Smart proxy with autorouting support',
      iconBg: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      iconText: 'IN',
      downloadUrl: 'https://apps.apple.com/us/app/incy/id6475850901',
      importScheme: (url) => `incy://add/${url}`,
    },
  ];

  const windowsApps: AppItem[] = [
    {
      id: 'v2rayn-win',
      name: 'v2rayN',
      descFa: 'بهترین و کامل‌ترین کلاینت V2Ray برای سیستم‌عامل ویندوز',
      descEn: 'Best complete GUI client for Windows',
      iconBg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      iconText: 'VN',
      badge: 'پیشنهادی ویندوز',
      badgeColor: '#3b82f6',
      downloadUrl: 'https://github.com/2dust/v2rayN/releases/latest',
    },
    {
      id: 'flclash-win',
      name: 'FlClash',
      descFa: 'رابط گرافیکی بسیار شیک، مدرن و چندسکویی مبتنی بر هسته کلش',
      descEn: 'Modern & sleek cross-platform Clash GUI',
      iconBg: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
      iconText: 'FC',
      badge: 'مدرن',
      badgeColor: '#a855f7',
      downloadUrl: 'https://github.com/chen08209/FlClash/releases/latest',
    },
    {
      id: 'nekobox-win',
      name: 'NekoBox for Windows',
      descFa: 'کلاینت پیشرفته مبتنی بر هسته Sing-box با سازگاری بالا',
      descEn: 'Universal Sing-box based GUI client for Windows',
      iconBg: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
      iconText: 'NB',
      downloadUrl: 'https://github.com/MatsuriDayo/nekoray/releases/latest',
    },
    {
      id: 'singbox-win',
      name: 'Sing-box Core',
      descFa: 'هسته پرسرعت برای اتصالات خط فرمان و سرویس ویندوز',
      descEn: 'High-performance core for Windows',
      iconBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      iconText: 'SB',
      downloadUrl: 'https://github.com/SagerNet/sing-box/releases/latest',
    },
  ];

  const macApps: AppItem[] = [
    {
      id: 'v2box-mac',
      name: 'V2Box for macOS',
      descFa: 'کلاینت رسمی و قدرتمند V2Box مستقیماً از اپ استور مک',
      descEn: 'Official V2Box client for macOS App Store',
      iconBg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      iconText: 'V2',
      badge: 'پیشنهادی مک',
      badgeColor: '#10b981',
      downloadUrl: 'https://apps.apple.com/us/app/v2box-v2ray-client/id6446814690',
      importScheme: (url, id) => `v2box://install-sub?url=${encodeURIComponent(url)}&name=${encodeURIComponent(id || 'GUCCI')}`,
    },
    {
      id: 'flclash-mac',
      name: 'FlClash for macOS',
      descFa: 'رابط کاربری زیبا و هماهنگ با طراحی مدرن سیستم‌عامل مک',
      descEn: 'Beautiful & native-feeling Clash client for Mac',
      iconBg: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
      iconText: 'FC',
      downloadUrl: 'https://github.com/chen08209/FlClash/releases/latest',
    },
    {
      id: 'singbox-mac',
      name: 'Sing-box for macOS',
      descFa: 'کلاینت پرسرعت و بهینه مخصوص سیستم‌های مکینتاش',
      descEn: 'Universal proxy client for macOS',
      iconBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      iconText: 'SB',
      downloadUrl: 'https://apps.apple.com/us/app/sing-box/id6451272673',
      importScheme: (url) => `sing-box://import-remote-profile?url=${encodeURIComponent(url)}`,
    },
  ];

  const handleOpenApp = (app: AppItem) => {
    if (app.importScheme && subUrl) {
      const scheme = app.importScheme(subUrl, subId);
      window.location.href = scheme;
      message.success(`در حال انتقال به ${app.name}...`);
    } else {
      window.open(app.downloadUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const renderAppList = (apps: AppItem[]) => (
    <Row gutter={[14, 14]}>
      {apps.map((app) => (
        <Col key={app.id} xs={24} sm={12}>
          <div className="client-app-card">
            <div className="client-app-card-header">
              <div className="client-app-icon" style={{ background: app.iconBg }}>
                <span>{app.iconText}</span>
              </div>
              <div className="client-app-info">
                <div className="client-app-name-row">
                  <Text strong className="client-app-name">
                    {app.name}
                  </Text>
                  {app.badge && (
                    <Tag className="client-app-badge" style={{ borderColor: app.badgeColor, color: app.badgeColor }}>
                      {app.badge}
                    </Tag>
                  )}
                </div>
                <Text type="secondary" className="client-app-desc">
                  {app.descFa}
                </Text>
              </div>
            </div>

            <div className="client-app-actions">
              <Button
                type="primary"
                className="client-app-btn client-app-btn--download"
                icon={<DownloadOutlined />}
                href={app.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                دانلود برنامه
              </Button>

              {app.importScheme && (
                <Button
                  className="client-app-btn client-app-btn--connect"
                  icon={<ThunderboltOutlined />}
                  onClick={() => handleOpenApp(app)}
                >
                  اتصال خودکار
                </Button>
              )}
            </div>
          </div>
        </Col>
      ))}
    </Row>
  );

  return (
    <div className="apps-download-section">
      <div className="apps-section-title">
        <ThunderboltOutlined className="apps-section-icon" />
        <span>دانلود نرم‌افزار و اتصال آسان</span>
      </div>
      <Text type="secondary" className="apps-section-subtitle">
        برای استفاده از اشتراک، برنامه متناسب با دستگاه خود را دانلود کرده و با یک کلیک متصل شوید:
      </Text>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        centered
        className="apps-device-tabs"
        items={[
          {
            key: 'android',
            label: (
              <Space>
                <AndroidOutlined />
                <span>اندروید (Android)</span>
              </Space>
            ),
            children: renderAppList(androidApps),
          },
          {
            key: 'ios',
            label: (
              <Space>
                <AppleOutlined />
                <span>آیفون (iOS)</span>
              </Space>
            ),
            children: renderAppList(iosApps),
          },
          {
            key: 'windows',
            label: (
              <Space>
                <WindowsOutlined />
                <span>ویندوز (Windows)</span>
              </Space>
            ),
            children: renderAppList(windowsApps),
          },
          {
            key: 'mac',
            label: (
              <Space>
                <AppleOutlined />
                <span>مک (macOS)</span>
              </Space>
            ),
            children: renderAppList(macApps),
          },
        ]}
      />
    </div>
  );
};

export default AppsDownloadSection;
