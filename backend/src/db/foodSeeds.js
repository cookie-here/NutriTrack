import { Food } from '../models/index.js';

const foodSeeds = [
  // Recommended Foods
  {
    name: "Leafy Greens",
    emoji: "🥬",
    category: "Vegetables",
    description: "Rich in folate - essential for baby's development",
    type: "recommended",
    trimester: "All"
  },
  {
    name: "Salmon",
    emoji: "🐟",
    category: "Protein",
    description: "Omega-3 fatty acids for baby's brain development",
    type: "recommended",
    trimester: "All"
  },
  {
    name: "Greek Yogurt",
    emoji: "🥛",
    category: "Dairy",
    description: "Calcium for bones and teeth",
    type: "recommended",
    trimester: "All"
  },
  {
    name: "Eggs",
    emoji: "🥚",
    category: "Protein",
    description: "Complete protein with choline for brain development",
    type: "recommended",
    trimester: "All"
  },
  {
    name: "Sweet Potatoes",
    emoji: "🍠",
    category: "Vegetables",
    description: "Vitamin A and fiber for healthy digestion",
    type: "recommended",
    trimester: "All"
  },
  {
    name: "Berries",
    emoji: "🫐",
    category: "Fruits",
    description: "Antioxidants and vitamin C",
    type: "recommended",
    trimester: "All"
  },
  {
    name: "Almonds",
    emoji: "🌰",
    category: "Nuts",
    description: "Folate, fiber, and protein",
    type: "recommended",
    trimester: "All"
  },
  {
    name: "Lentils",
    emoji: "🫘",
    category: "Legumes",
    description: "Iron and plant-based protein",
    type: "recommended",
    trimester: "All"
  },
  {
    name: "Whole Grain Bread",
    emoji: "🍞",
    category: "Grains",
    description: "Fiber and B vitamins for energy",
    type: "recommended",
    trimester: "All"
  },
  {
    name: "Carrots",
    emoji: "🥕",
    category: "Vegetables",
    description: "Beta-carotene for fetal growth",
    type: "recommended",
    trimester: "All"
  },
  {
    name: "Avocado",
    emoji: "🥑",
    category: "Fruits",
    description: "Healthy fats and folate for baby's development",
    type: "recommended",
    trimester: "All"
  },
  {
    name: "Broccoli",
    emoji: "🥦",
    category: "Vegetables",
    description: "Vitamin C and calcium for immune system",
    type: "recommended",
    trimester: "All"
  },
  {
    name: "Chicken Breast",
    emoji: "🍗",
    category: "Protein",
    description: "Lean protein for muscle development",
    type: "recommended",
    trimester: "All"
  },
  {
    name: "Milk",
    emoji: "🥛",
    category: "Dairy",
    description: "Calcium and vitamin D for bones",
    type: "recommended",
    trimester: "All"
  },
  {
    name: "Spinach",
    emoji: "🍃",
    category: "Vegetables",
    description: "Iron and folate for blood production",
    type: "recommended",
    trimester: "All"
  },
  {
    name: "Cheese",
    emoji: "🧀",
    category: "Dairy",
    description: "Protein and calcium (pasteurized only)",
    type: "recommended",
    trimester: "All"
  },
  {
    name: "Beans",
    emoji: "🫘",
    category: "Legumes",
    description: "Fiber and iron for digestive health",
    type: "recommended",
    trimester: "All"
  },
  {
    name: "Papaya",
    emoji: "🧡",
    category: "Fruits",
    description: "Vitamin A and digestive enzymes",
    type: "recommended",
    trimester: "All"
  },
  {
    name: "Pumpkin",
    emoji: "🎃",
    category: "Vegetables",
    description: "Beta-carotene and potassium",
    type: "recommended",
    trimester: "All"
  },
  {
    name: "Oats",
    emoji: "🌾",
    category: "Grains",
    description: "Fiber and energy for sustained nutrition",
    type: "recommended",
    trimester: "All"
  },
  // Foods to Avoid
  {
    name: "Raw Fish",
    emoji: "🍣",
    category: "Risk",
    description: "Risk of harmful bacteria like Listeria",
    type: "avoid",
    trimester: "All"
  },
  {
    name: "Unpasteurized Dairy",
    emoji: "🥛",
    category: "Risk",
    description: "Can contain Listeria bacteria",
    type: "avoid",
    trimester: "All"
  },
  {
    name: "High Mercury Fish",
    emoji: "🐟",
    category: "Risk",
    description: "Shark, swordfish, and king mackerel",
    type: "avoid",
    trimester: "All"
  },
  {
    name: "Raw Meat",
    emoji: "🥩",
    category: "Risk",
    description: "Risk of toxoplasmosis and other infections",
    type: "avoid",
    trimester: "All"
  },
  {
    name: "Caffeine (Excess)",
    emoji: "☕",
    category: "Risk",
    description: "Limit to less than 200mg daily",
    type: "avoid",
    trimester: "All"
  },
  {
    name: "Unwashed Vegetables",
    emoji: "🥒",
    category: "Risk",
    description: "Wash all produce thoroughly",
    type: "avoid",
    trimester: "All"
  },
  {
    name: "Alcohol",
    emoji: "🍷",
    category: "Risk",
    description: "Can cause fetal alcohol syndrome and birth defects",
    type: "avoid",
    trimester: "All"
  },
  {
    name: "Processed Deli Meat",
    emoji: "🌭",
    category: "Risk",
    description: "Risk of Listeria - reheat until steaming hot",
    type: "avoid",
    trimester: "All"
  },
  {
    name: "Soft Cheeses",
    emoji: "🧀",
    category: "Risk",
    description: "Brie, feta, Mexican cheeses may contain Listeria",
    type: "avoid",
    trimester: "All"
  },
  {
    name: "Raw Eggs",
    emoji: "🥚",
    category: "Risk",
    description: "Risk of Salmonella infection",
    type: "avoid",
    trimester: "All"
  },
  {
    name: "Liver",
    emoji: "🫀",
    category: "Risk",
    description: "Very high in vitamin A which can harm the fetus",
    type: "avoid",
    trimester: "All"
  },
  {
    name: "Pâté",
    emoji: "🍖",
    category: "Risk",
    description: "Contains Listeria - avoid all types",
    type: "avoid",
    trimester: "All"
  },
  {
    name: "Sprouts",
    emoji: "🌱",
    category: "Risk",
    description: "Raw sprouts can carry Salmonella",
    type: "avoid",
    trimester: "All"
  },
  {
    name: "Shark & Marlin",
    emoji: "🦈",
    category: "Risk",
    description: "High mercury levels - limit seafood consumption",
    type: "avoid",
    trimester: "All"
  }
];

const seedFoods = async () => {
  try {
    const existingCount = await Food.count();
    
    if (existingCount === 0) {
      await Food.bulkCreate(foodSeeds);
      console.log('✅ Food items seeded successfully');
    } else {
      console.log(`⏭️ Food items already seeded (${existingCount} items exist)`);
    }
  } catch (error) {
    console.error('❌ Error seeding food items:', error);
  }
};

export default seedFoods;
