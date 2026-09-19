import { SUPPORT_EMAIL } from "@/lib/course-catalog";

export const legalConfig = {
  businessName: import.meta.env["VITE_LEGAL_BUSINESS_NAME"] || "RobotCodeHub",
  postalAddress:
    import.meta.env["VITE_LEGAL_POSTAL_ADDRESS"] ||
    "Available from support before any live purchase",
  governingLaw:
    import.meta.env["VITE_LEGAL_GOVERNING_LAW"] || "the mandatory law applicable to the customer",
  email: SUPPORT_EMAIL,
} as const;
