require('dotenv').config();

const constants = {
    PORT: process.env.PORT || 3000,
    SECRET_KEY: process.env.SECRET_KEY,
    AUTH_EXPIRATION: '2h',
    /** Single connection string (Neon, Render, Heroku, etc.) — if set, host/user/pass are ignored */
    DATABASE_URL: process.env.DATABASE_URL,
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_USER: process.env.DB_USER,
    DB_PASS: process.env.DB_PASS,
    DB_NAME: process.env.DB_NAME,
    NODE_ENV: process.env.NODE_ENV,
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_PORT: process.env.EMAIL_PORT,
    GMAIL_USER: process.env.GMAIL_USER,
    GMAIL_PASS: process.env.GMAIL_PASS,
    URL_FRONTEND: process.env.URL_FORGOT_PASSWORD || 'http://127.0.0.1:5500/MedicalCards_frontEnd/reset-password.html',
    /** Comma-separated extra allowed browser origins (e.g. your Vercel preview URL) */
    CORS_ORIGINS: process.env.CORS_ORIGINS,

};
const config = {
    host: constants.EMAIL_HOST,
    port: constants.EMAIL_PORT,
    secure: false,
    auth: {
        user: constants.GMAIL_USER,
        pass: constants.GMAIL_PASS,
    },
}

module.exports = { constants, config };