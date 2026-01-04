import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize.js';
import User from './User.js';

const Partner = sequelize.define('Partner', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id',
    },
    allowNull: false,
  },
  partner_email: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  partner_id: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id',
    },
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'declined'),
    defaultValue: 'pending',
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'partners',
  timestamps: false,
});

Partner.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Partner.belongsTo(User, { foreignKey: 'partner_id', as: 'partner' });
User.hasOne(Partner, { foreignKey: 'user_id', as: 'partners' });

export default Partner;
