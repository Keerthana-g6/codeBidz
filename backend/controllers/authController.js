const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const logger = require('../utils/logger');

const generateAccessToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '15m' });
const generateRefreshToken = (id) => jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh', { expiresIn: '7d' });

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (await userRepository.findByEmail(email)) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    const user = await userRepository.create({
      name, email, password,
      role: role === 'admin' ? 'admin' : 'bidder',
      credits: 0,
    });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    await userRepository.updateById(user._id, { refreshToken });
    logger.info({ userId: user._id, role: user.role }, 'User registered');
    res.status(201).json({ user, accessToken, token: accessToken, refreshToken });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await userRepository.findByEmail(email);
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (!user.isActive) return res.status(403).json({ message: 'Account deactivated' });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    await userRepository.updateById(user._id, { refreshToken });

    logger.info({ userId: user._id }, 'User logged in');
    res.json({ user, accessToken, token: accessToken, refreshToken });
  } catch (err) { next(err); }
};

exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh');
    const user = await userRepository.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const accessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);
    await userRepository.updateById(user._id, { refreshToken: newRefreshToken });

    res.json({ accessToken, token: accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

exports.logout = async (req, res, next) => {
  try {
    await userRepository.updateById(req.user._id, { refreshToken: null });
    logger.info({ userId: req.user._id }, 'User logged out');
    res.json({ message: 'Logged out successfully' });
  } catch (err) { next(err); }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await userRepository.findById(req.user._id);
    res.json(user);
  } catch (err) { next(err); }
};