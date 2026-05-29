import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import sendEmail from '../utils/sendEmail.js';

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      if (userExists.isVerified) {
        return res.status(400).json({ message: 'User already exists and is verified' });
      } else {
        // Allow re-registering / generating new OTP if not verified yet
        await User.deleteOne({ email });
      }
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

    const user = await User.create({
      name,
      email,
      password,
      isVerified: false,
      verificationCode: otp,
      verificationCodeExpires: otpExpires
    });

    if (user) {
      // Send OTP Email
      try {
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #ff004f; text-align: center;">Verify Your Email</h2>
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>Thank you for registering at AuraMart. To complete your registration, please enter the following 6-digit verification code on the website:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333; background: #f3f4f6; padding: 10px 20px; border-radius: 8px;">${otp}</span>
            </div>
            <p>This code will expire in 2 minutes.</p>
            <p>If you didn't request this, you can safely ignore this email.</p>
          </div>
        `;
        sendEmail({
          email: user.email,
          subject: 'AuraMart - Verification Code 🔐',
          html: emailHtml
        });
      } catch (err) {
        console.error("Failed to send OTP email:", err);
      }

      res.status(201).json({
        message: 'OTP sent to email. Please verify.',
        email: user.email,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Account is already verified' });
    }

    if (user.verificationCode !== otp) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    if (user.verificationCodeExpires < new Date()) {
      return res.status(400).json({ message: 'Verification code has expired. Please try registering again.' });
    }

    // OTP is valid
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    // Send Welcome Email
    try {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #ff004f; text-align: center;">Welcome to AuraMart!</h2>
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>We are thrilled to welcome you to AuraMart! Your account has been successfully verified.</p>
          <p>Get ready to explore premium quality products, exclusive deals, and a seamless shopping experience.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:5173/shop" style="background-color: #ff004f; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Start Shopping Now</a>
          </div>
          <p>If you have any questions, feel free to reply to this email. We're here to help!</p>
          <p style="margin-top: 30px; font-size: 0.9em; color: #6b7280; text-align: center;">Happy Shopping,<br>The AuraMart Team</p>
        </div>
      `;
      sendEmail({
        email: user.email,
        subject: 'Welcome to AuraMart! 🎉',
        html: emailHtml
      });
    } catch (err) {
      console.error("Failed to send welcome email:", err);
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (!user.isVerified && user.password && !user.isAdmin) {
        // If password is set, not verified, and NOT an admin, they need to verify
        // (Google users might not have a password initially, but we set one randomly. We set isVerified to true for Google)
        return res.status(403).json({ message: 'Please verify your email to log in.' });
      }

      if (user.isBanned) {
        return res.status(403).json({ message: 'Your account has been banned by the admin.' });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        avatar: user.avatar,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const googleLogin = async (req, res) => {
  const { name, email, picture } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      user = await User.create({
        name,
        email,
        password: generatedPassword,
        isAdmin: false,
        isVerified: true, // Google verifies email automatically
        avatar: picture
      });
      
      // Send Welcome Email for Google Signups
      try {
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #ff004f; text-align: center;">Welcome to AuraMart!</h2>
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>We are thrilled to welcome you to AuraMart! Your account has been successfully created using Google Sign-In.</p>
            <p>Get ready to explore premium quality products, exclusive deals, and a seamless shopping experience.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:5173/shop" style="background-color: #ff004f; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Start Shopping Now</a>
            </div>
            <p>If you have any questions, feel free to reply to this email. We're here to help!</p>
            <p style="margin-top: 30px; font-size: 0.9em; color: #6b7280; text-align: center;">Happy Shopping,<br>The AuraMart Team</p>
          </div>
        `;
        sendEmail({
          email: user.email,
          subject: 'Welcome to AuraMart! 🎉',
          html: emailHtml
        });
      } catch (err) {
        console.error("Failed to send welcome email:", err);
      }
    } else {
      // Update avatar if they login with Google again
      if (picture && user.avatar !== picture) {
        user.avatar = picture;
        await user.save();
      }
    }

    if (user.isBanned) {
      return res.status(403).json({ message: 'Your account has been banned by the admin.' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user ban status
// @route   PUT /api/users/:id/ban
// @access  Private/Admin
export const updateUserBan = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.isAdmin) {
      return res.status(400).json({ message: 'Cannot ban admin users' });
    }
    user.isBanned = req.body.isBanned;
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user wishlist
// @route   GET /api/users/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle product in wishlist
// @route   POST /api/users/wishlist/:id
// @access  Private
export const toggleWishlist = async (req, res) => {
  try {
    const productId = req.params.id;
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isLiked = user.wishlist.includes(productId);
    
    if (isLiked) {
      // Remove from wishlist
      user.wishlist = user.wishlist.filter(
        (id) => id.toString() !== productId.toString()
      );
    } else {
      // Add to wishlist
      user.wishlist.push(productId);
    }

    await user.save();
    
    // Return populated wishlist
    const updatedUser = await User.findById(req.user._id).populate('wishlist');
    res.json(updatedUser.wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
