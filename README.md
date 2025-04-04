# InstaApp API - Express Starter

A RESTful API starter project for a social media application using Express.js, Sequelize ORM, and PostgreSQL.

## Features

* Express.js server setup with best practices
* Sequelize ORM integration with PostgreSQL
* User and Post models with relationships
* RESTful API endpoints for users and posts
* Like/unlike functionality
* Error handling middleware
* Environment variable configuration
* Docker and Docker Compose integration

## Project Structure

```
├── app.js                 # Express app setup
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose configuration
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
* PostgreSQL
* OR Docker and Docker Compose (recommended)

### Running with Docker (Recommended)

1. Make sure Docker and Docker Compose are installed on your system
2. Clone the repository
3. Start the application and database containers:

```
docker-compose up -d
```

4. Run database migrations within the container:

```
docker-compose exec api npm run db:migrate:dev
```

5. The API will be available at http://localhost:3000

### Manual Installation

1. Clone the repository
2. Install dependencies:
   

```
npm install
```

3. Configure your `.env` file with your database credentials
4. Run database migrations:
   

```
npm run db:migrate:dev
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

## Docker Commands

* Start containers: `docker-compose up -d`
* Stop containers: `docker-compose down`
* View logs: `docker-compose logs -f`
* Access container shell: `docker-compose exec api sh`
* Run migrations: `docker-compose exec api npm run db:migrate:dev`

## License

ISC
