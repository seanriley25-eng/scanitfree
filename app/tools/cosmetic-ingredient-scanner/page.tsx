import type { Metadata } from "next";
import { CosmeticIngredientClient } from "./client";

export const metadata: Metadata = {
  title: "Free Cosmetic Ingredient Scanner — EWG-Style Safety Scores & Pregnancy Flags",
  description:
    "Paste any ingredient list or upload a product label photo. Get EWG-style concern scores, pregnancy safety flags, fragrance-free verification, and plain-English breakdowns for every ingredient. Free, no signup.",
  keywords: [
    "cosmetic ingredient scanner",
    "skincare ingredient checker",
    "EWG ingredient score",
    "cosmetic safety checker",
    "pregnancy safe skincare checker",
    "fragrance free verification",
    "INCI ingredient analyzer",
    "clean beauty checker",
    "makeup ingredient analyzer",
    "toxic ingredients in cosmetics",
  ],
};

export default function CosmeticIngredientScannerPage() {
  return <CosmeticIngredientClient />;
}
