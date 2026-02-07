import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize.js';

const Food = sequelize.define(
  'Food',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    emoji: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('recommended', 'avoid'),
      allowNull: false,
      defaultValue: 'recommended',
    },
    trimester: {
      type: DataTypes.ENUM('All', 'Trimester 1', 'Trimester 2', 'Trimester 3'),
      allowNull: false,
      defaultValue: 'All',
    },
  },
  {
    timestamps: true,
    tableName: 'foods',
  }
);

export default Food;
