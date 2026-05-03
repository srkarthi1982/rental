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

  initializeCarsPage(serializedState?: string) {
    const state = this.parseInitialState(serializedState);
    this.cars = Array.isArray(state.cars) ? state.cars : [];
    this.error = typeof state.loadError === "string" && state.loadError.length > 0 ? state.loadError : null;
    this.isLoading = false;
    this.isSaving = false;
    this.addCarForm = emptyCarForm();
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
    this.getAppDrawer()?.open("create");
  }

  closeAddCarDrawer() {
    this.getAppDrawer()?.close();
    this.addCarForm = emptyCarForm();
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

  async loadCars() {
    this.isLoading = true;
    this.error = null;
    try {
      const result = await actions.listRentalCars({});
      if (result.error) {
        throw new Error(result.error.message || "Failed to load cars");
      }
      this.cars = Array.isArray(result.data) ? (result.data as RentalCar[]) : [];
    } catch (error: any) {
      this.error = error?.message || "Failed to load cars";
    } finally {
      this.isLoading = false;
    }
  }

  async submitAddCar() {
    const name = this.addCarForm.name.trim();
    if (!name) {
      this.setDrawerError("Car name is required.");
      return;
    }

    this.isSaving = true;
    this.setDrawerError(null);

    try {
      const result = await actions.createRentalCar({
        name,
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
      await this.loadCars();
    } catch (error: any) {
      this.setDrawerError(error?.message || "Failed to add car");
    } finally {
      this.isSaving = false;
    }
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
    return parts.length > 0 ? parts.join(" ") : "Car details pending";
  }

  carMeta(car: RentalCar) {
    const details = car.carDetails ?? {};
    return [details.plateNumber, details.color, details.transmission].filter(Boolean).join(" · ") || "No extra details";
  }
}

export const registerRentalCarsStore = (Alpine: Alpine) => {
  Alpine.store("rentalCars", new RentalCarsStore());
};
