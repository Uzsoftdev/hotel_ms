import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import pub_arabic from "../locales/ar/public-translations.json";
import pub_german from "../locales/de/public-translations.json";
import pub_french from "../locales/fr/public-translations.json";
import pub_it from "../locales/it/public-translations.json";
import pub_japanese from "../locales/ja/public-translations.json";
import pub_korean from "../locales/ko/public-translations.json";
import pub_portuguese from "../locales/pt/public-translations.json";
import pub_russian from "../locales/ru/public-translations.json";
import pub_chinese from "../locales/zh/public-translations.json";
import pub_english from "../locales/en/public-translations.json";
import pub_spanish from "../locales/es/public-translations.json";

const supportedLanguages = ["ar", "de", "en", "es", "fr", "it", "ja", "ko", "pt", "ru", "zh"];
const savedLanguage = localStorage.getItem("app_language");
const initialLanguage = supportedLanguages.includes(savedLanguage) ? savedLanguage : "en";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ar: {
        pub_translation: pub_arabic,
      },
      en: {
        pub_translation: pub_english
      },
      es: {
        pub_translation: pub_spanish
      },
      de: {
        pub_translation: pub_german
      },
      fr: {
        pub_translation: pub_french
      },
      it: {
        pub_translation: pub_it
      },
      ja: {
        pub_translation: pub_japanese
      },
      ko: {
        pub_translation: pub_korean
      },
      pt: {
        pub_translation: pub_portuguese
      },
      ru: {
        pub_translation: pub_russian
      },
      zh: {
        pub_translation: pub_chinese
      }
    },
    lng: initialLanguage,
    fallbackLng: "en",
    supportedLngs: supportedLanguages,
    defaultNS: "pub_translation",
    interpolation: {
      escapeValue: false
    }
  });

i18n.on("languageChanged", (lng) => {
  localStorage.setItem("app_language", lng);
  document.documentElement.lang = lng;
  document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
});

document.documentElement.lang = i18n.language;
document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";

export default i18n;