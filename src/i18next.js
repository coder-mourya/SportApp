// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import homeEn from "./Languages/Home/en.json";
import homeHi from "./Languages/Home/hi.json";
import homeDe from "./Languages/Home/de.json";

import serviceEn from "./Languages/Services/en.json";
import serviceDe from "./Languages/Services/de.json";
import serviceHi from "./Languages/Services/hi.json";

import AwesomeEn from './Languages/Awesome/en.json';
import AwesomeDe from './Languages/Awesome/de.json';
import AwesomeHi from './Languages/Awesome/hi.json';

import ScreenshotEn from "./Languages/Screenshots/en.json";
import ScreenshotDe from "./Languages/Screenshots/de.json";
import ScreenshotHi from "./Languages/Screenshots/hi.json";





i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                home: homeEn,
                service : serviceEn,
                Awesome : AwesomeEn,
                screenshot : ScreenshotEn,
            },
            de: {
                home: homeDe,
                service : serviceDe,
                Awesome : AwesomeDe,
                screenshot : ScreenshotDe,

            },
            hi: {
                home : homeHi,
                service : serviceHi,
                Awesome : AwesomeHi,
                screenshot : ScreenshotHi

            }
        },
        lng: 'en', // Default language
        fallbackLng: 'en', // Fallback language
        interpolation: {
            escapeValue: false, // React already escapes by default
        },
    });

export default i18n;
