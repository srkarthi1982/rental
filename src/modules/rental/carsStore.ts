import type { Alpine } from "alpinejs";
import { AvBaseStore } from "@ansiversa/components/alpine";
import { actions } from "astro:actions";

type RentalCar = Record<string, any> & {
  id: string;
  name: string;
  description?: string | null;
  baseDailyRate?: number | null;
  depositAmount?: number | null;
  currencyCode?: string | null;
  availabilityStatus?: string | null;
  carDetails?: {
    plateNumber?: string | null;
    make?: string | null;
    model?: string | null;
    year?: number | null;
    color?: string | null;
    fuelType?: string | null;
    transmission?: string | null;
    seats?: number | null;
    odometerKm?: number | null;
  } | null;
};

type RentalCustomer = Record<string, any> & {
  id: string;
  fullName: string;
  phone?: string | null;
  email?: string | null;
  documentType?: string | null;
  documentNumber?: string | null;
  notes?: string | null;
  status?: string | null;
};

type RentalCarsState = {
  cars?: RentalCar[];
  customers?: RentalCustomer[];
  loadError?: string | null;
  customerLoadError?: string | null;
};

type FieldErrors = Record<string, string | null>;

type LoadCarsOptions = {
  silent?: boolean;
};

const emptyCarForm = () => ({
  name: "",
  description: "",
  baseDailyRate: "0",
  depositAmount: "0",
  currencyCode: "USD",
  plateNumber: "",
  make: "",
  model: "",
  year: "",
  color: "",
  fuelType: "",
  transmission: "",
  seats: "",
  odometerKm: "",
  insuranceExpiryDate: "",
  registrationExpiryDate: "",
});

const emptyCustomerForm = () => ({
  fullName: "",
  phone: "",
  email: "",
  documentType: "",
  documentNumber: "",
  notes: "",
});

export class RentalCarsStore extends AvBaseStore {
  activeView = "cars";
  cars: RentalCar[] = [];
  customers: RentalCustomer[] = [];
  isLoading = false;
  isLoadingCustomers = false;
  isSaving = false;
  isSavingCustomer = false;
  error: string | null = null;
  customerError: string | null = null;
  addCarForm = emptyCarForm();
  addCustomerForm = emptyCustomerForm();
  fieldErrors: FieldErrors = {};
  customerFieldErrors: FieldErrors = {};

  initializeCarsPage(serializedState?: string) {
    const state = this.parseInitialState(serializedState);
    this.cars = Array.isArray(state.cars) ? state.cars : [];
    this.customers = Array.isArray(state.customers) ? state.customers : [];
    this.error = typeof state.loadError === "string" && state.loadError.length > 0 ? state.loadError : null;
    this.customerError =
      typeof state.customerLoadError === "string" && state.customerLoadError.length > 0
        ? state.customerLoadError
        : null;
    this.activeView = "cars";
    this.isLoading = false;
    this.isLoadingCustomers = false;
    this.isSaving = false;
    this.isSavingCustomer = false;
    this.addCarForm = emptyCarForm();
    this.addCustomerForm = emptyCustomerForm();
    this.fieldErrors = {};
    this.customerFieldErrors = {};
  }

  parseInitialState(serializedState?: string): RentalCarsState {
    if (!serializedState) return {};
    try {
      return JSON.parse(serializedState) as RentalCarsState;
    } catch {
      return {};
    }
  }

  getAppDrawer() {
    return window.Alpine?.store("appDrawer") as any;
  }

  setActiveView(view: string) {
    this.activeView = view === "customers" ? "customers" : "cars";
  }

  isActiveView(view: string) {
    return this.activeView === view;
  }

  activeViewTitle() {
    return this.activeView === "customers" ? "Customers" : "Cars";
  }

  openActiveCreateDrawer() {
    if (this.activeView === "customers") {
      this.openAddCustomerDrawer();
      return;
    }
    this.openAddCarDrawer();
  }

  activeCreateLabel() {
    return this.activeView === "customers" ? "Add Customer" : "Add Car";
  }

  openAddCarDrawer() {
    this.error = null;
    this.addCarForm = emptyCarForm();
    this.clearFieldErrors();
    this.setDrawerError(null);
    this.getAppDrawer()?.open("create");
  }

  closeAddCarDrawer() {
    this.getAppDrawer()?.close();
    this.addCarForm = emptyCarForm();
    this.clearFieldErrors();
    this.setDrawerError(null);
  }

  isAddCarDrawerOpen() {
    return this.getAppDrawer()?.activeDrawer === "create";
  }

  getDrawerError() {
    return this.getAppDrawer()?.getError("create") ?? null;
  }

