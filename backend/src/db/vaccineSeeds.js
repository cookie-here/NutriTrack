/**
 * Vaccine Seed Data
 * Populates the database with standard vaccination schedule
 */

import sequelize from '../db/sequelize.js';
import { Vaccine } from '../models/index.js';

const vaccines = [
  {
    name: 'Tetanus Diphtheria (Td)',
    emoji: '💉',
    description: 'Protects against maternal & neonatal tetanus and diphtheria. Given during pregnancy.',
    total_doses: 2,
    recipient_type: 'mother',
  },
  {
    name: 'BCG (Bacillus Calmette Guerin)',
    emoji: '💉',
    description: 'Protects against tuberculosis. Single dose at birth.',
    total_doses: 1,
    recipient_type: 'baby',
  },
  {
    name: 'Pentavalent Vaccine (DPT, HepB, Hib)',
    emoji: '💉',
    description: 'Protects against Diphtheria, Pertussis, Tetanus, Hepatitis B, and H. influenzae B. 3 doses.',
    total_doses: 3,
    recipient_type: 'baby',
  },
  {
    name: 'OPV (Oral Polio Vaccine)',
    emoji: '💉',
    description: 'Protects against poliomyelitis. 3 doses.',
    total_doses: 3,
    recipient_type: 'baby',
  },
  {
    name: 'PCV (Pneumococcal Conjugate Vaccine)',
    emoji: '💉',
    description: 'Protects against pneumococcal diseases (meningitis, ear & chest infections). Given at 6, 10 weeks and 9 months.',
    total_doses: 3,
    recipient_type: 'baby',
  },
  {
    name: 'Rotavirus Vaccine',
    emoji: '💉',
    description: 'Protects against rotavirus diarrhea. 2 doses.',
    total_doses: 2,
    recipient_type: 'baby',
  },
  {
    name: 'fIPV (Fractional Injectible Polio Vaccine)',
    emoji: '💉',
    description: 'Protects against poliomyelitis. Fractional dose given at 14 weeks and 9 months.',
    total_doses: 2,
    recipient_type: 'baby',
  },
  {
    name: 'MR (Measles - Rubella)',
    emoji: '💉',
    description: 'Protects against measles and rubella. 2 doses.',
    total_doses: 2,
    recipient_type: 'baby',
  },
  {
    name: 'JE (Japanese Encephalitis)',
    emoji: '💉',
    description: 'Protects against Japanese encephalitis. Single dose at 12 months.',
    total_doses: 1,
    recipient_type: 'baby',
  },
  {
    name: 'Typhoid Vaccine',
    emoji: '💉',
    description: 'Protects against typhoid fever. Single dose at 15 months.',
    total_doses: 1,
    recipient_type: 'baby',
  },
  {
    name: 'HPV (Human Papillomavirus)',
    emoji: '💉',
    description: 'Protects against cervical cancer. For adolescent girls in grades 6-10.',
    total_doses: 1,
    recipient_type: 'both',
  },
  {
    name: 'Tdap (Tetanus, Diphtheria, Pertussis)',
    emoji: '💉',
    description: 'Booster for adults and adolescents. Single dose.',
    total_doses: 1,
    recipient_type: 'both',
  },
  {
    name: 'Flu Shot (Influenza)',
    emoji: '💉',
    description: 'Annual influenza vaccine. Recommended yearly.',
    total_doses: 1,
    recipient_type: 'both',
  },
  {
    name: 'Hepatitis B',
    emoji: '💉',
    description: 'Protects against hepatitis B virus. 3 doses total.',
    total_doses: 3,
    recipient_type: 'baby',
  },
];

export const seedVaccines = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established');

    // Sync database
    await sequelize.sync({ force: false, alter: false });
    console.log('Database synced');

    // Check if vaccines already exist
    const existingCount = await Vaccine.count();
    if (existingCount > 0) {
      console.log(`${existingCount} vaccines already exist in database. Skipping seed.`);
      return;
    }

    // Insert vaccines
    await Vaccine.bulkCreate(vaccines);
    console.log(`✓ Successfully seeded ${vaccines.length} vaccines`);
  } catch (error) {
    console.error('Error seeding vaccines:', error);
    throw error;
  }
};

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedVaccines().then(() => process.exit(0)).catch(() => process.exit(1));
}

export default seedVaccines;
