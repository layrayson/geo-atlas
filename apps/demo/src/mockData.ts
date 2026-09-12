import type { RegionValue } from "@geo-atlas/react";

/** Made-up scan-rate percentages per region, for demo purposes only — real shapeISO codes, invented values. */

export const mockNigeriaScanRates: RegionValue[] = [
  { id: "NG-LA", value: 92 },
  { id: "NG-FC", value: 81 },
  { id: "NG-RI", value: 76 },
  { id: "NG-OY", value: 68 },
  { id: "NG-KN", value: 61 },
  { id: "NG-KD", value: 55 },
  { id: "NG-EN", value: 48 },
  { id: "NG-DE", value: 44 },
  { id: "NG-AN", value: 39 },
  { id: "NG-OG", value: 35 },
  { id: "NG-ED", value: 33 },
  { id: "NG-BO", value: 22 },
  { id: "NG-YO", value: 18 },
  { id: "NG-SO", value: 15 },
  { id: "NG-ZA", value: 12 },
];

export const mockKenyaScanRates: RegionValue[] = [
  { id: "KE-30", value: 94 }, // Nairobi
  { id: "KE-28", value: 85 }, // Mombasa
  { id: "KE-17", value: 74 }, // Kisumu
  { id: "KE-13", value: 66 }, // Kiambu
  { id: "KE-31", value: 58 }, // Nakuru
  { id: "KE-12", value: 52 }, // Kericho
  { id: "KE-11", value: 47 }, // Kakamega
  { id: "KE-19", value: 41 }, // Kwale
  { id: "KE-22", value: 36 }, // Machakos
  { id: "KE-07", value: 29 }, // Garissa
  { id: "KE-24", value: 21 }, // Mandera
  { id: "KE-46", value: 17 }, // Wajir
  { id: "KE-43", value: 13 }, // Turkana
];

export const mockUkScanRates: RegionValue[] = [
  { id: "GB-ENG", value: 82 }, // England
  { id: "GB-NIR", value: 61 }, // Northern Ireland
  { id: "GB-SCT", value: 55 }, // Scotland
  { id: "GB-WLS", value: 38 }, // Wales
];

export const mockUsaScanRates: RegionValue[] = [
  { id: "US-CA", value: 91 },
  { id: "US-NY", value: 87 },
  { id: "US-TX", value: 79 },
  { id: "US-FL", value: 72 },
  { id: "US-IL", value: 65 },
  { id: "US-PA", value: 59 },
  { id: "US-OH", value: 53 },
  { id: "US-GA", value: 48 },
  { id: "US-AZ", value: 44 },
  { id: "US-CO", value: 39 },
  { id: "US-MT", value: 31 },
  { id: "US-WY", value: 24 },
  { id: "US-AK", value: 16 },
];
