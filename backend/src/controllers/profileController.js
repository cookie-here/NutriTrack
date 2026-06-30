import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { User, Baby, BabyDocument, DevelopmentMilestone, EmergencyContact, Partner } from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get user profile with related data
 */
export const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await User.findOne({
      where: { id: userId },
      include: [
        {
          model: EmergencyContact,
          required: false,
        },
        {
          model: Partner,
          as: 'partners',
          required: false,
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ detail: 'User not found' });
    }

    return res.json({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone_number: user.phone_number || null,
      profile_image: user.profile_image || null,
      due_date: user.due_date,
      user_type: user.user_type,
      baby_date_of_birth: user.baby_date_of_birth,
      created_at: user.created_at,
      updated_at: user.updated_at,
      emergency_contact: user.EmergencyContact || null,
      partner: user.partners || null,
    });
  } catch (error) {
    console.error(`Error fetching user profile: ${error.message}`);
    return res.status(500).json({
      detail: 'Error fetching user profile',
    });
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { full_name, phone_number, email, due_date, user_type, baby_date_of_birth } = req.body;

    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ detail: 'User not found' });
    }

    const updateData = { updated_at: new Date() };
    if (full_name !== undefined) updateData.full_name = full_name;
    if (phone_number !== undefined) updateData.phone_number = phone_number;
    if (due_date !== undefined) updateData.due_date = due_date;
    if (user_type !== undefined) updateData.user_type = user_type;
    if (baby_date_of_birth !== undefined) updateData.baby_date_of_birth = baby_date_of_birth;

    await user.update(updateData);

    return res.json({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone_number: user.phone_number,
      profile_image: user.profile_image,
      due_date: user.due_date,
      user_type: user.user_type,
      baby_date_of_birth: user.baby_date_of_birth,
      created_at: user.created_at,
      updated_at: user.updated_at,
    });
  } catch (error) {
    console.error(`Error updating user profile: ${error.message}`);
    return res.status(500).json({
      detail: 'Error updating user profile',
    });
  }
};

/**
 * Add or update emergency contact
 */
export const saveEmergencyContact = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, phone, relationship } = req.body;

    if (!name || !phone || !relationship) {
      return res.status(400).json({
        detail: 'Name, phone, and relationship are required',
      });
    }

    let emergencyContact = await EmergencyContact.findOne({
      where: { user_id: userId },
    });

    if (emergencyContact) {
      await emergencyContact.update({
        name,
        phone,
        relationship,
        updated_at: new Date(),
      });
    } else {
      emergencyContact = await EmergencyContact.create({
        user_id: userId,
        name,
        phone,
        relationship,
      });
    }

    return res.json(emergencyContact);
  } catch (error) {
    console.error(`Error saving emergency contact: ${error.message}`);
    return res.status(500).json({
      detail: 'Error saving emergency contact',
    });
  }
};

/**
 * Get emergency contact
 */
export const getEmergencyContact = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const emergencyContact = await EmergencyContact.findOne({
      where: { user_id: userId },
    });

    if (!emergencyContact) {
      return res.status(404).json({ detail: 'No emergency contact found' });
    }

    return res.json(emergencyContact);
  } catch (error) {
    console.error(`Error fetching emergency contact: ${error.message}`);
    return res.status(500).json({
      detail: 'Error fetching emergency contact',
    });
  }
};

/**
 * Delete emergency contact
 */
export const deleteEmergencyContact = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const emergencyContact = await EmergencyContact.findOne({
      where: { user_id: userId },
    });

    if (!emergencyContact) {
      return res.status(404).json({ detail: 'No emergency contact found' });
    }

    await emergencyContact.destroy();

    return res.json({ msg: 'Emergency contact deleted' });
  } catch (error) {
    console.error(`Error deleting emergency contact: ${error.message}`);
    return res.status(500).json({
      detail: 'Error deleting emergency contact',
    });
  }
};

/**
 * Send partner sync invite
 */
