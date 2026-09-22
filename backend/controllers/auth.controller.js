import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { findUserByEmail } from '../models/userModel.js'; // Import helper function above

export const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    // 1. Trim input fields
    email = email?.trim();
    password = password?.trim();

    // 2. Validate non-empty inputs (Note: Login generally only requires email & password)
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Please fill in all fields" 
      });
    }

    // 3. Check if user exists in the database
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }

    // 4. Verify password hash using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }

    // 5. Generate JWT token
    const payload = { 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    };
    
    const token = jwt.sign(
      payload, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' } // Token expires in 24 hours
    );

    // 6. Return successful response with JWT token
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login Error:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};