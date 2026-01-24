const express = require('express');

const { AppDataSource } = require('../../repository/data-source');
const { constants } = require('../../constants/constants');
const { errors } = require('../../constants/error');
const { checkToken } = require('../../middleware/auth-middleware')

const router = express.Router();
const userRepo = () => AppDataSource.getRepository('User');

// GET profile
router.get('/', checkToken, async (req, res, next) => {
    try{
        res.status(200).json(req.user);

    }catch(err) {
        console.error('Get profile error:', err);
        next(err);
    }
});

module.exports = router;