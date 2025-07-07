import { useState, useEffect } from "react";

export type ConsentStatus = "accepted" | "declined" | null;

interface CookieConsentData {
  status: ConsentStatus;
  date: string | null;
}

export const useCookieConsent = () => {
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>(null);
  const [consentDate, setConsentDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Проверяем существующее согласие при загрузке
    const status = localStorage.getItem("cookie-consent") as ConsentStatus;
    const date = localStorage.getItem("cookie-consent-date");

    setConsentStatus(status);
    setConsentDate(date);
    setIsLoading(false);
  }, []);

  const acceptCookies = () => {
    const now = new Date().toISOString();
    localStorage.setItem("cookie-consent", "accepted");
    localStorage.setItem("cookie-consent-date", now);
    setConsentStatus("accepted");
    setConsentDate(now);
  };

  const declineCookies = () => {
    const now = new Date().toISOString();
    localStorage.setItem("cookie-consent", "declined");
    localStorage.setItem("cookie-consent-date", now);
    setConsentStatus("declined");
    setConsentDate(now);
  };

  const resetConsent = () => {
    localStorage.removeItem("cookie-consent");
    localStorage.removeItem("cookie-consent-date");
    setConsentStatus(null);
    setConsentDate(null);
  };

  const hasGivenConsent = (): boolean => {
    return consentStatus !== null;
  };

  const hasAcceptedCookies = (): boolean => {
    return consentStatus === "accepted";
  };

  const hasDeclinedCookies = (): boolean => {
    return consentStatus === "declined";
  };

  const getConsentData = (): CookieConsentData => {
    return {
      status: consentStatus,
      date: consentDate,
    };
  };

  // Проверка, не истек ли срок согласия (например, через год)
  const isConsentExpired = (expireDays: number = 365): boolean => {
    if (!consentDate) return true;

    const consentTime = new Date(consentDate).getTime();
    const currentTime = new Date().getTime();
    const daysDiff = (currentTime - consentTime) / (1000 * 60 * 60 * 24);

    return daysDiff > expireDays;
  };

  return {
    consentStatus,
    consentDate,
    isLoading,
    acceptCookies,
    declineCookies,
    resetConsent,
    hasGivenConsent,
    hasAcceptedCookies,
    hasDeclinedCookies,
    getConsentData,
    isConsentExpired,
  };
};
