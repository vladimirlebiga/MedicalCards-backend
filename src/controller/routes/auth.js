const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { sendEmail } = require('../../service/send-email');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
 
const { AppDataSource } = require('../../repository/data-source');
const { signUpSchema } = require('../../schema/auth-schema');
const { loginSchema } = require('../../schema/auth-schema');
const { validate } = require('../../middleware/auth-validate-middleware');
const { constants } = require('../../constants/constants');
const { errors } = require('../../constants/error');
const { checkToken } = require('../../middleware/auth-middleware')

const router = express.Router();
const userRepo = () => AppDataSource.getRepository('User');

async function hashPassword(plainPassword) {
  const saltRounds = 10; // security vs speed tradeoff
  const hashed = await bcrypt.hash(plainPassword, saltRounds);
  return hashed;
}

async function createToken(user) {
  const token = jwt.sign(user, constants.SECRET_KEY, { expiresIn: constants.AUTH_EXPIRATION });
  return token;
}

async function checkExistingUser(req, res, next) {
  try {
    const { email } = req.body;
    const type = req.route.path.includes('signup') ? 'signup' : 'signin';
    const existingUser = await userRepo().findOne({ where: { email } });
    if (!existingUser && type === 'signin') {
      return res.status(401).json({ message: errors.INVALID_CREDENTIALS });
    } else if (existingUser && type === 'signup') {
      return res.status(409).json({ message: errors.ALREADY_EXISTS + 'User'});
    }
 
    // Save user to request for next middleware/handler
    req.user = existingUser;
    next();
  } catch (err) {
    next(err); // passes to Express error handler
  }
}

//functions token reset password

function base64url(buf) {
  console.log('buf', buf);
  const base64 = buf.toString("base64");
  console.log('base64', base64);
  const result = base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  console.log('result', result);
  return result;
}

function createResetToken() {
  const raw = base64url(crypto.randomBytes(32)); // send this in email
  console.log('raw', raw);
  const hash = crypto.createHash("sha256").update(raw).digest("hex"); // store this
  console.log('hash', hash);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min
  console.log('expiresAt', expiresAt);
  return { raw, hash, expiresAt };
}

function safeEqualHex(a, b) {
  const ba = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

function verifyResetToken(rawToken, user) {
  if (!user.resetTokenHash || !user.resetTokenExpires) return false;
  if (Date.now() > new Date(user.resetTokenExpires).getTime()) return false;

  const hash = crypto.createHash("sha256").update(rawToken).digest("hex");
  return safeEqualHex(hash, user.resetTokenHash);
}

/**
 * @openapi
 * /auth/signup:
 *   post:
 *     summary: Create a new user account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               description: JWT token
 */


// POST create user
router.post('/signup', validate(signUpSchema), checkExistingUser, async (req, res, next) => {
  try {
    const hashedPassword = await hashPassword(req.body.password);
    req.body.password = hashedPassword;
    const user = userRepo().create(req.body);
    const result = await userRepo().save(user);
    delete result.password;
    const token = await createToken(result);
    res.status(201).send(token);
  } catch (err) {
    console.error('Signup error:', err);
    // Pass error to global error handler for 500 errors
    next(err);
  }
});

// POST sign In
router.post('/signin', validate(loginSchema), checkExistingUser, async (req, res, next) => {
   try {
      const isPasswordValid = await bcrypt.compare(req.body.password, req.user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: errors.INVALID_CREDENTIALS });
      }
      const token = await createToken(req.user);
      res.status(201).send(token);
    } catch (err) {
      console.error('Signin error:', err);
      // Pass error to global error handler for 500 errors
      next(err);
    }
  });

  // GET check token
  router.get('/check-token', checkToken, async (req, res, next) => {
    try {
     res.status(200).json({ message: 'Token is valid' })
  } catch(err) {
    console.error('Check token error:', err);
        next(err)
  }
});

// GET logout
router.get('/logout', checkToken, async (req, res, next) => {
try {
  res.status(200).json({ message: 'Logged out successfully' });
} catch (err) {
  console.error('Logout error:', err);
  next(err);
}
});

// PATCH change password
router.patch('/change-password', checkToken, async (req, res, next) => {
  try{
    const isPasswordValid = await bcrypt.compare(req.body.password, req.user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: errors.INVALID_CREDENTIALS });
    }
    const hashedPassword = await hashPassword(req.body.newPassword);
    req.user.password = hashedPassword;
    const result = await userRepo().save(req.user);
    const token = await createToken(result);
    res.status(200).send(token);
  }catch (err) {
    console.log('Change password error:', err);
    next(err);
  }
});

// PATCH forgot password
router.patch('/forgot-password', checkExistingUser, async (req, res, next) => {
  try {
  //  const id = uuidv4();
  //  req.user.password = hashPassword(id);

   const { raw, hash, expiresAt } = createResetToken();
   await userRepo().save({...req.user, resetTokenHash: hash, resetTokenExpires: expiresAt});
   const plainText = `Click here to reset your password: ${constants.URL_FRONTEND}`;
   const htmlText = `Click <a href="${constants.URL_FRONTEND}?token=${raw}&email=${req.user.email}">here</a> to reset your password`;
   await sendEmail(req.user.email, 'Forgot Password', plainText, htmlText);
   res.status(200).json({ message: 'Email sent successfully' })

  } catch (err) {
    console.error('Forgot password error:', err);
    next(err);
  }
});

// PATCH reset password
router.patch('/reset-password', checkExistingUser, async (req, res, next) => {
  try {
   
    const { token, newPassword } = req.body;
    if (!req.user.email) {
      return res.status(401).json({ message: errors.INVALID_CREDENTIALS });
    }
    if (!token) {
      return res.status(401).json({ message: errors.INVALID_TOKEN });
    }
    if (!newPassword) {
      return res.status(401).json({ message: errors.INVALID_PASSWORD });
    }
    if (!verifyResetToken(token, req.user)) {
      return res.status(401).json({ message: errors.INVALID_TOKEN });
    }
    const hashedPassword = await hashPassword(newPassword);
    req.user.password = hashedPassword;
    req.user.resetTokenHash = null;
    req.user.resetTokenExpires = null;
    const result = await userRepo().save(req.user);
    delete result.password;
    const newToken = await createToken(result);
    res.status(200).send(newToken);
  } catch (err) {
    console.error('Reset password error:', err);
    next(err);
  }
});


// POST signup Demo User
router.post('/signUpDemoUser', async (req, res, next) => {
  try {
    const existingUser = await userRepo().findOne({ where: { email: req.body.email }});
    if (existingUser) {
      delete existingUser.password;
      const token = await createToken(existingUser);
      res.status(200).send(token);
      return;
    }
    const hashedPassword = await hashPassword(req.body.password);
    req.body.password = hashedPassword;
    const user = userRepo().create(req.body);
    const result = await userRepo().save(user);
    delete result.password;
    const token = await createToken(result);
    res.status(201).send(token);

  } catch (err) {
    console.error('Signup error:', err);
    // Pass error to global error handler for 500 errors
    next(err);
  }
});


module.exports = router;
