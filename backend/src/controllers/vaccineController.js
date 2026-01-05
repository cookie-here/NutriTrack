import { Vaccine, Reminder } from '../models/index.js';

/**
 * Get all vaccines from database
 */
export const getAllVaccines = async (req, res, next) => {
  try {
    const vaccines = await Vaccine.findAll({
      order: [['name', 'ASC']],
    });

    return res.json(vaccines);
  } catch (error) {
    console.error(`Error fetching vaccines: ${error.message}`);
    return res.status(500).json({ detail: 'Error fetching vaccines' });
  }
};

/**
 * Get vaccine by ID
 */
export const getVaccineById = async (req, res, next) => {
  try {
    const { vaccineId } = req.params;

    const vaccine = await Vaccine.findByPk(vaccineId);

    if (!vaccine) {
      return res.status(404).json({ detail: 'Vaccine not found' });
    }

    return res.json(vaccine);
  } catch (error) {
    console.error(`Error fetching vaccine: ${error.message}`);
    return res.status(500).json({ detail: 'Error fetching vaccine' });
  }
};

/**
 * Get all vaccine reminders for the current user
 */
export const getUserVaccineReminders = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const reminders = await Reminder.findAll({
      where: { user_id: userId, type: 'vaccine' },
      order: [['reminder_date', 'ASC']],
    });

    return res.json(reminders);
  } catch (error) {
    console.error(`Error fetching vaccine reminders: ${error.message}`);
    return res.status(500).json({ detail: 'Error fetching vaccine reminders' });
  }
};

/**
 * Create a vaccine reminder for the current user
 */
export const createVaccineReminder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      vaccine_name,
      reminder_date,
      dose_number,
      total_doses,
      recipient,
      age_due_months,
      description,
      vaccine_icon,
    } = req.body;

    const newReminder = await Reminder.create({
      user_id: userId,
      type: 'vaccine',
      title: vaccine_name,
      vaccine_name,
      reminder_date,
      dose_number,
      total_doses,
      recipient,
      age_due_months,
      description,
      vaccine_icon,
      status: 'pending',
    });

    return res.status(201).json(newReminder);
  } catch (error) {
    console.error(`Error creating vaccine reminder: ${error.message}`);
    return res.status(500).json({ detail: 'Error creating vaccine reminder' });
  }
};

/**
 * Update vaccine reminder status
 */
export const updateVaccineReminderStatus = async (req, res, next) => {
  try {
    const { reminderId } = req.params;
    const userId = req.user.id;
    const { status, last_dose_date } = req.body;

    const reminder = await Reminder.findOne({
      where: { id: reminderId, user_id: userId, type: 'vaccine' },
    });

    if (!reminder) {
      return res.status(404).json({ detail: 'Vaccine reminder not found' });
    }

    await reminder.update({
      status: status || 'completed',
      last_dose_date: last_dose_date || new Date(),
    });

    return res.json(reminder);
  } catch (error) {
    console.error(`Error updating vaccine reminder: ${error.message}`);
    return res.status(500).json({ detail: 'Error updating vaccine reminder' });
  }
};

/**
 * Delete vaccine reminder
 */
export const deleteVaccineReminder = async (req, res, next) => {
  try {
    const { reminderId } = req.params;
    const userId = req.user.id;

    const reminder = await Reminder.findOne({
      where: { id: reminderId, user_id: userId, type: 'vaccine' },
    });

    if (!reminder) {
      return res.status(404).json({ detail: 'Vaccine reminder not found' });
    }

    await reminder.destroy();

    return res.status(204).send();
  } catch (error) {
    console.error(`Error deleting vaccine reminder: ${error.message}`);
    return res.status(500).json({ detail: 'Error deleting vaccine reminder' });
  }
};
