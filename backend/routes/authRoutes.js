
const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getCurrentUser, 
  verifyEmail,
  sendVerificationEmail,
  loginWithGoogle,
  verifyPhoneNumber,
  sendPhoneVerification
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getCurrentUser);
router.post('/verify-email', verifyEmail);
router.post('/send-verification', sendVerificationEmail);
router.post('/google-login', loginWithGoogle);
router.post('/verify-phone', verifyPhoneNumber);
router.post('/send-phone-verification', sendPhoneVerification);

module.exports = router;
