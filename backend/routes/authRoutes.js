
const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  verifyEmail,
  sendVerificationEmail,
  verifyPhoneNumber,
  sendPhoneVerification
} = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/verify-email', verifyEmail);
router.post('/send-verification', sendVerificationEmail);
router.post('/verify-phone', verifyPhoneNumber);
router.post('/send-phone-verification', sendPhoneVerification);

module.exports = router;
