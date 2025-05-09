
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Generate random token/code
const generateRandomToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Generate numeric code (for SMS)
const generateNumericCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit code
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phoneNumber } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Generate verification token
  const emailVerificationToken = crypto.randomBytes(32).toString('hex');

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    phoneNumber,
    emailVerificationToken,
    emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  });

  if (user) {
    // Generate token
    const token = generateToken(user._id);
    
    // Return user data and token
    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber || null,
        isEmailVerified: false,
        isPhoneVerified: false
      },
      token,
      message: 'Registration successful! Please verify your email.'
    });

    // Send verification email (this would be async in a real app)
    // await sendVerificationEmail(user.email, emailVerificationToken);
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Verify email with token
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;
  
  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() }
  });
  
  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired verification token');
  }
  
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  
  await user.save();
  
  res.status(200).json({
    message: 'Email verified successfully!'
  });
});

// @desc    Send email verification
// @route   POST /api/auth/send-verification
// @access  Public
exports.sendVerificationEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  const user = await User.findOne({ email });
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  if (user.isEmailVerified) {
    res.status(400);
    throw new Error('Email already verified');
  }
  
  // Generate new token
  const emailVerificationToken = generateRandomToken();
  user.emailVerificationToken = emailVerificationToken;
  user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  await user.save();
  
  // In a real app, you'd send an email here
  // await sendVerificationEmail(user.email, emailVerificationToken);
  
  res.status(200).json({
    message: 'Verification email sent!'
  });
});

// @desc    Send phone verification code
// @route   POST /api/auth/send-phone-verification
// @access  Private/Public
exports.sendPhoneVerification = asyncHandler(async (req, res) => {
  const { phoneNumber, userId } = req.body;
  
  let user;
  
  if (userId) {
    user = await User.findById(userId);
  } else if (phoneNumber) {
    user = await User.findOne({ phoneNumber });
  } else {
    res.status(400);
    throw new Error('Phone number or user ID required');
  }
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  // Generate 6-digit code
  const verificationCode = generateNumericCode();
  
  // Save code to user
  user.phoneVerificationCode = verificationCode;
  user.phoneVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  if (phoneNumber && !user.phoneNumber) {
    user.phoneNumber = phoneNumber;
  }
  
  await user.save();
  
  // In a real app, you'd send an SMS here
  // await sendSMS(user.phoneNumber, `Your verification code is: ${verificationCode}`);
  
  // For demo/testing purposes, return the code in the response
  res.status(200).json({
    message: 'Verification code sent!',
    code: verificationCode // In production, you would NOT include this
  });
});

// @desc    Verify phone number
// @route   POST /api/auth/verify-phone
// @access  Public
exports.verifyPhoneNumber = asyncHandler(async (req, res) => {
  const { phoneNumber, code, userId } = req.body;
  
  let user;
  
  if (userId) {
    user = await User.findById(userId);
  } else if (phoneNumber) {
    user = await User.findOne({ phoneNumber });
  } else {
    res.status(400);
    throw new Error('Phone number or user ID required');
  }
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  if (user.phoneVerificationCode !== code || 
      user.phoneVerificationExpires < Date.now()) {
    res.status(400);
    throw new Error('Invalid or expired verification code');
  }
  
  user.isPhoneVerified = true;
  user.phoneVerificationCode = undefined;
  user.phoneVerificationExpires = undefined;
  
  await user.save();
  
  res.status(200).json({
    message: 'Phone number verified successfully!',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: true
    }
  });
});

// @desc    Login with Google
// @route   POST /api/auth/google-login
// @access  Public
exports.loginWithGoogle = asyncHandler(async (req, res) => {
  const { tokenId } = req.body;
  
  // Verify Google token
  const ticket = await googleClient.verifyIdToken({
    idToken: tokenId,
    audience: process.env.GOOGLE_CLIENT_ID
  });
  
  const { email_verified, name, email, picture } = ticket.getPayload();
  
  if (!email_verified) {
    res.status(400);
    throw new Error('Google email not verified');
  }
  
  // Find or create user
  let user = await User.findOne({ email });
  
  if (!user) {
    // Create new user
    user = await User.create({
      name,
      email,
      googleId: ticket.getUserId(),
      avatar: picture,
      isEmailVerified: true // Google already verified the email
    });
  } else {
    // Update existing user with Google info
    user.googleId = ticket.getUserId();
    user.avatar = picture;
    user.isEmailVerified = true;
    await user.save();
  }
  
  // Generate token
  const token = generateToken(user._id);
  
  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber || null,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified
    },
    token
  });
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email });

  // Check user and password match
  if (user && (await user.matchPassword(password))) {
    // Generate token
    const token = generateToken(user._id);
    
    // Return user data and token
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber || null,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified
      },
      token
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  
  if (user) {
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber || null,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});
