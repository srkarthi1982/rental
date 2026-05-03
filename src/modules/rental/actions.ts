import { ActionError, defineAction, type ActionAPIContext } from "astro:actions";
import {
  RentalBookings,
  RentalBusinesses,
  RentalCarDetails,
  RentalCategories,
  RentalCustomers,
  RentalItems,
  RentalRepairLogs,
  RentalServiceLogs,
  and,
  asc,
  db,
  desc,
  eq,
} from "astro:db";
import { z } from "astro:schema";
import { requireUser } from "../../actions/_guards";

type AuthContext = ActionAPIContext;
type AuthUser = ReturnType<typeof requireUser>;

const generateId = (prefix: string) => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};

const optionalString = z.string().trim().optional();
const requiredString = z.string().trim().min(1);
const optionalDateString = z.string().trim().optional();
const moneyInput = z.number().min(0).default(0);
const optionalNumberInput = z.number().min(0).optional();

const parseDateInput = (value: string, fieldName: string) => {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new ActionError({ code: "BAD_REQUEST", message: `${fieldName} is invalid` });
  }

  return date;
};

const parseOptionalDateInput = (value: string | undefined, fieldName: string) => {
  return value ? parseDateInput(value, fieldName) : undefined;
};

const getBusinessDisplayName = (user: AuthUser) => {
  const identity = user.name?.trim() || user.email?.split("@")[0]?.trim();
  return identity ? `${identity} Rental Business` : "My Rental Business";
};

const getFirstRow = <T>(rows: T[]) => rows[0] ?? null;

export const getRentalBusinessForUser = async (context: AuthContext) => {
  const user = requireUser(context);

  const businesses = await db
    .select()
    .from(RentalBusinesses as any)
    .where(eq((RentalBusinesses as any).ownerUserId, user.id))
    .orderBy(asc((RentalBusinesses as any).createdAt))
    .limit(1);

  return getFirstRow(businesses);
};

