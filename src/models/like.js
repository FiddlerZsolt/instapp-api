import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Like extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Like belongs to User
      Like.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
      });

      // Like belongs to Post
      Like.belongsTo(models.Post, {
        foreignKey: 'post_id',
        as: 'post',
      });
    }
  }
  Like.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      post_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Like',
    }
  );
  return Like;
};
