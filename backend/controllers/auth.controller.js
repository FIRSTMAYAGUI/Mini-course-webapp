import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { findUserByEmail, createUser } from '../models/userModel.js'; // Import helper function above

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

export const register = async (req, res) => {
  try {
    let { fullname, email, password, role } = req.body;

    // 1. Trim input fields
    fullname = fullname?.trim();
    email = email?.trim();
    password = password?.trim();
    role = role?.trim().toLowerCase() || 'user'; // Default role to 'user'

    // 2. Validate non-empty inputs
    if (!fullname || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields (fullname, email, password)"
      });
    }

    // Optional: Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address"
      });
    }

    // 3. Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists"
      });
    }

    // 4. Hash the password (cost factor 10)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 5. Create new user in the database
    const newUser = await createUser(fullname, email, hashedPassword, role);

    // 6. Generate JWT token (logs user in automatically upon registration)
    const payload = {
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 7. Return success response
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: newUser.id,
        fullname: newUser.fullname,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('Registration Error:', error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};