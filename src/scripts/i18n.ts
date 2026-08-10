// Runtime de i18n (toggle en el cliente, sin cambiar de URL).
// El texto visible se conmuta con CSS (html[data-lang] + [data-i18n]).
// Aquí se manejan: persistencia, cableado de los toggles, atributos
// (placeholder / aria-label) y enlaces de WhatsApp por idioma.
import { ui, type Lang } from '../i18n/ui';

const STORAGE_KEY = 'lang';

function normalize(value: string | null): Lang {
  return value === 'en' ? 'en' : 'es';
}

export function getLang(): Lang {
  return normalize(document.documentElement.dataset.lang ?? null);
}

function applyAttributes(lang: Lang): void {
  // Placeholders: data-i18n-ph-es / data-i18n-ph-en
  document.querySelectorAll<HTMLElement>('[data-i18n-ph-es]').forEach((el) => {
    const val = el.getAttribute(`data-i18n-ph-${lang}`);
    if (val !== null) el.setAttribute('placeholder', val);
  });

  // aria-labels: data-i18n-aria-es / data-i18n-aria-en
  document.querySelectorAll<HTMLElement>('[data-i18n-aria-es]').forEach((el) => {
    const val = el.getAttribute(`data-i18n-aria-${lang}`);
    if (val !== null) el.setAttribute('aria-label', val);
  });

  // Enlaces de WhatsApp: data-wa-base = "https://wa.me/<num>"
  document.querySelectorAll<HTMLAnchorElement>('[data-wa-base]').forEach((a) => {
    const base = a.getAttribute('data-wa-base') ?? '';
    a.href = `${base}?text=${encodeURIComponent(ui[lang].whatsappMessage)}`;
  });
}

export function setLang(lang: Lang): void {
  document.documentElement.dataset.lang = lang;
  document.documentElement.lang = lang;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* ignore */
  }
  applyAttributes(lang);
  document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
}

function init(): void {
  // El snippet inline del <head> ya fijó data-lang antes de pintar.
  setLang(getLang());

  document.querySelectorAll<HTMLElement>('[data-lang-set]').forEach((btn) => {
    btn.addEventListener('click', () => setLang(normalize(btn.dataset.langSet ?? null)));
  });
}

init();