  setDrawerError(message: string | null) {
    const drawer = this.getAppDrawer();
    if (!drawer) return;
    if (message) {
      drawer.setError(message, "create");
    } else {
      drawer.resetError("create");
    }
  }

  openAddCustomerDrawer() {
    this.customerError = null;
    this.addCustomerForm = emptyCustomerForm();
    this.clearCustomerFieldErrors();
    this.setCustomerDrawerError(null);
    this.getAppDrawer()?.open("create-customer");
  }

  closeAddCustomerDrawer() {
    this.getAppDrawer()?.close();
    this.addCustomerForm = emptyCustomerForm();
    this.clearCustomerFieldErrors();
    this.setCustomerDrawerError(null);
  }

  isAddCustomerDrawerOpen() {
    return this.getAppDrawer()?.activeDrawer === "create-customer";
  }

  getCustomerDrawerError() {
    return this.getAppDrawer()?.getError("create-customer") ?? null;
  }

  setCustomerDrawerError(message: string | null) {
    const drawer = this.getAppDrawer();
    if (!drawer) return;
    if (message) {
      drawer.setError(message, "create-customer");
    } else {
      drawer.resetError("create-customer");
    }
  }

  async loadCars(options: LoadCarsOptions = {}) {
    if (!options.silent) {
      this.isLoading = true;
    }
    this.error = null;
    try {
      const result = await actions.listRentalCars({});
      if (result.error) {
        throw new Error(result.error.message || "Failed to load cars");
      }
      this.cars = Array.isArray(result.data) ? (result.data as RentalCar[]) : [];
    } catch (error: any) {
      this.error = this.getSafeErrorMessage(error, "Failed to load cars");
    } finally {
      if (!options.silent) {
        this.isLoading = false;
      }
    }
  }

  async loadCustomers(options: LoadCarsOptions = {}) {
    if (!options.silent) {
      this.isLoadingCustomers = true;
    }
    this.customerError = null;
    try {
      const result = await actions.listRentalCustomers({});
      if (result.error) {
        throw new Error(result.error.message || "Failed to load customers");
      }
      this.customers = Array.isArray(result.data) ? (result.data as RentalCustomer[]) : [];
    } catch (error: any) {
      this.customerError = this.getSafeErrorMessage(error, "Failed to load customers");
    } finally {
      if (!options.silent) {
        this.isLoadingCustomers = false;
      }
    }
  }

  async submitAddCar() {
    if (this.isSaving) return;

    this.setDrawerError(null);
    if (!this.validateAddCarForm()) {
      this.setDrawerError("Please fix the highlighted fields.");
      return;
    }

    this.isSaving = true;

    try {
      const result = await actions.createRentalCar({
        name: this.addCarForm.name.trim(),
        description: this.cleanString(this.addCarForm.description),
        baseDailyRate: this.toMoney(this.addCarForm.baseDailyRate),
        depositAmount: this.toMoney(this.addCarForm.depositAmount),
        currencyCode: this.normalizeCurrency(this.addCarForm.currencyCode),
        plateNumber: this.cleanString(this.addCarForm.plateNumber),
        make: this.cleanString(this.addCarForm.make),
        model: this.cleanString(this.addCarForm.model),
        year: this.toOptionalNumber(this.addCarForm.year),
        color: this.cleanString(this.addCarForm.color),
        fuelType: this.cleanString(this.addCarForm.fuelType),
        transmission: this.cleanString(this.addCarForm.transmission),
        seats: this.toOptionalNumber(this.addCarForm.seats),
        odometerKm: this.toOptionalNumber(this.addCarForm.odometerKm),
        insuranceExpiryDate: this.cleanString(this.addCarForm.insuranceExpiryDate),
        registrationExpiryDate: this.cleanString(this.addCarForm.registrationExpiryDate),
      });

      if (result.error) {
        throw new Error(result.error.message || "Failed to add car");
      }

      this.closeAddCarDrawer();
      await this.loadCars({ silent: true });
    } catch (error: any) {
      this.setDrawerError(this.getSafeErrorMessage(error, "Failed to add car"));
    } finally {
      this.isSaving = false;
    }
  }

