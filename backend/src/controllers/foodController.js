import { Food } from '../models/index.js';

// Get all foods (recommended and avoid)
export const getAllFoods = async (req, res) => {
  try {
    const foods = await Food.findAll();
    res.json(foods);
  } catch (error) {
    console.error('Error fetching foods:', error);
    res.status(500).json({ error: 'Failed to fetch foods' });
  }
};

// Get foods by type (recommended or avoid)
export const getFoodsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const foods = await Food.findAll({
      where: { type }
    });
    res.json(foods);
  } catch (error) {
    console.error('Error fetching foods:', error);
    res.status(500).json({ error: 'Failed to fetch foods' });
  }
};

// Get foods by category
export const getFoodsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const foods = await Food.findAll({
      where: { category }
    });
    res.json(foods);
  } catch (error) {
    console.error('Error fetching foods:', error);
    res.status(500).json({ error: 'Failed to fetch foods' });
  }
};

// Get recommended and avoid foods grouped
export const getPregnancyFoods = async (req, res) => {
  try {
    const recommended = await Food.findAll({
      where: { type: 'recommended' }
    });
    const avoid = await Food.findAll({
      where: { type: 'avoid' }
    });
    
    res.json({
      recommended,
      avoid
    });
  } catch (error) {
    console.error('Error fetching pregnancy foods:', error);
    res.status(500).json({ error: 'Failed to fetch foods' });
  }
};

// Add a new food item
export const createFood = async (req, res) => {
  try {
    const { name, emoji, category, description, type, trimester } = req.body;
    
    const food = await Food.create({
      name,
      emoji,
      category,
      description,
      type,
      trimester: trimester || 'All'
    });
    
    res.status(201).json(food);
  } catch (error) {
    console.error('Error creating food:', error);
    res.status(500).json({ error: 'Failed to create food' });
  }
};

// Update a food item
export const updateFood = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, emoji, category, description, type, trimester } = req.body;
    
    const food = await Food.findByPk(id);
    if (!food) {
      return res.status(404).json({ error: 'Food not found' });
    }
    
    await food.update({
      name,
      emoji,
      category,
      description,
      type,
      trimester
    });
    
    res.json(food);
  } catch (error) {
    console.error('Error updating food:', error);
    res.status(500).json({ error: 'Failed to update food' });
  }
};

// Delete a food item
export const deleteFood = async (req, res) => {
  try {
    const { id } = req.params;
    
    const food = await Food.findByPk(id);
    if (!food) {
      return res.status(404).json({ error: 'Food not found' });
    }
    
    await food.destroy();
    res.json({ message: 'Food deleted successfully' });
  } catch (error) {
    console.error('Error deleting food:', error);
    res.status(500).json({ error: 'Failed to delete food' });
  }
};
