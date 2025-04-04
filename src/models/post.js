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
        foreignKey: 'user_id',
        as: 'user',
      });

      // Post has many likes
      Post.hasMany(models.Like, {
        foreignKey: 'post_id',
        as: 'likes',
        onDelete: 'CASCADE',
      });

      // Post has many comments
      Post.hasMany(models.Comment, {
        foreignKey: 'post_id',
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
      image_path: {
        type: DataTypes.STRING,
        allowNull: false,
        length: 255,
      },
      image_url: {
        type: DataTypes.STRING,
        allowNull: false,
        length: 255,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Post',
    }
  );
  return Post;
};
