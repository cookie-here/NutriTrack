import express from 'express';
import multer from 'multer';
import {
  getUserProfile,
  updateUserProfile,
  saveEmergencyContact,
  getEmergencyContact,
  deleteEmergencyContact,
  sendPartnerInvite,
  getPartnerInvitations,
  acceptPartnerInvitation,
  declinePartnerInvitation,
  uploadProfileImage,
  getProfileStatistics,
} from '../controllers/profileController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, and WebP images are allowed'), false);
    }
  },
});

/**
 * GET /profile
 * Get user profile with related data
 */
router.get('/', authenticateToken, getUserProfile);

/**
 * PUT /profile
 * Update user profile
 */
router.put('/', authenticateToken, updateUserProfile);

/**
 * POST /profile/emergency-contact
 * Save or update emergency contact
 */
router.post('/emergency-contact', authenticateToken, saveEmergencyContact);

/**
 * GET /profile/emergency-contact
 * Get emergency contact
 */
router.get('/emergency-contact', authenticateToken, getEmergencyContact);

/**
 * DELETE /profile/emergency-contact
 * Delete emergency contact
 */
router.delete('/emergency-contact', authenticateToken, deleteEmergencyContact);

/**
 * POST /profile/partner-invite
 * Send partner sync invite
 */
router.post('/partner-invite', authenticateToken, sendPartnerInvite);

/**
 * GET /profile/partner-invitations
 * Get partner invitations
 */
router.get('/partner-invitations', authenticateToken, getPartnerInvitations);

/**
 * PATCH /profile/partner-invitations/:invitationId/accept
 * Accept partner invitation
 */
router.patch('/partner-invitations/:invitationId/accept', authenticateToken, acceptPartnerInvitation);

/**
 * PATCH /profile/partner-invitations/:invitationId/decline
 * Decline partner invitation
 */
router.patch('/partner-invitations/:invitationId/decline', authenticateToken, declinePartnerInvitation);

/**
 * POST /profile/image
 * Upload profile image
 */
router.post('/image', authenticateToken, upload.single('image'), uploadProfileImage);

/**
 * GET /profile/statistics
 * Get profile statistics
 */
router.get('/statistics', authenticateToken, getProfileStatistics);

export default router;