export const sendPartnerInvite = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { partner_email } = req.body;

    if (!partner_email) {
      return res.status(400).json({
        detail: 'Partner email is required',
      });
    }

    if (partner_email === req.user.email) {
      return res.status(400).json({
        detail: 'Cannot sync with your own email',
      });
    }

    // Check if partner exists
    const partner = await User.findOne({ where: { email: partner_email } });

    // Create pending partner invitation
    const partnerInvite = await Partner.create({
      user_id: userId,
      partner_email,
      partner_id: partner?.id || null,
      status: 'pending',
    });

    return res.status(201).json({
      id: partnerInvite.id,
      partner_email: partnerInvite.partner_email,
      status: partnerInvite.status,
      created_at: partnerInvite.created_at,
    });
  } catch (error) {
    console.error(`Error sending partner invite: ${error.message}`);
    return res.status(500).json({
      detail: 'Error sending partner invite',
    });
  }
};

/**
 * Upload profile image
 */
export const uploadProfileImage = async (req, res, next) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ detail: 'No image file provided' });
    }

    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowed.includes(req.file.mimetype)) {
      return res.status(400).json({ detail: 'Only JPG, PNG, and WebP images are allowed' });
    }

    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ detail: 'Image must be less than 5 MB' });
    }

    const uploadDir = path.resolve(__dirname, '../../uploads/profiles');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    const storedName = `profile_${userId}_${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, storedName);
    const relativePath = path.join('uploads/profiles', storedName);

    fs.writeFileSync(filePath, req.file.buffer);

    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ detail: 'User not found' });
    }

    await user.update({ profile_image: relativePath, updated_at: new Date() });

    return res.json({ profile_image: relativePath });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    return res.status(500).json({ detail: 'Error uploading profile image' });
  }
};

/**
 * Get profile statistics
 */
export const getProfileStatistics = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const babies = await Baby.findAll({ where: { user_id: userId } });
    const babyIds = babies.map(b => b.id);

    let totalDocuments = 0;
    let totalVaccinations = 0;
    let totalGrowthEntries = 0;

    if (babyIds.length > 0) {
      totalDocuments = await BabyDocument.count({ where: { baby_id: babyIds } });
      totalGrowthEntries = await DevelopmentMilestone.count({ where: { baby_id: babyIds } });
      totalVaccinations = await DevelopmentMilestone.count({ where: { baby_id: babyIds, completed: true } });
    }

    return res.json({
      registered_babies: babies.length,
      medical_documents: totalDocuments,
      vaccinations_completed: totalVaccinations,
      growth_entries: totalGrowthEntries,
    });
  } catch (error) {
    console.error('Error fetching profile statistics:', error);
    return res.status(500).json({ detail: 'Error fetching statistics' });
  }
};

/**
 * Get partner invitations
 */
export const getPartnerInvitations = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const invitation = await Partner.findOne({
      where: { user_id: userId },
    });

    if (!invitation) {
      return res.status(404).json({ detail: 'No partner invitation found' });
    }

    return res.json(invitation);
  } catch (error) {
    console.error(`Error fetching partner invitations: ${error.message}`);
    return res.status(500).json({
      detail: 'Error fetching partner invitations',
    });
  }
};

/**
 * Accept partner invitation
 */
export const acceptPartnerInvitation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { invitationId } = req.params;

    const invitation = await Partner.findOne({
      where: { id: invitationId },
    });

    if (!invitation) {
      return res.status(404).json({ detail: 'Invitation not found' });
    }

    // Update the invitation status
    await invitation.update({
      partner_id: userId,
      status: 'accepted',
      updated_at: new Date(),
    });

    return res.json({
      id: invitation.id,
      status: invitation.status,
      updated_at: invitation.updated_at,
    });
  } catch (error) {
    console.error(`Error accepting partner invitation: ${error.message}`);
    return res.status(500).json({
      detail: 'Error accepting partner invitation',
    });
  }
};

/**
 * Decline partner invitation
 */
export const declinePartnerInvitation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { invitationId } = req.params;

    const invitation = await Partner.findOne({
      where: { id: invitationId },
    });

    if (!invitation) {
      return res.status(404).json({ detail: 'Invitation not found' });
    }

    await invitation.update({
      status: 'declined',
      updated_at: new Date(),
    });

    return res.json({
      id: invitation.id,
      status: invitation.status,
      updated_at: invitation.updated_at,
    });
  } catch (error) {
    console.error(`Error declining partner invitation: ${error.message}`);
    return res.status(500).json({
      detail: 'Error declining partner invitation',
    });
  }
};
