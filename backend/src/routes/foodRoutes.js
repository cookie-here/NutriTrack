import express from 'express';
import {
  getAllFoods,
  getFoodsByType,
  getFoodsByCategory,
  getPregnancyFoods,
  createFood,
  updateFood,
  deleteFood
} from '../controllers/foodController.js';

const router = express.Router();

// Public routes
router.get('/all', getAllFoods);
router.get('/type/:type', getFoodsByType);
router.get('/category/:category', getFoodsByCategory);
router.get('/pregnancy', getPregnancyFoods);

// Admin routes (optional - add auth later if needed)
router.post('/create', createFood);
router.put('/update/:id', updateFood);
router.delete('/delete/:id', deleteFood);

export default router;
