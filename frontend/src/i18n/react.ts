import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import { LanguageManager } from '@/utils';
import enUS from '../../../internal/web/translation/en-US.json';

const FALLBACK = 'en-US';

const lazyModules = import.meta.glob([
  '../../../internal/web/translation/*.json',
  '!../../../internal/web/translation/en-US.json',
]);

function moduleKeyFor(code: string): string {
  return `../../../internal/web/translation/${code}.json`;
}

let active: string = LanguageManager.getLanguage();
if (
  active !== FALLBACK &&
  !Object.prototype.hasOwnProperty.call(lazyModules, moduleKeyFor(active))
) {
  active = FALLBACK;
}

export async function readyI18n() {
  await i18next.use(initReactI18next).init({
    lng: active,
    fallbackLng: FALLBACK,
    resources: { [FALLBACK]: { translation: enUS } },
    interpolation: { escapeValue: false, prefix: '{', suffix: '}' },
    returnNull: false,
  });
  if (active !== FALLBACK) {
    const loader = lazyModules[moduleKeyFor(active)] as
      | (() => Promise<{ default: Record<string, unknown> }>)
      | undefined;
    if (loader) {
      const mod = await loader();
      const messages = (mod.default ?? mod) as Record<string, unknown>;
      i18next.addResourceBundle(active, 'translation', messages, true, true);
      await i18next.changeLanguage(active);
    }
  }
  return i18next;
}

// Instant language switch: loads the bundle on demand and swaps the active
// language in place, so the UI updates immediately without a page reload.
const loadedLanguages = new Set<string>([FALLBACK]);

export async function switchLanguage(code: string): Promise<void> {
  const next = LanguageManager.isSupportLanguage(code) ? code : FALLBACK;
  LanguageManager.rememberLanguage(next);
  if (!loadedLanguages.has(next)) {
    const loader = lazyModules[moduleKeyFor(next)] as
      | (() => Promise<{ default: Record<string, unknown> }>)
      | undefined;
    if (loader) {
      const mod = await loader();
      const messages = (mod.default ?? mod) as Record<string, unknown>;
      i18next.addResourceBundle(next, 'translation', messages, true, true);
    }
    loadedLanguages.add(next);
  }
  await i18next.changeLanguage(next);
  if (typeof document !== 'undefined') {
    document.documentElement.lang = next;
  }
}

// Warm every bundle in the background so tapping a flag is instant.
export function prefetchAllLanguages(): void {
  for (const [key, loader] of Object.entries(lazyModules)) {
    const code = key.slice(key.lastIndexOf('/') + 1, -'.json'.length);
    if (loadedLanguages.has(code)) continue;
    void (loader as () => Promise<{ default: Record<string, unknown> }>)()
      .then((mod) => {
        const messages = (mod.default ?? mod) as Record<string, unknown>;
        i18next.addResourceBundle(code, 'translation', messages, true, true);
        loadedLanguages.add(code);
      })
      .catch(() => {});
  }
}

export { i18next as i18n };
