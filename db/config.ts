import { defineDb } from "astro:db";
import { rentalTables } from "./tables";

export default defineDb({
  tables: rentalTables,
});
