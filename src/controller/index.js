const express = require('express');
const router = express.Router();
const authRoutes = require('./routes/auth');
const medicalCardRoutes = require('./routes/medical-cards');
const userRoutes = require('./routes/user');

router.use('/auth', authRoutes);
router.use('/medical-cards', medicalCardRoutes);
router.use('/users', userRoutes);

module.exports = router;