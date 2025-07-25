// src/data/myRecipesData.js (Example structure)

const my100Recipes = [{
  "category": "Bowl",
  "title": "Mediterranean Chickpea & Quinoa Bowl",
  "description": "A vibrant and healthy plant-based bowl featuring fluffy quinoa, seasoned roasted chickpeas, fresh vegetables, and a creamy tahini dressing.",
  "yields": "2 servings",
  "prep_time": "15 minutes",
  "cook_time": "20-25 minutes",
  "ingredients": [
    {
      "section": "For the Quinoa",
      "items": [
        "1/2 cup uncooked quinoa, rinsed",
        "1 cup water or vegetable broth",
        "Pinch of salt"
      ]
    },
    {
      "section": "For the Roasted Chickpeas",
      "items": [
        "1 (15-ounce) can chickpeas, drained, rinsed, and patted very dry",
        "1 tbsp extra virgin olive oil",
        "1 tsp smoked paprika",
        "1/2 tsp ground cumin",
        "1/4 tsp garlic powder",
        "1/4 tsp salt",
        "Pinch of cayenne pepper (optional, for heat)"
      ]
    },
    {
      "section": "For the Fresh Veggies & Toppings",
      "items": [
        "1 cup chopped romaine lettuce or baby spinach (for the base)",
        "1/2 English cucumber, diced",
        "1 cup cherry tomatoes, halved",
        "1/4 red onion, thinly sliced",
        "1/4 cup pitted Kalamata olives, halved",
        "1/4 cup crumbled feta cheese (omit for vegan)",
        "1/2 avocado, sliced or diced",
        "Fresh parsley or mint, chopped, for garnish"
      ]
    },
    {
      "section": "For the Tahini Dressing",
      "items": [
        "2 tbsp tahini",
        "1 tbsp fresh lemon juice",
        "1-2 tbsp warm water (to reach desired consistency)",
        "1/2 clove garlic, minced (or 1/4 tsp garlic powder)",
        "Pinch of salt",
        "Pinch of black pepper"
      ]
    }
  ],
  "equipment": [
    "Small saucepan (for quinoa)",
    "Baking sheet (for chickpeas)",
    "Large mixing bowl",
    "Small bowl (for dressing)"
  ],
  "instructions": [
    "Step 1: **Cook the Quinoa.** Combine rinsed quinoa, water/broth, and a pinch of salt in a small saucepan. Bring to a boil, then reduce heat to low, cover, and simmer for 15 minutes, or until all liquid is absorbed. Remove from heat and let stand, covered, for 5 minutes. Fluff with a fork.",
    "Step 2: **Roast the Chickpeas.** Preheat oven to 400°F (200°C). In a medium bowl, toss the drained and dried chickpeas with olive oil, smoked paprika, cumin, garlic powder, salt, and cayenne (if using) until well coated. Spread them in a single layer on a baking sheet. Roast for 20-25 minutes, stirring halfway through, until crispy.",
    "Step 3: **Prepare the Dressing.** While the quinoa and chickpeas cook, whisk together tahini, lemon juice, minced garlic (or garlic powder), salt, and pepper in a small bowl. Gradually add warm water, one tablespoon at a time, whisking until you reach a smooth, creamy, and pourable consistency.",
    "Step 4: **Assemble the Bowls.** Divide the chopped lettuce or spinach among two bowls. Top each with cooked quinoa, roasted chickpeas, diced cucumber, halved cherry tomatoes, sliced red onion, and Kalamata olives. Arrange avocado slices on top.",
    "Step 5: **Finish and Serve.** Drizzle generously with the tahini dressing. Sprinkle with crumbled feta cheese (if using) and fresh chopped parsley or mint. Serve immediately."
  ],
  "tips_and_variations": [
    "**Add Protein:** For a non-vegetarian option, add grilled chicken, salmon, or grilled halloumi.",
    "**Other Grains:** Swap quinoa for brown rice, farro, or couscous.",
    "**More Veggies:** Feel free to add roasted bell peppers, zucchini, or steamed broccoli.",
    "**Different Sauces:** Instead of tahini dressing, try a dollop of hummus, tzatziki, or a simple lemon-herb vinaigrette.",
    "**Meal Prep:** Cook the quinoa and roast the chickpeas ahead of time. Store all components separately in airtight containers in the refrigerator for up to 3-4 days. Assemble the bowls just before serving to maintain freshness."
  ],
  "tags": ["Mediterranean", "Bowl", "Vegetarian", "Healthy", "Lunch", "Dinner", "Chickpeas", "Quinoa", "Easy"]
}
]
module.exports = my100Recipes; // Use CommonJS export for Node.js scripts