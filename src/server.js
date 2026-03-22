const express = require('express');
const cors = require('cors');
const { errors } = require('./constants/error');
const { constants } = require('./constants/constants');
const { AppDataSource } = require('./repository/data-source');
const swaggerOptions = require('./swagger/swagger');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const app = express();
const port = constants.PORT;

app.use(express.json());

// Origin header = scheme + host + port only (no path). Live Server often uses 5500.
const defaultAllowedOrigins = [
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  'http://127.0.0.1:5501',
  'http://localhost:5501',
  'https://vladimirlebiga.github.io',
];
const extraOrigins = (constants.CORS_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const allowedOrigins = [...new Set([...defaultAllowedOrigins, ...extraOrigins])];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      console.warn('[CORS] Blocked origin:', origin);
      return callback(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use('/api', require('./controller'));

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler caught:', err);
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Validation Error',
      message: err.message 
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ 
      error: errors.UNAUTHORIZED 
    });
  }
  
  // Handle database connection errors
  if (err.name === 'QueryFailedError' || err.name === 'ConnectionError') {
    return res.status(500).json({ 
      error: errors.INTERNAL_SERVER_ERROR,
      message: 'Database operation failed'
    });
  }
  
  // Default to 500 internal server error for unhandled errors
  res.status(500).json({ 
    error: errors.INTERNAL_SERVER_ERROR,
    message: constants.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Optional: raw JSON
app.get('/api/docs.json', (_req, res) => res.json(swaggerSpec));

// Handle 404 for undefined routes
app.use((req, res) => {
  res.status(404).json({ 
    error: errors.NOT_FOUND,
    message: 'Route not found' 
  });
});



// Boot the DB, then the server
AppDataSource.initialize()
  .then(() => {
    console.log('✅ Connected to PostgreSQL via TypeORM');

    app.listen(port, () =>
      console.log(`Server running at http://localhost:${port}`)
    );
  })
  .catch((err) => {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  });
