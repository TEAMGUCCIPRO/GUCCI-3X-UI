import React, { useState } from 'react';
import { Tabs, Button, Row, Col, Typography, Tag, Space, message } from 'antd';
import {
  AndroidOutlined,
  AppleOutlined,
  WindowsOutlined,
  DownloadOutlined,
  ThunderboltOutlined,
  DesktopOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

interface AppItem {
  id: string;
  name: string;
  descFa: string;
  badge?: string;
  badgeColor?: string;
  svgIcon: React.ReactNode;
  downloadUrl: string;
  importScheme?: (subUrl: string, subId: string) => string;
}

interface AppsDownloadSectionProps {
  subUrl: string;
  subId: string;
}

// Crisp Vector SVG Logos for each proxy client
const V2BoxSvg = () => (
  <svg width="44" height="44" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="12" fill="url(#v2boxBg)" />
    <path d="M14 16L24 10L34 16V32L24 38L14 32V16Z" fill="#10B981" opacity="0.3" stroke="#34D399" strokeWidth="2" />
    <path d="M24 10V24M24 24L34 16M24 24L14 16M24 24V38" stroke="#6EE7B7" strokeWidth="2" strokeLinecap="round" />
    <circle cx="24" cy="24" r="4" fill="#FFFFFF" filter="drop-shadow(0 0 6px #10B981)" />
    <defs>
      <linearGradient id="v2boxBg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#064E3B" />
        <stop offset="1" stopColor="#022C22" />
      </linearGradient>
    </defs>
  </svg>
);

const V2rayNgSvg = () => (
  <svg width="44" height="44" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="12" fill="url(#v2ngBg)" />
    <path d="M12 14L24 36L36 14H30L24 26L18 14H12Z" fill="url(#v2ngV)" filter="drop-shadow(0 0 6px #38BDF8)" />
    <circle cx="34" cy="32" r="3" fill="#38BDF8" />
    <defs>
      <linearGradient id="v2ngBg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0C4A6E" />
        <stop offset="1" stopColor="#082F49" />
      </linearGradient>
      <linearGradient id="v2ngV" x1="12" y1="14" x2="36" y2="36" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38BDF8" />
        <stop offset="1" stopColor="#0284C7" />
      </linearGradient>
    </defs>
  </svg>
);

const SingboxSvg = () => (
  <svg width="44" height="44" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="12" fill="url(#sbBg)" />
    <path d="M24 12L36 19V31L24 38L12 31V19L24 12Z" fill="#F59E0B" fillOpacity="0.25" stroke="#FBBF24" strokeWidth="2.5" />
    <path d="M24 12V24M24 24L36 31M24 24L12 31" stroke="#FDE68A" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="24" cy="24" r="3.5" fill="#FDE047" />
    <defs>
      <linearGradient id="sbBg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#78350F" />
        <stop offset="1" stopColor="#451A03" />
      </linearGradient>
    </defs>
  </svg>
);

const HappSvg = () => (
  <svg width="44" height="44" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="12" fill="url(#happBg)" />
    <circle cx="24" cy="24" r="13" stroke="#C084FC" strokeWidth="2" />
    <circle cx="19" cy="21" r="2" fill="#FAF5FF" />
    <circle cx="29" cy="21" r="2" fill="#FAF5FF" />
    <path d="M18 27C20 30 28 30 30 27" stroke="#FAF5FF" strokeWidth="2" strokeLinecap="round" />
    <defs>
      <linearGradient id="happBg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#581C87" />
        <stop offset="1" stopColor="#2E1065" />
      </linearGradient>
    </defs>
  </svg>
);

const NpvSvg = () => (
  <svg width="44" height="44" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="12" fill="url(#npvBg)" />
    <path d="M24 11L35 15V24C35 31 29 36 24 38C19 36 13 31 13 24V15L24 11Z" fill="#BE185D" fillOpacity="0.4" stroke="#F472B6" strokeWidth="2" />
    <path d="M22 18L18 24H24L22 30L29 23H23L25 18H22Z" fill="#FDF2F8" />
    <defs>
      <linearGradient id="npvBg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#831843" />
        <stop offset="1" stopColor="#500724" />
      </linearGradient>
    </defs>
  </svg>
);

const V2rayTunSvg = () => (
  <svg width="44" height="44" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="12" fill="url(#tunBg)" />
    <path d="M15 15H33V19H26V33H22V19H15V15Z" fill="#818CF8" />
    <path d="M31 22L36 27L31 32" stroke="#A5B4FC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="tunBg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#312E81" />
        <stop offset="1" stopColor="#1E1B4B" />
      </linearGradient>
    </defs>
  </svg>
);

const NekoBoxSvg = () => (
  <svg width="44" height="44" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="12" fill="url(#nekoBg)" />
    <path d="M14 16L18 24H30L34 16V30C34 32.2 32.2 34 30 34H18C15.8 34 14 32.2 14 30V16Z" fill="#E11D48" stroke="#FB7185" strokeWidth="2" />
    <circle cx="20" cy="27" r="1.5" fill="#FFF" />
    <circle cx="28" cy="27" r="1.5" fill="#FFF" />
    <path d="M22 29Q24 31 26 29" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />
    <defs>
      <linearGradient id="nekoBg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#881337" />
        <stop offset="1" stopColor="#4C0519" />
      </linearGradient>
    </defs>
  </svg>
);

const IncySvg = () => (
  <svg width="44" height="44" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="12" fill="url(#incyBg)" />
    <circle cx="24" cy="24" r="12" stroke="#22D3EE" strokeWidth="2.5" />
    <path d="M24 16V24L30 28" stroke="#67E8F9" strokeWidth="2.5" strokeLinecap="round" />
    <defs>
      <linearGradient id="incyBg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#164E63" />
        <stop offset="1" stopColor="#083344" />
      </linearGradient>
    </defs>
  </svg>
);

const StreisandSvg = () => (
  <svg width="44" height="44" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="12" fill="url(#streiBg)" />
    <circle cx="19" cy="24" r="6" stroke="#F43F5E" strokeWidth="2.5" />
    <circle cx="29" cy="24" r="6" stroke="#F43F5E" strokeWidth="2.5" />
    <line x1="25" y1="24" x2="23" y2="24" stroke="#FB7185" strokeWidth="2.5" />
    <path d="M13 24L10 21M35 24L38 21" stroke="#FDA4AF" strokeWidth="2" strokeLinecap="round" />
    <defs>
      <linearGradient id="streiBg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4C0519" />
        <stop offset="1" stopColor="#1C020A" />
      </linearGradient>
    </defs>
  </svg>
);

const ShadowrocketSvg = () => (
  <svg width="44" height="44" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="12" fill="url(#srBg)" />
    <path d="M24 10C24 10 32 17 32 27L28 30L24 27L20 30L16 27C16 17 24 10 24 10Z" fill="#FFFFFF" />
    <circle cx="24" cy="20" r="3" fill="#0284C7" />
    <path d="M20 30L24 37L28 30" fill="#F59E0B" />
    <defs>
      <linearGradient id="srBg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0284C7" />
        <stop offset="1" stopColor="#0369A1" />
      </linearGradient>
    </defs>
  </svg>
);

const FoxraySvg = () => (
  <svg width="44" height="44" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="12" fill="url(#foxBg)" />
    <path d="M14 16L24 24L34 16L31 32L24 36L17 32L14 16Z" fill="#EA580C" stroke="#FB923C" strokeWidth="2" />
    <circle cx="20" cy="24" r="2" fill="#FFF" />
    <circle cx="28" cy="24" r="2" fill="#FFF" />
    <defs>
      <linearGradient id="foxBg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#7C2D12" />
        <stop offset="1" stopColor="#431407" />
      </linearGradient>
    </defs>
  </svg>
);

const FlClashSvg = () => (
  <svg width="44" height="44" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="12" fill="url(#flcBg)" />
    <path d="M14 18L20 12L24 17L28 12L34 18V30C34 33 31 36 28 36H20C17 36 14 33 14 30V18Z" fill="#7E22CE" stroke="#C084FC" strokeWidth="2" />
    <circle cx="20" cy="26" r="2" fill="#FAF5FF" />
    <circle cx="28" cy="26" r="2" fill="#FAF5FF" />
    <path d="M22 29H26" stroke="#FAF5FF" strokeWidth="1.5" strokeLinecap="round" />
    <defs>
      <linearGradient id="flcBg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3B0764" />
        <stop offset="1" stopColor="#1E0A3C" />
      </linearGradient>
    </defs>
  </svg>
);

const HiddifySvg = () => (
  <svg width="44" height="44" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="12" fill="url(#hidBg)" />
    <path d="M24 12L35 18.5V31.5L24 38L13 31.5V18.5L24 12Z" fill="#0D9488" fillOpacity="0.3" stroke="#2DD4BF" strokeWidth="2" />
    <circle cx="24" cy="25" r="4.5" fill="#5EEAD4" />
    <defs>
      <linearGradient id="hidBg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#134E4A" />
        <stop offset="1" stopColor="#042F2E" />
      </linearGradient>
    </defs>
  </svg>
);

export const AppsDownloadSection: React.FC<AppsDownloadSectionProps> = ({ subUrl, subId }) => {
  const [activeTab, setActiveTab] = useState<string>('android');

  const base64Sub = typeof window !== 'undefined' ? btoa(subUrl) : '';

  const androidApps: AppItem[] = [
    {
      id: 'v2box-android',
      name: 'V2Box',
      descFa: 'کلاینت پیشرفته، پرسرعت و مدرن با اتصال مستقیم و آسان',
      badge: 'پیشنهادی ویژه',
      badgeColor: '#10b981',
      svgIcon: <V2BoxSvg />,
      downloadUrl: 'https://play.google.com/store/apps/details?id=dev.hexasoftware.v2box',
      importScheme: (url, id) => `v2box://install-sub?url=${encodeURIComponent(url)}&name=${encodeURIComponent(id || 'GUCCI')}`,
    },
    {
      id: 'v2rayng',
      name: 'v2rayNG',
      descFa: 'محبوب‌ترین و باثبات‌ترین نرم‌افزار اندروید برای تمام اپراتورها',
      badge: 'محبوب‌ترین',
      badgeColor: '#38bdf8',
      svgIcon: <V2rayNgSvg />,
      downloadUrl: 'https://github.com/2dust/v2rayNG/releases/latest',
      importScheme: (url) => `v2rayng://install-config?url=${encodeURIComponent(url)}`,
    },
    {
      id: 'singbox-android',
      name: 'Sing-box',
      descFa: 'پلتفرم فوق‌العاده سبک، سریع با کمترین مصرف باتری و منابع سیستم',
      badge: 'فوق سریع',
      badgeColor: '#f59e0b',
      svgIcon: <SingboxSvg />,
      downloadUrl: 'https://github.com/SagerNet/sing-box/releases/latest',
      importScheme: (url) => `sing-box://import-remote-profile?url=${encodeURIComponent(url)}`,
    },
    {
      id: 'happ-android',
      name: 'Happ Proxy',
      descFa: 'کلاینت نسل جدید و هوشمند با اتصال پایدار به انواع سابسکریپشن‌ها',
      svgIcon: <HappSvg />,
      downloadUrl: 'https://play.google.com/store/apps/details?id=com.happproxy',
      importScheme: (url) => `happ://add/${url}`,
    },
    {
      id: 'npvtunnel',
      name: 'NPV Tunnel',
      descFa: 'کلاینت قدرتمند و سبک جهت عبور از فیلترینگ شدید',
      svgIcon: <NpvSvg />,
      downloadUrl: 'https://play.google.com/store/apps/details?id=com.napsternetlabs.napsternetv',
    },
    {
      id: 'v2raytun-android',
      name: 'V2RayTun',
      descFa: 'کلاینت حرفه‌ای با امکانات تنظیم فرگمنت و پروتکل‌های نوین',
      svgIcon: <V2RayTunSvg />,
      downloadUrl: 'https://play.google.com/store/apps/details?id=com.v2raytun.android',
    },
    {
      id: 'nekobox-android',
      name: 'NekoBox',
      descFa: 'کلاینت همه‌کاره مبتنی بر هسته Sing-box برای اندروید',
      svgIcon: <NekoBoxSvg />,
      downloadUrl: 'https://github.com/MatsuriDayo/NekoBoxForAndroid/releases/latest',
    },
    {
      id: 'incy-android',
      name: 'Incy',
      descFa: 'نرم‌افزار سبک با قابلیت تفکیک خودکار ترافیک داخلی و خارجی',
      svgIcon: <IncySvg />,
      downloadUrl: 'https://play.google.com/store/apps/details?id=com.incy.app',
      importScheme: (url) => `incy://add/${url}`,
    },
  ];

  const iosApps: AppItem[] = [
    {
      id: 'v2box-ios',
      name: 'V2Box',
      descFa: 'بهترین نرم‌افزار رایگان و ضدفیلتر برای تمام مدل‌های آیفون و آیپد',
      badge: 'پیشنهادی iOS',
      badgeColor: '#10b981',
      svgIcon: <V2BoxSvg />,
      downloadUrl: 'https://apps.apple.com/us/app/v2box-v2ray-client/id6446814690',
      importScheme: (url, id) => `v2box://install-sub?url=${encodeURIComponent(url)}&name=${encodeURIComponent(id || 'GUCCI')}`,
    },
    {
      id: 'streisand-ios',
      name: 'Streisand',
      descFa: 'کلاینت هوشمند و قدرتمند iOS با اتصال پایدار به انواع لینک‌های ساب',
      badge: 'محبوب',
      badgeColor: '#ec4899',
      svgIcon: <StreisandSvg />,
      downloadUrl: 'https://apps.apple.com/us/app/streisand/id6450534064',
      importScheme: (url) => `streisand://import/${url}`,
    },
    {
      id: 'shadowrocket-ios',
      name: 'Shadowrocket',
      descFa: 'کامل‌ترین و نام‌آشناترین نرم‌افزار پروکسی در اپ استور اپل',
      badge: 'حرفه‌ای',
      badgeColor: '#38bdf8',
      svgIcon: <ShadowrocketSvg />,
      downloadUrl: 'https://apps.apple.com/us/app/shadowrocket/id932747118',
      importScheme: (url) => `shadowrocket://add/sub://${base64Sub}`,
    },
    {
      id: 'singbox-ios',
      name: 'Sing-box',
      descFa: 'نسخه رسمی کلاینت Sing-box برای پلتفرم iOS با مصرف بهینه باتری',
      svgIcon: <SingboxSvg />,
      downloadUrl: 'https://apps.apple.com/us/app/sing-box/id6451272673',
      importScheme: (url) => `sing-box://import-remote-profile?url=${encodeURIComponent(url)}`,
    },
    {
      id: 'happ-ios',
      name: 'Happ',
      descFa: 'کلاینت ساده، سریع و ضدفیلتر مخصوص آیفون و آیپد',
      svgIcon: <HappSvg />,
      downloadUrl: 'https://apps.apple.com/us/app/happ-proxy-utility/id6504287215',
      importScheme: (url) => `happ://add/${url}`,
    },
    {
      id: 'foxray-ios',
      name: 'Foxray',
      descFa: 'کلاینت پیشرفته با پشتیبانی کامل از پروتکل‌های VLESS و Reality',
      svgIcon: <FoxraySvg />,
      downloadUrl: 'https://apps.apple.com/us/app/foxray/id6448898396',
    },
    {
      id: 'incy-ios',
      name: 'Incy',
      descFa: 'نرم‌افزار مدرن iOS با امکان اتصال سریع به کانفیگ‌ها',
      svgIcon: <IncySvg />,
      downloadUrl: 'https://apps.apple.com/us/app/incy/id6475850901',
      importScheme: (url) => `incy://add/${url}`,
    },
    {
      id: 'v2raytun-ios',
      name: 'V2RayTun',
      descFa: 'کلاینت اختصاصی با رابط کاربری روان برای آیفون',
      svgIcon: <V2RayTunSvg />,
      downloadUrl: 'https://apps.apple.com/us/app/v2raytun/id6476628186',
    },
  ];

  const windowsApps: AppItem[] = [
    {
      id: 'v2rayn-win',
      name: 'v2rayN',
      descFa: 'اصلی‌ترین و پرامکانات‌ترین کلاینت ویندوز برای مدیریت اتصالات',
      badge: 'پیشنهادی ویندوز',
      badgeColor: '#38bdf8',
      svgIcon: <V2rayNgSvg />,
      downloadUrl: 'https://github.com/2dust/v2rayN/releases/latest',
    },
    {
      id: 'flclash-win',
      name: 'FlClash',
      descFa: 'رابط گرافیکی مدرن، بسیار زیبا و بهینه‌شده مبتنی بر هسته کلش',
      badge: 'مدرن',
      badgeColor: '#a855f7',
      svgIcon: <FlClashSvg />,
      downloadUrl: 'https://github.com/chen08209/FlClash/releases/latest',
    },
    {
      id: 'nekobox-win',
      name: 'NekoBox for Windows',
      descFa: 'کلاینت چندمنظوره با پشتیبانی از هسته Sing-box برای سیستم‌های ویندوزی',
      svgIcon: <NekoBoxSvg />,
      downloadUrl: 'https://github.com/MatsuriDayo/nekoray/releases/latest',
    },
    {
      id: 'hiddify-win',
      name: 'Hiddify Next',
      descFa: 'کلاینت فوق‌العاده ساده، هوشمند و خودکار برای ویندوز',
      svgIcon: <HiddifySvg />,
      downloadUrl: 'https://github.com/hiddify/hiddify-next/releases/latest',
    },
    {
      id: 'singbox-win',
      name: 'Sing-box Core',
      descFa: 'هسته فوق سریع و پرسرعت Sing-box برای ویندوز',
      svgIcon: <SingboxSvg />,
      downloadUrl: 'https://github.com/SagerNet/sing-box/releases/latest',
    },
  ];

  const macApps: AppItem[] = [
    {
      id: 'v2box-mac',
      name: 'V2Box for Mac',
      descFa: 'کلاینت اختصاصی و بدون دردسر مستقیماً از اپ استور سیستم‌های مکینتاش',
      badge: 'پیشنهادی مک',
      badgeColor: '#10b981',
      svgIcon: <V2BoxSvg />,
      downloadUrl: 'https://apps.apple.com/us/app/v2box-v2ray-client/id6446814690',
      importScheme: (url, id) => `v2box://install-sub?url=${encodeURIComponent(url)}&name=${encodeURIComponent(id || 'GUCCI')}`,
    },
    {
      id: 'flclash-mac',
      name: 'FlClash for macOS',
      descFa: 'رابط کاربری چشم‌نواز و سازگار با چیپ‌های اینتل و اپل سیلیکون (M1/M2/M3/M4)',
      badge: 'مدرن',
      badgeColor: '#a855f7',
      svgIcon: <FlClashSvg />,
      downloadUrl: 'https://github.com/chen08209/FlClash/releases/latest',
    },
    {
      id: 'streisand-mac',
      name: 'Streisand Mac',
      descFa: 'نسخه رسمی کلاینت Streisand برای سیستم‌عامل مکینتاش',
      svgIcon: <StreisandSvg />,
      downloadUrl: 'https://apps.apple.com/us/app/streisand/id6450534064',
      importScheme: (url) => `streisand://import/${url}`,
    },
    {
      id: 'singbox-mac',
      name: 'Sing-box macOS',
      descFa: 'پلتفرم یونیورسال Sing-box با بهینه‌سازی کامل برای macOS',
      svgIcon: <SingboxSvg />,
      downloadUrl: 'https://apps.apple.com/us/app/sing-box/id6451272673',
    },
  ];

  const linuxApps: AppItem[] = [
    {
      id: 'flclash-linux',
      name: 'FlClash Linux',
      descFa: 'کلاینت گرافیکی Clash با پشتیبانی از پکیج‌های AppImage, Deb, RPM',
      badge: 'پیشنهادی لینوکس',
      badgeColor: '#a855f7',
      svgIcon: <FlClashSvg />,
      downloadUrl: 'https://github.com/chen08209/FlClash/releases/latest',
    },
    {
      id: 'v2raya-linux',
      name: 'v2rayA',
      descFa: 'وب‌کلاینت قدرتمند لینوکس برای مدیریت سراسری پروکسی سیستم',
      svgIcon: <V2rayNgSvg />,
      downloadUrl: 'https://github.com/v2rayA/v2rayA/releases/latest',
    },
  ];

  const handleOpenApp = (app: AppItem) => {
    if (app.importScheme && subUrl) {
      const scheme = app.importScheme(subUrl, subId);
      window.location.href = scheme;
      message.success(`در حال اتصال خودکار به ${app.name}...`);
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
              <div className="client-app-icon-wrapper">
                {app.svgIcon}
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
                  اتصال مستقیم
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
        <span>دانلود نرم‌افزار و اتصال آسان به سرویس</span>
      </div>
      <Text type="secondary" className="apps-section-subtitle">
        برای استفاده از اشتراک، نرم‌افزار مناسب دستگاه خود را دریافت کرده و با دکمه «اتصال مستقیم» آنی متصل شوید:
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
          {
            key: 'linux',
            label: (
              <Space>
                <DesktopOutlined />
                <span>لینوکس (Linux)</span>
              </Space>
            ),
            children: renderAppList(linuxApps),
          },
        ]}
      />
    </div>
  );
};

export default AppsDownloadSection;
