import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // User has many posts
      User.hasMany(models.Post, {
        foreignKey: 'userId',
        as: 'posts',
        onDelete: 'CASCADE',
      });

      // User has many likes
      User.hasMany(models.Like, {
        foreignKey: 'userId',
        as: 'likes',
        onDelete: 'CASCADE',
      });

      // User has many comments
      User.hasMany(models.Comment, {
        foreignKey: 'userId',
        as: 'comments',
        onDelete: 'CASCADE',
      });

      // User has many devices
      User.hasMany(models.Device, {
        foreignKey: 'userId',
        as: 'devices',
        onDelete: 'CASCADE',
      });
    }
  }
  User.init(
    {
      // firstName: DataTypes.STRING,
      // lastName: DataTypes.STRING,
      // email: DataTypes.STRING,
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        length: 50,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        length: 50,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        length: 255,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        length: 255,
      },
      profileImage: {
        type: DataTypes.STRING,
        allowNull: false,
        length: 255,
      },
      bio: {
        type: DataTypes.STRING,
        length: 255,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: 'User',
    }
  );
  return User;
};
