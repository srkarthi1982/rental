import { column, defineTable, sql } from "astro:db";

export const RentalBusinesses = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    ownerUserId: column.text(),
    name: column.text(),
    displayName: column.text({ optional: true }),
    phone: column.text({ optional: true }),
    email: column.text({ optional: true }),
    addressLine1: column.text({ optional: true }),
    addressLine2: column.text({ optional: true }),
    city: column.text({ optional: true }),
    countryCode: column.text({ optional: true }),
    currencyCode: column.text({ default: "USD" }),
    status: column.text({
      enum: ["active", "inactive", "archived"],
      default: "active",
    }),
    createdAt: column.date({ default: sql`CURRENT_TIMESTAMP` }),
    updatedAt: column.date({ default: sql`CURRENT_TIMESTAMP` }),
  },
});

export const RentalCategories = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    key: column.text({ unique: true }),
    name: column.text(),
    description: column.text({ optional: true }),
    status: column.text({
      enum: ["active", "inactive", "planned"],
      default: "planned",
    }),
    sortOrder: column.number({ default: 0 }),
    createdAt: column.date({ default: sql`CURRENT_TIMESTAMP` }),
    updatedAt: column.date({ default: sql`CURRENT_TIMESTAMP` }),
  },
});

export const RentalItems = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    businessId: column.text({ references: () => RentalBusinesses.columns.id }),
    categoryId: column.text({ references: () => RentalCategories.columns.id }),
    name: column.text(),
    description: column.text({ optional: true }),
    status: column.text({
      enum: ["active", "inactive", "archived"],
      default: "active",
    }),
    baseDailyRate: column.number({ default: 0 }),
    depositAmount: column.number({ default: 0 }),
    currencyCode: column.text({ default: "USD" }),
    availabilityStatus: column.text({
      enum: ["available", "reserved", "rented", "maintenance", "unavailable"],
      default: "available",
    }),
    createdAt: column.date({ default: sql`CURRENT_TIMESTAMP` }),
    updatedAt: column.date({ default: sql`CURRENT_TIMESTAMP` }),
  },
});

export const RentalCarDetails = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    rentalItemId: column.text({
      references: () => RentalItems.columns.id,
      unique: true,
    }),
    plateNumber: column.text({ optional: true }),
    make: column.text({ optional: true }),
    model: column.text({ optional: true }),
    year: column.number({ optional: true }),
    color: column.text({ optional: true }),
    fuelType: column.text({ optional: true }),
    transmission: column.text({ optional: true }),
    seats: column.number({ optional: true }),
    odometerKm: column.number({ optional: true }),
    insuranceExpiryDate: column.date({ optional: true }),
    registrationExpiryDate: column.date({ optional: true }),
    createdAt: column.date({ default: sql`CURRENT_TIMESTAMP` }),
    updatedAt: column.date({ default: sql`CURRENT_TIMESTAMP` }),
  },
});

export const RentalCustomers = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    businessId: column.text({ references: () => RentalBusinesses.columns.id }),
    fullName: column.text(),
    phone: column.text({ optional: true }),
    email: column.text({ optional: true }),
    documentType: column.text({ optional: true }),
    documentNumber: column.text({ optional: true }),
    notes: column.text({ optional: true }),
    status: column.text({
      enum: ["active", "inactive", "archived"],
      default: "active",
    }),
    createdAt: column.date({ default: sql`CURRENT_TIMESTAMP` }),
    updatedAt: column.date({ default: sql`CURRENT_TIMESTAMP` }),
  },
});

export const RentalBookings = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    businessId: column.text({ references: () => RentalBusinesses.columns.id }),
    rentalItemId: column.text({ references: () => RentalItems.columns.id }),
    customerId: column.text({ references: () => RentalCustomers.columns.id }),
    bookingNumber: column.text({ unique: true }),
    startDate: column.date(),
    endDate: column.date(),
    pickupOdometerKm: column.number({ optional: true }),
    returnOdometerKm: column.number({ optional: true }),
    dailyRate: column.number({ default: 0 }),
    depositAmount: column.number({ default: 0 }),
    totalAmount: column.number({ default: 0 }),
    paidAmount: column.number({ default: 0 }),
    status: column.text({
      enum: ["draft", "confirmed", "active", "completed", "cancelled"],
      default: "draft",
    }),
    notes: column.text({ optional: true }),
    createdAt: column.date({ default: sql`CURRENT_TIMESTAMP` }),
    updatedAt: column.date({ default: sql`CURRENT_TIMESTAMP` }),
  },
});

export const RentalServiceLogs = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    businessId: column.text({ references: () => RentalBusinesses.columns.id }),
    rentalItemId: column.text({ references: () => RentalItems.columns.id }),
    serviceDate: column.date(),
    serviceType: column.text(),
    odometerKm: column.number({ optional: true }),
    amount: column.number({ default: 0 }),
    vendorName: column.text({ optional: true }),
    notes: column.text({ optional: true }),
    createdAt: column.date({ default: sql`CURRENT_TIMESTAMP` }),
    updatedAt: column.date({ default: sql`CURRENT_TIMESTAMP` }),
  },
});

export const RentalRepairLogs = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    businessId: column.text({ references: () => RentalBusinesses.columns.id }),
    rentalItemId: column.text({ references: () => RentalItems.columns.id }),
    repairDate: column.date(),
    issueTitle: column.text(),
    issueDescription: column.text({ optional: true }),
    amount: column.number({ default: 0 }),
    vendorName: column.text({ optional: true }),
    status: column.text({
      enum: ["open", "in_progress", "resolved", "cancelled"],
      default: "open",
    }),
    notes: column.text({ optional: true }),
    createdAt: column.date({ default: sql`CURRENT_TIMESTAMP` }),
    updatedAt: column.date({ default: sql`CURRENT_TIMESTAMP` }),
  },
});

export const rentalTables = {
  RentalBusinesses,
  RentalCategories,
  RentalItems,
  RentalCarDetails,
  RentalCustomers,
  RentalBookings,
  RentalServiceLogs,
  RentalRepairLogs,
} as const;
