import { User, EmergencyContact, Partner } from '../models/index.js';

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
    const { full_name, due_date, user_type, baby_date_of_birth } = req.body;

    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ detail: 'User not found' });
    }

    await user.update({
      full_name: full_name || user.full_name,
      due_date: due_date || user.due_date,
      user_type: user_type || user.user_type,
      baby_date_of_birth: baby_date_of_birth || user.baby_date_of_birth,
      updated_at: new Date(),
    });

    return res.json({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
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
