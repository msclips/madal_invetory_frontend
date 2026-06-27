import React, { createContext, useContext, useState } from "react";
import { languages } from './index';

const TranslateContext = createContext<any>(null);

export const TranslateProvider = ({ children }: { children: React.ReactNode }) => {
    const [lang, setLang] = useState("en");
    const translang = languages[lang] || languages["en"];

    return (
        <TranslateContext.Provider value={{ lang, setLang, translang }}>
            {children}
        </TranslateContext.Provider>
    );
};

export const useTranslate = () => {
    const context = useContext(TranslateContext);
    if (!context) {
        return { lang: "en", setLang: () => {}, translang: languages["en"] };
    }
    return context;
};
