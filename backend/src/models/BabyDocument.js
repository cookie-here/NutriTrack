import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize.js';
import Baby from './Baby.js';

const BabyDocument = sequelize.define('BabyDocument', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  baby_id: {
    type: DataTypes.INTEGER,
    references: { model: Baby, key: 'id' },
    allowNull: false,
  },
  category: {
    type: DataTypes.ENUM('discharge_summary', 'immunization_card', 'birth_registration', 'medical_records'),
    allowNull: false,
  },
  document_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  original_file_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  stored_file_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  file_path: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  file_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  mime_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  file_size: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  uploaded_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'baby_documents',
  timestamps: true,
});

BabyDocument.belongsTo(Baby, { foreignKey: 'baby_id', onDelete: 'CASCADE' });
Baby.hasMany(BabyDocument, { foreignKey: 'baby_id', onDelete: 'CASCADE' });

export default BabyDocument;
