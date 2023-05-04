import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import BrowserLanguageDetector from 'i18next-browser-languagedetector';
// 根据需要导入你的翻译文件
import enTranslations from './en.json';
import zhTranslations from './zh.json';

class CustomLanguageDetector extends BrowserLanguageDetector {
  detect() {
    const detectedLanguages = super.detect();
    return detectedLanguages.map(lang => lang.substring(0, 2));
  }
}


i18n
  .use(CustomLanguageDetector) // 使用自定义检测器
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations,
      },
      zh: {
        translation: zhTranslations,
      },
    },
    lng:'zh',
    fallbackLng: 'en',
    debug: true,
    interpolation: {
      escapeValue: false,
    },
  });

//console.log(i18n);

export default i18n;


