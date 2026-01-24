const jwt = require('jsonwebtoken');
const { constants } = require('../constants/constants');
const { errors } = require('../constants/error');
const { AppDataSource } = require('../repository/data-source');

const userRepo = () => AppDataSource.getRepository('User');

const checkToken = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: errors.UNAUTHORIZED });
  }
  const tokenValue = token.split(' ')[1];
  try {
    const decoded = jwt.verify(tokenValue, constants.SECRET_KEY);
    const user = await userRepo().findOne({ where: { id: decoded.id } });
    if (!user) {
      return res.status(401).json({ message: errors.NOT_FOUND_USER });
    }
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: errors.TOKEN_EXPIRED });
    }
    return res.status(401).json({ message: errors.UNAUTHORIZED });
  }
};

module.exports = { checkToken };

