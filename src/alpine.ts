import type { Alpine } from "alpinejs";
import { registerAppDrawerStore } from "./modules/app/drawerStore";
import { registerRentalCarsStore } from "./modules/rental/carsStore";

export default function initAlpine(Alpine: Alpine) {
  registerAppDrawerStore(Alpine);
  registerRentalCarsStore(Alpine);

  if (typeof window !== "undefined") {
    window.Alpine = Alpine;
  }
}