export const getOrCreateRentalBusinessForUser = async (context: AuthContext) => {
  const user = requireUser(context);
  const existingBusiness = await getRentalBusinessForUser(context);

  if (existingBusiness) {
    return existingBusiness;
  }

  const now = new Date();
  const displayName = getBusinessDisplayName(user);
  const business = {
    id: generateId("rental-business"),
    ownerUserId: user.id,
    name: displayName,
    displayName,
    phone: null,
    email: user.email ?? null,
    addressLine1: null,
    addressLine2: null,
    city: null,
    countryCode: null,
    currencyCode: "USD",
    status: "active",
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(RentalBusinesses as any).values(business);

  return business;
};

export const listRentalCategories = async () => {
  return await db
    .select()
    .from(RentalCategories as any)
    .orderBy(asc((RentalCategories as any).sortOrder));
};

export const listActiveRentalCategories = async () => {
  return await db
    .select()
    .from(RentalCategories as any)
    .where(eq((RentalCategories as any).status, "active"))
    .orderBy(asc((RentalCategories as any).sortOrder));
};

const getCarCategory = async () => {
  const categories = await db
    .select()
    .from(RentalCategories as any)
    .where(eq((RentalCategories as any).key, "car"))
    .limit(1);

  const category = getFirstRow(categories);
  if (!category) {
    throw new ActionError({ code: "PRECONDITION_FAILED", message: "Car rental category is not available" });
  }

  return category;
};

const requireOwnedRentalItem = async (context: AuthContext, rentalItemId: string) => {
  const business = await getOrCreateRentalBusinessForUser(context);
  const items = await db
    .select()
    .from(RentalItems as any)
    .where(and(eq((RentalItems as any).id, rentalItemId), eq((RentalItems as any).businessId, business.id)))
    .limit(1);

  const item = getFirstRow(items);
  if (!item) {
    throw new ActionError({ code: "NOT_FOUND", message: "Rental item not found" });
  }

  return { business, item };
};

const requireOwnedCustomer = async (context: AuthContext, customerId: string) => {
  const business = await getOrCreateRentalBusinessForUser(context);
  const customers = await db
    .select()
    .from(RentalCustomers as any)
    .where(and(eq((RentalCustomers as any).id, customerId), eq((RentalCustomers as any).businessId, business.id)))
    .limit(1);

  const customer = getFirstRow(customers);
  if (!customer) {
    throw new ActionError({ code: "NOT_FOUND", message: "Rental customer not found" });
  }

  return { business, customer };
};

const carInputSchema = z.object({
  name: requiredString,
  description: optionalString,
  baseDailyRate: moneyInput,
  depositAmount: moneyInput,
  currencyCode: z.string().trim().min(3).max(3).default("USD"),
  plateNumber: optionalString,
  make: optionalString,
  model: optionalString,
  year: optionalNumberInput,
  color: optionalString,
  fuelType: optionalString,
  transmission: optionalString,
  seats: optionalNumberInput,
  odometerKm: optionalNumberInput,
  insuranceExpiryDate: optionalDateString,
  registrationExpiryDate: optionalDateString,
});

const customerInputSchema = z.object({
  fullName: requiredString,
  phone: optionalString,
  email: optionalString,
  documentType: optionalString,
  documentNumber: optionalString,
  notes: optionalString,
});

const bookingInputSchema = z.object({
  rentalItemId: requiredString,
  customerId: requiredString,
  startDate: requiredString,
  endDate: requiredString,
  pickupOdometerKm: optionalNumberInput,
  dailyRate: moneyInput,
  depositAmount: moneyInput,
  totalAmount: moneyInput,
  paidAmount: moneyInput,
  status: z.enum(["draft", "confirmed", "active", "completed", "cancelled"]).default("draft"),
  notes: optionalString,
});

const serviceLogInputSchema = z.object({
  rentalItemId: requiredString,
  serviceDate: requiredString,
  serviceType: requiredString,
  odometerKm: optionalNumberInput,
  amount: moneyInput,
  vendorName: optionalString,
  notes: optionalString,
});

const repairLogInputSchema = z.object({
  rentalItemId: requiredString,
  repairDate: requiredString,
  issueTitle: requiredString,
  issueDescription: optionalString,
  amount: moneyInput,
  vendorName: optionalString,
  status: z.enum(["open", "in_progress", "resolved", "cancelled"]).default("open"),
  notes: optionalString,
});

const optionalRentalItemFilterSchema = z
  .object({
    rentalItemId: optionalString,
  })
  .optional();

export const createRentalCar = async (input: z.infer<typeof carInputSchema>, context: AuthContext) => {
  const business = await getOrCreateRentalBusinessForUser(context);
  const carCategory = await getCarCategory();
  const now = new Date();
  const rentalItemId = generateId("rental-item");
  const carDetailId = generateId("rental-car");

  const rentalItem = {
    id: rentalItemId,
    businessId: business.id,
    categoryId: carCategory.id,
    name: input.name,
    description: input.description ?? null,
    status: "active",
    baseDailyRate: input.baseDailyRate,
    depositAmount: input.depositAmount,
    currencyCode: input.currencyCode.toUpperCase(),
    availabilityStatus: "available",
    createdAt: now,
    updatedAt: now,
  };

  const carDetails = {
    id: carDetailId,
    rentalItemId,
    plateNumber: input.plateNumber ?? null,
    make: input.make ?? null,
    model: input.model ?? null,
    year: input.year ?? null,
    color: input.color ?? null,
    fuelType: input.fuelType ?? null,
    transmission: input.transmission ?? null,
    seats: input.seats ?? null,
    odometerKm: input.odometerKm ?? null,
    insuranceExpiryDate: parseOptionalDateInput(input.insuranceExpiryDate, "Insurance expiry date") ?? null,
    registrationExpiryDate: parseOptionalDateInput(input.registrationExpiryDate, "Registration expiry date") ?? null,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(RentalItems as any).values(rentalItem);
  await db.insert(RentalCarDetails as any).values(carDetails);

  return { rentalItem, carDetails };
};

export const listRentalCars = async (context: AuthContext) => {
  const business = await getOrCreateRentalBusinessForUser(context);
  const carCategory = await getCarCategory();
  const items = await db
    .select()
    .from(RentalItems as any)
    .where(and(eq((RentalItems as any).businessId, business.id), eq((RentalItems as any).categoryId, carCategory.id)))
    .orderBy(desc((RentalItems as any).createdAt));

  if (items.length === 0) {
    return [];
  }

  const detailEntries = await Promise.all(
    items.map(async (item) => {
      const details = await db
        .select()
        .from(RentalCarDetails as any)
        .where(eq((RentalCarDetails as any).rentalItemId, item.id))
        .limit(1);

      return [item.id, getFirstRow(details)] as const;
    }),
  );
  const detailByItemId = new Map(detailEntries);

  return items.map((item) => ({
    ...item,
    carDetails: detailByItemId.get(item.id) ?? null,
  }));
};

export const getRentalCarById = async (id: string, context: AuthContext) => {
  const { item } = await requireOwnedRentalItem(context, id);
  const carCategory = await getCarCategory();

  if (item.categoryId !== carCategory.id) {
    throw new ActionError({ code: "NOT_FOUND", message: "Rental car not found" });
  }

  const details = await db
    .select()
    .from(RentalCarDetails as any)
    .where(eq((RentalCarDetails as any).rentalItemId, item.id))
    .limit(1);

  return {
    ...item,
    carDetails: getFirstRow(details),
  };
};

export const createRentalCustomer = async (input: z.infer<typeof customerInputSchema>, context: AuthContext) => {
  const business = await getOrCreateRentalBusinessForUser(context);
  const now = new Date();
  const customer = {
    id: generateId("rental-customer"),
    businessId: business.id,
    fullName: input.fullName,
    phone: input.phone ?? null,
    email: input.email ?? null,
    documentType: input.documentType ?? null,
    documentNumber: input.documentNumber ?? null,
    notes: input.notes ?? null,
    status: "active",
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(RentalCustomers as any).values(customer);

  return customer;
};

export const listRentalCustomers = async (context: AuthContext) => {
  const business = await getOrCreateRentalBusinessForUser(context);
  return await db
    .select()
    .from(RentalCustomers as any)
    .where(eq((RentalCustomers as any).businessId, business.id))
    .orderBy(asc((RentalCustomers as any).fullName));
};

export const getRentalCustomerById = async (id: string, context: AuthContext) => {
  const { customer } = await requireOwnedCustomer(context, id);
  return customer;
};

const generateBookingNumber = () => {
  const datePart = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const randomPart = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `RNT-${datePart}-${randomPart}`;
};

export const createRentalBooking = async (input: z.infer<typeof bookingInputSchema>, context: AuthContext) => {
  const { business, item } = await requireOwnedRentalItem(context, input.rentalItemId);
  const { customer } = await requireOwnedCustomer(context, input.customerId);

  if (customer.businessId !== business.id || item.businessId !== business.id) {
    throw new ActionError({ code: "FORBIDDEN", message: "Booking records must belong to the same business" });
  }

  const startDate = parseDateInput(input.startDate, "Start date");
  const endDate = parseDateInput(input.endDate, "End date");
  if (endDate.getTime() < startDate.getTime()) {
    throw new ActionError({ code: "BAD_REQUEST", message: "End date must be on or after start date" });
  }

  if (input.paidAmount > input.totalAmount) {
    throw new ActionError({ code: "BAD_REQUEST", message: "Paid amount cannot exceed total amount" });
  }

  const now = new Date();
  const booking = {
    id: generateId("rental-booking"),
    businessId: business.id,
    rentalItemId: item.id,
    customerId: customer.id,
    bookingNumber: generateBookingNumber(),
    startDate,
    endDate,
    pickupOdometerKm: input.pickupOdometerKm ?? null,
    returnOdometerKm: null,
    dailyRate: input.dailyRate,
    depositAmount: input.depositAmount,
    totalAmount: input.totalAmount,
    paidAmount: input.paidAmount,
    status: input.status,
    notes: input.notes ?? null,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(RentalBookings as any).values(booking);

  return booking;
};

export const listRentalBookings = async (context: AuthContext) => {
  const business = await getOrCreateRentalBusinessForUser(context);
  return await db
    .select()
    .from(RentalBookings as any)
    .where(eq((RentalBookings as any).businessId, business.id))
    .orderBy(desc((RentalBookings as any).createdAt));
};

export const getRentalBookingById = async (id: string, context: AuthContext) => {
  const business = await getOrCreateRentalBusinessForUser(context);
  const bookings = await db
    .select()
    .from(RentalBookings as any)
    .where(and(eq((RentalBookings as any).id, id), eq((RentalBookings as any).businessId, business.id)))
    .limit(1);

  const booking = getFirstRow(bookings);
  if (!booking) {
    throw new ActionError({ code: "NOT_FOUND", message: "Rental booking not found" });
  }

  return booking;
};

export const createRentalServiceLog = async (
  input: z.infer<typeof serviceLogInputSchema>,
  context: AuthContext,
) => {
  const { business, item } = await requireOwnedRentalItem(context, input.rentalItemId);
  const now = new Date();
  const serviceLog = {
    id: generateId("rental-service"),
    businessId: business.id,
    rentalItemId: item.id,
    serviceDate: parseDateInput(input.serviceDate, "Service date"),
    serviceType: input.serviceType,
    odometerKm: input.odometerKm ?? null,
    amount: input.amount,
    vendorName: input.vendorName ?? null,
    notes: input.notes ?? null,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(RentalServiceLogs as any).values(serviceLog);

  return serviceLog;
};

export const listRentalServiceLogs = async (context: AuthContext, rentalItemId?: string) => {
  const business = await getOrCreateRentalBusinessForUser(context);

  if (rentalItemId) {
    await requireOwnedRentalItem(context, rentalItemId);
  }

  return await db
    .select()
    .from(RentalServiceLogs as any)
    .where(
      rentalItemId
        ? and(
            eq((RentalServiceLogs as any).businessId, business.id),
            eq((RentalServiceLogs as any).rentalItemId, rentalItemId),
          )
        : eq((RentalServiceLogs as any).businessId, business.id),
    )
    .orderBy(desc((RentalServiceLogs as any).serviceDate));
};

export const createRentalRepairLog = async (
  input: z.infer<typeof repairLogInputSchema>,
  context: AuthContext,
) => {
  const { business, item } = await requireOwnedRentalItem(context, input.rentalItemId);
  const now = new Date();
  const repairLog = {
    id: generateId("rental-repair"),
    businessId: business.id,
    rentalItemId: item.id,
    repairDate: parseDateInput(input.repairDate, "Repair date"),
    issueTitle: input.issueTitle,
    issueDescription: input.issueDescription ?? null,
    amount: input.amount,
    vendorName: input.vendorName ?? null,
    status: input.status,
    notes: input.notes ?? null,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(RentalRepairLogs as any).values(repairLog);

  return repairLog;
};

export const listRentalRepairLogs = async (context: AuthContext, rentalItemId?: string) => {
  const business = await getOrCreateRentalBusinessForUser(context);

  if (rentalItemId) {
    await requireOwnedRentalItem(context, rentalItemId);
  }

  return await db
    .select()
    .from(RentalRepairLogs as any)
    .where(
      rentalItemId
        ? and(
            eq((RentalRepairLogs as any).businessId, business.id),
            eq((RentalRepairLogs as any).rentalItemId, rentalItemId),
          )
        : eq((RentalRepairLogs as any).businessId, business.id),
    )
    .orderBy(desc((RentalRepairLogs as any).repairDate));
};

export const rentalActions = {
  getOrCreateRentalBusinessForUser: defineAction({
    input: z.any().optional(),
    handler: async (_, context) => getOrCreateRentalBusinessForUser(context),
  }),
  getRentalBusinessForUser: defineAction({
    input: z.any().optional(),
    handler: async (_, context) => getRentalBusinessForUser(context),
  }),
  listRentalCategories: defineAction({
    input: z.any().optional(),
    handler: async (_, context) => {
      requireUser(context);
      return listRentalCategories();
    },
  }),
  listActiveRentalCategories: defineAction({
    input: z.any().optional(),
    handler: async (_, context) => {
      requireUser(context);
      return listActiveRentalCategories();
    },
  }),
  createRentalCar: defineAction({
    input: carInputSchema,
    handler: async (input, context) => createRentalCar(input, context),
  }),
  listRentalCars: defineAction({
    input: z.any().optional(),
    handler: async (_, context) => listRentalCars(context),
  }),
  getRentalCarById: defineAction({
    input: z.object({ id: requiredString }),
    handler: async (input, context) => getRentalCarById(input.id, context),
  }),
  createRentalCustomer: defineAction({
    input: customerInputSchema,
    handler: async (input, context) => createRentalCustomer(input, context),
  }),
  listRentalCustomers: defineAction({
    input: z.any().optional(),
    handler: async (_, context) => listRentalCustomers(context),
  }),
  getRentalCustomerById: defineAction({
    input: z.object({ id: requiredString }),
    handler: async (input, context) => getRentalCustomerById(input.id, context),
  }),
  createRentalBooking: defineAction({
    input: bookingInputSchema,
    handler: async (input, context) => createRentalBooking(input, context),
  }),
  listRentalBookings: defineAction({
    input: z.any().optional(),
    handler: async (_, context) => listRentalBookings(context),
  }),
  getRentalBookingById: defineAction({
    input: z.object({ id: requiredString }),
    handler: async (input, context) => getRentalBookingById(input.id, context),
  }),
  createRentalServiceLog: defineAction({
    input: serviceLogInputSchema,
    handler: async (input, context) => createRentalServiceLog(input, context),
  }),
  listRentalServiceLogs: defineAction({
    input: optionalRentalItemFilterSchema,
    handler: async (input, context) => listRentalServiceLogs(context, input?.rentalItemId),
  }),
  createRentalRepairLog: defineAction({
    input: repairLogInputSchema,
    handler: async (input, context) => createRentalRepairLog(input, context),
  }),
  listRentalRepairLogs: defineAction({
    input: optionalRentalItemFilterSchema,
    handler: async (input, context) => listRentalRepairLogs(context, input?.rentalItemId),
  }),
};
