import type { Meal } from "@/lib/types";

/** Form inputs the demo simulation will select. */
export const DEMO_MOODS = ["Comfort food", "Quick & easy"];
export const DEMO_CUISINES = ["Italian"];
export const DEMO_TIME = "30 min";
export const DEMO_EFFORT = "Couch mode";
export const DEMO_FRIDGE = "chicken, cherry tomatoes, leftover rice";

/** Mock meal results returned instead of hitting the real API. */
export const DEMO_MEALS: Meal[] = [
  {
    name: "Creamy Garlic Chicken Pasta",
    description:
      "A rich, restaurant-worthy bowl that comes together with pantry staples in under 30 minutes.",
    cookTime: "25 min",
    effort: "Low effort",
    cuisine: "Italian",
    why: "Hits that comfort food craving hard — creamy sauce, garlic, your leftover chicken, done.",
    ingredients: "heavy cream, parmesan, garlic, dried pasta",
    bestMatch: true,
  },
  {
    name: "Cherry Tomato Bruschetta Chicken",
    description:
      "Pan-seared chicken topped with a jammy burst-tomato and basil situation.",
    cookTime: "28 min",
    effort: "Low effort",
    cuisine: "Italian",
    why: "Quick, light-ish, and makes those cherry tomatoes the hero they deserve to be.",
    ingredients: "basil, balsamic glaze, olive oil, crusty bread",
    bestMatch: false,
  },
  {
    name: "One-Pan Chicken & Rice",
    description:
      "Golden chicken thighs nestled into herby rice — one pan, no fuss.",
    cookTime: "30 min",
    effort: "Low effort",
    cuisine: "Mediterranean",
    why: "Uses your leftover rice as a base for something that feels way more special than it is to make.",
    ingredients: "chicken stock, lemon, garlic, dried oregano",
    bestMatch: false,
  },
];
