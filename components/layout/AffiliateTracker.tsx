"use client";
import { useEffect } from "react";

/**
 * AffiliateTracker — Invisible tracking component.
 * Reads ?ref=CODE from URL and sets a 30-day cookie.
 * The cookie is then read during checkout to attribute the sale.
 */
export function AffiliateTracker() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get("ref");

    if (refCode && refCode.trim().length > 0) {
      const code = refCode.trim().toUpperCase();
      // Set cookie for 30 days
      const expires = new Date();
      expires.setDate(expires.getDate() + 30);
      document.cookie = `alma_lik_ref=${encodeURIComponent(code)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    }
  }, []);

  return null; // Invisible component
}
