import React, { createContext, useContext, useState, useEffect } from 'react'

export type Language = 'en' | 'id'

type Translations = {
  [key in Language]: Record<string, string>
}

export const translations: Translations = {
  en: {
    // Navigation
    navEvents: 'EVENTS',
    navMyTickets: 'MY TICKETS',
    navDrops: 'DROPS',
    navNews: 'NEWS',
    balance: 'BALANCE',
    
    // Landing
    heroTitle: 'THE FUTURE OF',
    heroTitle2: 'NIGHTLIFE',
    heroSubtitle: 'Enter the Vortex. Experience cybernetic raves, augmented reality stages, and digital ticketing on the blockchain.',
    btnDashboard: 'ENTER DASHBOARD',
    btnConnect: 'CONNECT MATRIX',
    
    // Dashboard Common
    locked: 'LOCKED',
    ticketsLive: 'TICKETS LIVE',
    getAccess: 'GET ACCESS',
    logout: 'DISCONNECT',

    // Settings
    settingsTitle: 'SYSTEM_SETTINGS',
    tabAccount: 'ACCOUNT',
    tabSecurity: 'SECURITY',
    tabPrefs: 'PREFS',
    langSetting: 'LANGUAGE',
    langDesc: 'Set system interface language',
    saveChanges: 'SAVE PROTOCOLS',
    savedMsg: 'Protocols updated successfully',

    // Sidebar
    menuProfile: 'PROFILE',
    menuHistory: 'HISTORY',
    menuLoyalty: 'LOYALTY',
    menuSettings: 'SETTINGS',
  },
  id: {
    // Navigation
    navEvents: 'ACARA',
    navMyTickets: 'TIKET SAYA',
    navDrops: 'DROPS',
    navNews: 'BERITA',
    balance: 'SALDO',
    
    // Landing
    heroTitle: 'MASA DEPAN',
    heroTitle2: 'DUNIA MALAM',
    heroSubtitle: 'Masuki Vortex. Rasakan rave sibernetik, panggung augmented reality, dan tiket digital di atas blockchain.',
    btnDashboard: 'MASUK DASHBOARD',
    btnConnect: 'HUBUNGKAN MATRIKS',
    
    // Dashboard Common
    locked: 'TERKUNCI',
    ticketsLive: 'TIKET TERSEDIA',
    getAccess: 'DAPATKAN AKSES',
    logout: 'PUTUS KONEKSI',

    // Settings
    settingsTitle: 'PENGATURAN_SISTEM',
    tabAccount: 'AKUN',
    tabSecurity: 'KEAMANAN',
    tabPrefs: 'PREFERENSI',
    langSetting: 'BAHASA',
    langDesc: 'Atur bahasa antarmuka sistem',
    saveChanges: 'SIMPAN PROTOKOL',
    savedMsg: 'Protokol berhasil diperbarui',

    // Sidebar
    menuProfile: 'PROFIL',
    menuHistory: 'RIWAYAT',
    menuLoyalty: 'LOYALITAS',
    menuSettings: 'PENGATURAN',
  }
}

interface I18nContextType {
  lang: Language
  setLang: (lang: Language) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('en')

  useEffect(() => {
    const saved = localStorage.getItem('vortex-lang') as Language
    if (saved && (saved === 'en' || saved === 'id')) {
      setLangState(saved)
    }
  }, [])

  const setLang = (newLang: Language) => {
    setLangState(newLang)
    localStorage.setItem('vortex-lang', newLang)
  }

  const t = (key: string): string => {
    return translations[lang][key] || key
  }

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useTranslation must be used within an I18nProvider')
  }
  return context
}
