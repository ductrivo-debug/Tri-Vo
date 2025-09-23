import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { translations } from '../translations';

// Define the type for the translations object
type Translations = typeof translations.en;
type Locale = keyof typeof translations;

interface LanguageContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: keyof Translations | string, ...args: any[]) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const getInitialLocale = (): Locale => {
    const savedLocale = localStorage.getItem('silverbackMmaLocale');
    if (savedLocale && savedLocale in translations) {
        return savedLocale as Locale;
    }
    const browserLang = navigator.language.split('-')[0];
    return browserLang in translations ? browserLang as Locale : 'en';
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [locale, setLocaleState] = useState<Locale>(getInitialLocale());

    useEffect(() => {
        localStorage.setItem('silverbackMmaLocale', locale);
    }, [locale]);

    const setLocale = (newLocale: Locale) => {
        if (newLocale in translations) {
            setLocaleState(newLocale);
        }
    };

    const t = useCallback((key: keyof Translations | string, ...args: any[]): string => {
        const translationKey = key as keyof Translations;
        // @ts-ignore
        let translation = translations[locale]?.[translationKey] || translations['en']?.[translationKey] || key;
        
        if (typeof translation !== 'string') {
            // Fix: Ensure the function always returns a string, even if the key is not found or is not a string itself.
            return String(key);
        }

        if (args.length > 0) {
            args.forEach((arg, index) => {
                const placeholder = new RegExp(`\\{${index}\\}`, 'g');
                translation = translation.replace(placeholder, arg);
            });
        }
        return translation;
    }, [locale]);

    return (
        <LanguageContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};