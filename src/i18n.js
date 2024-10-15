// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// インポートする言語のリソース
const resources = {
  en: {
    translation: require('../public/locales/en/translation.json')
  },
  ja: {
    translation: require('../public/locales/ja/translation.json')
  },
  // 他の言語も同様に追加
};

i18n
  .use(LanguageDetector) // 言語検出プラグインを使用
  .use(initReactI18next) // react-i18next を初期化
  .init({
    resources,
    fallbackLng: 'en', // デフォルト言語
    interpolation: {
      escapeValue: false // React は XSS 対策済み
    }
  });

export default i18n;