  async submitAddCustomer() {
    if (this.isSavingCustomer) return;

    this.setCustomerDrawerError(null);
    if (!this.validateAddCustomerForm()) {
      this.setCustomerDrawerError("Please fix the highlighted fields.");
      return;
    }

    this.isSavingCustomer = true;

    try {
      const result = await actions.createRentalCustomer({
        fullName: this.addCustomerForm.fullName.trim(),
        phone: this.cleanString(this.addCustomerForm.phone),
        email: this.cleanString(this.addCustomerForm.email),
        documentType: this.cleanString(this.addCustomerForm.documentType),
        documentNumber: this.cleanString(this.addCustomerForm.documentNumber),
        notes: this.cleanString(this.addCustomerForm.notes),
      });

      if (result.error) {
        throw new Error(result.error.message || "Failed to add customer");
      }

      this.closeAddCustomerDrawer();
      await this.loadCustomers({ silent: true });
    } catch (error: any) {
      this.setCustomerDrawerError(this.getSafeErrorMessage(error, "Failed to add customer"));
    } finally {
      this.isSavingCustomer = false;
    }
  }

  validateAddCarForm() {
    const errors: FieldErrors = {};
    const requiredTextFields = [
      ["name", "Name is required."],
      ["plateNumber", "Plate number is required."],
      ["make", "Make is required."],
      ["model", "Model is required."],
    ] as const;

    for (const [field, message] of requiredTextFields) {
      if (!String(this.addCarForm[field] ?? "").trim()) {
        errors[field] = message;
      }
    }

    const dailyRate = String(this.addCarForm.baseDailyRate ?? "").trim();
    if (!dailyRate) {
      errors.baseDailyRate = "Daily rate is required.";
    } else if (!Number.isFinite(Number(dailyRate)) || Number(dailyRate) < 0) {
      errors.baseDailyRate = "Daily rate must be 0 or greater.";
    }

    const currency = String(this.addCarForm.currencyCode ?? "").trim();
    if (!currency) {
      errors.currencyCode = "Currency is required.";
    } else if (!/^[a-zA-Z]{3}$/.test(currency)) {
      errors.currencyCode = "Use a 3-letter currency code.";
    }

    this.fieldErrors = errors;
    return Object.keys(errors).length === 0;
  }

  validateAddCustomerForm() {
    const errors: FieldErrors = {};

    if (!String(this.addCustomerForm.fullName ?? "").trim()) {
      errors.fullName = "Full name is required.";
    }

    this.customerFieldErrors = errors;
    return Object.keys(errors).length === 0;
  }

  getFieldError(field: string) {
    return this.fieldErrors[field] ?? null;
  }

  clearFieldError(field: string) {
    if (!this.fieldErrors[field]) return;
    this.fieldErrors = {
      ...this.fieldErrors,
      [field]: null,
    };
    if (!Object.values(this.fieldErrors).some(Boolean)) {
      this.setDrawerError(null);
    }
  }

  clearFieldErrors() {
    this.fieldErrors = {};
  }

  getCustomerFieldError(field: string) {
    return this.customerFieldErrors[field] ?? null;
  }

  clearCustomerFieldError(field: string) {
    if (!this.customerFieldErrors[field]) return;
    this.customerFieldErrors = {
      ...this.customerFieldErrors,
      [field]: null,
    };
    if (!Object.values(this.customerFieldErrors).some(Boolean)) {
      this.setCustomerDrawerError(null);
    }
  }

  clearCustomerFieldErrors() {
    this.customerFieldErrors = {};
  }

  getSafeErrorMessage(error: any, fallback: string) {
    return typeof error?.message === "string" && error.message.trim().length > 0 ? error.message : fallback;
  }

  cleanString(value: string) {
    const trimmed = String(value ?? "").trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  normalizeCurrency(value: string) {
    const trimmed = String(value ?? "").trim().toUpperCase();
    return trimmed.length === 3 ? trimmed : "USD";
  }

  toMoney(value: string) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  }

  toOptionalNumber(value: string) {
    const trimmed = String(value ?? "").trim();
    if (!trimmed) return undefined;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
  }

  formatMoney(amount?: number | null, currencyCode?: string | null) {
    const value = Number(amount ?? 0);
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: currencyCode || "USD",
      maximumFractionDigits: 2,
    }).format(Number.isFinite(value) ? value : 0);
  }

  carSubtitle(car: RentalCar) {
    const details = car.carDetails ?? {};
    const parts = [details.make, details.model, details.year].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : "Vehicle details not added";
  }

  carMeta(car: RentalCar) {
    const details = car.carDetails ?? {};
    return [details.plateNumber || "Plate not added", details.color || "Color not added", details.transmission || "Transmission not added"].join(" · ");
  }

  customerSubtitle(customer: RentalCustomer) {
    return customer.phone || customer.email || "Contact details not added";
  }

  customerMeta(customer: RentalCustomer) {
    const document = [customer.documentType, customer.documentNumber].filter(Boolean).join(" ");
    return document || "Document details not added";
  }
}

export const registerRentalCarsStore = (Alpine: Alpine) => {
  Alpine.store("rentalCars", new RentalCarsStore());
};
