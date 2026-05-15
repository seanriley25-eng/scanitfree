import type { Metadata } from "next";
import { FoodSafetyClient } from "./client";

export const metadata: Metadata = {
  title: "Free AI Food Safety Scanner — Scan Ingredient Labels by Photo or Text",
  description:
    "Upload a photo of any food label or paste an ingredient list, product name, or UPC. Our AI cross-references FDA recalls, allergen databases, and safety research to give you a clear safety score. 100% free.",
  keywords: [
    "food safety checker",
    "ingredient scanner",
    "FDA recall check",
    "is this food safe",
    "allergen checker",
    "food recall lookup",
    "scan food label photo",
    "upload ingredient label",
    "food label scanner",
  ],
};

export default function FoodSafetyPage() {
  return <FoodSafetyClient />;
}
