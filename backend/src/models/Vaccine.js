import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize.js';

const Vaccine = sequelize.define('Vaccine', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  emoji: {
    type: DataTypes.STRING(10),
    defaultValue: '💉',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  total_doses: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  recipient_type: {
    type: DataTypes.ENUM('baby', 'mother', 'both'),
    defaultValue: 'both',
  },
}, {
  tableName: 'vaccines',
  timestamps: false,
});

export default Vaccine;
