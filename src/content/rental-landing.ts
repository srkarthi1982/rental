import type { LandingPageContent } from "../lib/landing";

export const createRentalLandingContent = ({
  startHref,
}: {
  startHref: string;
}): LandingPageContent => ({
  categoryLabel: "Rental Platform",
  appLabel: "Rental by Ansiversa",
  title: "Rent what you need from one trusted platform",
  subtitle:
    "Rental is the Ansiversa platform for cars, homes, equipment, and future rental verticals, beginning with a focused car rental experience.",
  heroBullets: [
    "Start with car rental while keeping the platform ready for new rental categories",
    "Use one protected workspace for browsing, managing, and growing rental workflows",
    "Keep rental activity organized under shared Ansiversa auth and product standards",
  ],
  primaryCta: {
    label: "Open Rental",
    href: startHref,
  },
  secondaryCta: {
    label: "View Platform Flow",
    href: "#workflow",
    variant: "ghost",
  },
  heroNote: "V1 starts with car rental. The platform foundation remains category-ready.",
  heroPanel: {
    eyebrow: "Platform flow",
    title: "Choose a rental category first",
    steps: [
      "1. Enter Rental from Ansiversa",
      "2. Choose cars, homes, equipment, or future categories",
      "3. Continue into the protected workspace for the selected rental flow",
    ],
    meta: [
      { value: "Cars", label: "V1 vertical" },
      { value: "Generic", label: "Platform base" },
    ],
  },
  features: {
    title: "Built for rental activity across categories",
    lead:
      "Rental begins with the car rental vertical, but the shell is prepared for the broader rental marketplace Karthikeyan and Astra defined.",
    items: [
      {
        title: "Category-first entry",
        description:
          "Users enter Rental first, then choose what they want to rent instead of being locked into one vertical.",
      },
      {
        title: "Car rental ready",
        description:
          "The first product flow can focus on cars while using a platform foundation that leaves room for homes, equipment, and more.",
      },
      {
        title: "Shared account standards",
        description:
          "The app keeps Ansiversa session, middleware, protected workspace, and shared component standards intact from the start.",
      },
      {
        title: "Clean shell before data",
        description:
          "The platform shell is ready for the next phase without prematurely adding rental database tables or business rules.",
      },
    ],
  },
  pillars: {
    title: "Rental platform principles",
    lead:
      "The foundation stays broad enough for the whole rental ecosystem while giving V1 a clear car rental path.",
    items: [
      {
        title: "One platform",
        description:
          "Rental is a full Ansiversa product surface, not a single-purpose utility.",
      },
      {
        title: "Multiple verticals",
        description:
          "Cars lead V1, with homes, equipment, and other rental categories reserved for later phases.",
      },
      {
        title: "Protected workspace",
        description:
          "Authenticated users continue through `/app`, preserving the shared Ansiversa entry pattern.",
      },
      {
        title: "No premature schema",
        description:
          "Rental database design will be introduced in the next approved phase.",
      },
      {
        title: "Shared UI language",
        description:
          "The app keeps `@ansiversa/components` as the product UI foundation.",
      },
      {
        title: "Generic architecture",
        description:
          "Car rental should not hard-code the entire platform into a car-only shape.",
      },
    ],
  },
  workflow: {
    eyebrow: "How it works",
    title: "A simple path into rental workflows",
    lead:
      "The current shell establishes the platform entry. Rental logic comes after the schema and V1 flow are approved.",
    steps: [
      {
        title: "Enter Rental",
        description:
          "Users arrive at rental.ansiversa.com and see the platform purpose before entering the workspace.",
      },
      {
        title: "Choose a category",
        description:
          "The platform is designed around category selection, starting with cars and later expanding to homes, equipment, and other rentals.",
      },
      {
        title: "Continue in `/app`",
        description:
          "Authenticated users move into the protected Rental workspace where the approved V1 product flow will be added next.",
      },
    ],
  },
  showcase: {
    eyebrow: "V1 direction",
    title: "Car rental first, platform rental always",
    description:
      "The first vertical can move quickly without narrowing the long-term platform. Rental stays ready for additional categories from the beginning.",
    bullets: [
      "Car rental is the first approved vertical",
      "Homes and equipment remain planned platform categories",
      "Business logic and database tables are intentionally deferred",
    ],
    calloutLabel: "Current phase",
    calloutValue: "Platform shell only",
  },
  finalCta: {
    title: "Open the Rental workspace",
    description:
      "This foundation is ready for the next approved phase: Rental database schema and the V1 car rental product flow.",
    primaryCta: {
      label: "Open Rental",
      href: startHref,
    },
    secondaryCta: {
      label: "View Platform Flow",
      href: "#workflow",
      variant: "ghost",
    },
  },
});
