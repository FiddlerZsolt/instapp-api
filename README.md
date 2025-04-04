# InstaApp API - Express Starter

A RESTful API starter project for a social media application using Express.js, Sequelize ORM, and MySQL.

## Features

* Express.js server setup with best practices
* Sequelize ORM integration with MySQL
* User and Post models with relationships
* RESTful API endpoints for users and posts
* Like/unlike functionality
* Error handling middleware
* Environment variable configuration

## Project Structure

```
├── app.js                 # Express app setup
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables
├── public/                # Static assets
└── src/
    ├── index.js           # Server entry point
    ├── config/            # Configuration files
    ├── controllers/       # Route controllers
    ├── migrations/        # Database migrations
    ├── models/            # Sequelize models
    ├── routes/            # API routes
    └── seeders/           # Database seeders
```

## Getting Started

### Prerequisites

* Node.js (v14+)
* MySQL

### Installation

1. Clone the repository
2. Install dependencies:
   

```
   npm install
   ```

3. Configure your `.env` file with your database credentials
4. Run database migrations:
   

```
   npx sequelize-cli db:migrate
   ```

5. Start the development server:
   

```
   npm run start:dev
   ```

## API Endpoints

### Users

* `GET /api/users` - Get all users
* `GET /api/users/:id` - Get user by ID
* `POST /api/users` - Create a new user
* `PUT /api/users/:id` - Update user
* `DELETE /api/users/:id` - Delete user

### Posts

* `GET /api/posts` - Get all posts
* `GET /api/posts/:id` - Get post by ID
* `POST /api/posts` - Create a new post
* `PUT /api/posts/:id` - Update post
* `DELETE /api/posts/:id` - Delete post
* `POST /api/posts/:id/like` - Like a post
* `DELETE /api/posts/:id/like` - Unlike a post

## License

ISC
