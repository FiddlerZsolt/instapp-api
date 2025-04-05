import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Post belongs to User
      Post.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });

      // Post has many likes
      Post.hasMany(models.Like, {
        foreignKey: 'postId',
        as: 'likes',
        onDelete: 'CASCADE',
      });

      // Post has many comments
      Post.hasMany(models.Comment, {
        foreignKey: 'postId',
        as: 'comments',
        onDelete: 'CASCADE',
      });
    }
  }
  Post.init(
    {
      caption: {
        type: DataTypes.STRING,
        allowNull: false,
        length: 255,
      },
      imagePath: {
        type: DataTypes.STRING,
        allowNull: false,
        length: 255,
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: false,
        length: 255,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
      modelName: 'Post',
    }
  );
  return Post;
};
