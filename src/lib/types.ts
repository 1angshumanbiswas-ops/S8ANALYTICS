// Core data model, mirroring S8 Analytics Multi-Instructor LMS Blueprint, section 14.

export type UserRole =
  | "student"
  | "instructor"
  | "instructor_team_member"
  | "reviewer"
  | "support_finance"
  | "admin"
  | "super_admin"
  | "corporate_manager";

export type InstructorStatus =
  | "draft"
  | "verification_pending"
  | "verified"
  | "restricted"
  | "suspended";

export type CourseStatus =
  | "draft"
  | "in_review"
  | "changes_requested"
  | "approved"
  | "published"
  | "delisted";

export interface AppUser {
  uid: string;
  role: UserRole;
  status: "active" | "disabled";
  profile: {
    displayName: string;
    email: string;
    photoUrl?: string;
  };
  preferences?: Record<string, unknown>;
  consentTimestamps?: Record<string, string>;
  createdAt: string;
}

export interface Instructor {
  uid: string;
  publicProfile: {
    displayName: string;
    title?: string;
    photoUrl?: string;
    bio?: string;
    expertise: string[];
    languages: string[];
  };
  verificationStatus: InstructorStatus;
  payoutAccountRef?: string; // Razorpay linked-account id (Route)
  ratingSummary: { average: number; count: number };
  policyStatus: "ok" | "restricted" | "suspended";
  commissionRateOverride?: number; // fraction, overrides platform default
  createdAt: string;
}

export interface PriceConfig {
  currency: "INR";
  listPrice: number; // paise
  salePrice?: number; // paise
  saleStartsAt?: string;
  saleEndsAt?: string;
  isFree: boolean;
}

export interface Course {
  courseId: string;
  instructorId: string;
  categoryId: string; // e.g. "excel", "ai", "analytics", "astrology"
  title: string;
  subtitle?: string;
  level: "beginner" | "intermediate" | "advanced";
  language: string;
  status: CourseStatus;
  curriculum: { moduleId: string; title: string; lessonIds: string[] }[];
  priceConfig: PriceConfig;
  accessRules: { accessDurationDays?: number; certificateEligible: boolean };
  reviewState: {
    lastReviewedBy?: string;
    lastReviewedAt?: string;
    reason?: string;
  };
  thumbnailUrl?: string;
  previewVideoUrl?: string;
  outcomes: string[];
  prerequisites: string[];
  createdAt: string;
  updatedAt: string;
}

export type LessonType = "video" | "text" | "pdf" | "workbook" | "code" | "quiz" | "assignment";

export interface Lesson {
  lessonId: string;
  courseId: string;
  moduleId: string;
  type: LessonType;
  title: string;
  contentRef: string; // storage path or external embed url
  duration?: number; // seconds
  previewFlag: boolean;
  completionRule: "view" | "watch_90pct" | "submit";
  order: number;
}

export interface Enrolment {
  enrolmentId: string;
  studentId: string;
  courseId: string;
  purchaseId: string; // orders.orderId
  entitlementStatus: "active" | "revoked" | "expired";
  startDate: string;
  endDate?: string;
}

export interface Progress {
  studentId: string;
  courseId: string;
  lessonId: string;
  completed: boolean;
  lastPositionSeconds?: number;
  updatedAt: string;
  scoreRef?: string;
}

export interface OrderLineItem {
  courseId: string;
  instructorId: string;
  title: string;
  unitPrice: number; // paise, price at time of purchase
  couponCode?: string;
  discount?: number;
}

export interface Order {
  orderId: string;
  studentId: string;
  lineItems: OrderLineItem[];
  gross: number; // paise
  discount: number;
  providerPaymentRef?: string; // razorpay_payment_id
  providerOrderRef?: string; // razorpay_order_id
  paymentState: "created" | "authorized" | "captured" | "failed" | "refunded" | "partially_refunded";
  createdAt: string;
  updatedAt: string;
}

export interface LedgerEntry {
  ledgerEntryId: string;
  orderId: string;
  instructorId: string;
  courseId: string;
  grossAmount: number; // paise, attributable to this instructor's line item
  platformFee: number; // paise
  commissionRateApplied: number; // versioned fraction used for this calc
  commissionRuleVersion: string;
  adjustmentType: "sale" | "refund" | "chargeback" | "correction";
  status: "pending" | "available" | "paid" | "reversed";
  createdAt: string;
}

export interface Payout {
  payoutId: string;
  instructorId: string;
  periodStart: string;
  periodEnd: string;
  amount: number; // paise
  providerTransferRef?: string;
  status: "scheduled" | "processing" | "paid" | "failed";
  reconciliationNote?: string;
}

export interface Review {
  reviewId: string;
  studentId: string;
  courseId: string;
  verifiedPurchase: boolean;
  rating: number; // 1-5
  text?: string;
  moderationStatus: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface Certificate {
  certificateId: string;
  studentId: string;
  courseId: string;
  issueDate: string;
  verificationHash: string;
  status: "issued" | "revoked";
}

export const COMMISSION_RULE_VERSION = "v1-2026-08";
export const PLATFORM_DEFAULT_COMMISSION_RATE = Number(
  process.env.PLATFORM_DEFAULT_COMMISSION_RATE ?? 0.2
);

export const CATEGORIES = [
  {
    id: "excel",
    label: "Excel & Professional Skills",
    icon: "📊",
    description: "Dashboards, formulas & AI-assisted reporting",
  },
  {
    id: "ai",
    label: "Artificial Intelligence",
    icon: "🤖",
    description: "Prompting, automation & building with AI",
  },
  {
    id: "analytics",
    label: "Data Analytics",
    icon: "📈",
    description: "Power BI, SQL & decision-ready data",
  },
  {
    id: "pm",
    label: "Project & Product Management",
    icon: "🗂️",
    description: "Scrum, Agile, PMP prep & product ownership",
  },
  {
    id: "cybersecurity",
    label: "Cybersecurity",
    icon: "🛡️",
    description: "Security fundamentals, cloud security & certifications",
  },
  {
    id: "marketing",
    label: "Digital Marketing",
    icon: "📣",
    description: "SEO, paid ads, content & growth marketing",
  },
  {
    id: "personal-dev",
    label: "Personal & Professional Development",
    icon: "🌱",
    description: "Communication, leadership & career growth skills",
  },
  {
    id: "astrology",
    label: "Vedic Learning",
    icon: "✨",
    description: "Vedic tools, charts & practitioner skills",
  },
] as const;
