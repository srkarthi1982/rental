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

type RentalCarsState = {
  cars?: RentalCar[];
  loadError?: string | null;
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

export class RentalCarsStore extends AvBaseStore {
  cars: RentalCar[] = [];
  isLoading = false;
  isSaving = false;
  error: string | null = null;
  addCarForm = emptyCarForm();
  fieldErrors: FieldErrors = {};

  initializeCarsPage(serializedState?: string) {
    const state = this.parseInitialState(serializedState);
    this.cars = Array.isArray(state.cars) ? state.cars : [];
    this.error = typeof state.loadError === "string" && state.loadError.length > 0 ? state.loadError : null;
    this.isLoading = false;
    this.isSaving = false;
    this.addCarForm = emptyCarForm();
    this.fieldErrors = {};
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
}

export const registerRentalCarsStore = (Alpine: Alpine) => {
  Alpine.store("rentalCars", new RentalCarsStore());
};
