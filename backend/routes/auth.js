const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const zodValidate = require('../middleware/zodValidate');
const { registerSchema, loginSchema, refreshSchema } = require('../validators/authValidator');
const { protect } = require('../middleware/auth');

router.post('/register', zodValidate(registerSchema), authController.register);
router.post('/login', zodValidate(loginSchema), authController.login);
router.post('/refresh', zodValidate(refreshSchema), authController.refresh);
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);

module.exports = router;