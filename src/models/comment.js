import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Comment belongs to User
      Comment.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
      });

      // Comment belongs to Post
      Comment.belongsTo(models.Post, {
        foreignKey: 'post_id',
        as: 'post',
      });
    }
  }
  Comment.init(
    {
      comment: {
        type: DataTypes.STRING,
        allowNull: false,
      },
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
      modelName: 'Comment',
    }
  );
  return Comment;
};
