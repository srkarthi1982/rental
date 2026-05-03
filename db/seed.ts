import { RentalCategories, db } from "astro:db";

export default async function seed() {
  await db
    .insert(RentalCategories)
    .values([
      {
        id: "rental-category-car",
        key: "car",
        name: "Car",
        description: "Car rental vertical for Rental V1.",
        status: "active",
        sortOrder: 10,
      },
      {
        id: "rental-category-home",
        key: "home",
        name: "Home",
        description: "Future home rental vertical.",
        status: "planned",
        sortOrder: 20,
      },
      {
        id: "rental-category-equipment",
        key: "equipment",
        name: "Equipment",
        description: "Future equipment rental vertical.",
        status: "planned",
        sortOrder: 30,
      },
    ])
    .onConflictDoNothing();
}
