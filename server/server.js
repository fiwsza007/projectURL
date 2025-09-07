import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import database from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token ไม่ถูกต้อง' });
    }
    req.user = user;
    next();
  });
};

// Helper function to validate URL
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

// Helper function to validate short code
function isValidShortCode(shortCode) {
  const pattern = /^[a-zA-Z0-9_-]+$/;
  return pattern.test(shortCode) && shortCode.length >= 3 && shortCode.length <= 20;
}

// API Routes

// Authentication Routes
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;

  // Validate input
  if (!email || !password || !name) {
    return res.status(400).json({ 
      error: 'กรุณากรอกข้อมูลให้ครบถ้วน' 
    });
  }

  if (password.length < 6) {
    return res.status(400).json({ 
      error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' 
    });
  }

  // Check if user already exists
  if (database.getUserByEmail(email)) {
    return res.status(409).json({ 
      error: 'อีเมลนี้มีผู้ใช้แล้ว' 
    });
  }

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const newUser = database.createUser({
      email,
      name,
      password: hashedPassword
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' 
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ 
      error: 'กรุณากรอกอีเมลและรหัสผ่าน' 
    });
  }

  try {
    // Find user
    const user = database.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ 
        error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' 
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' 
    });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  try {
    const user = database.getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ 
        error: 'ไม่พบผู้ใช้' 
      });
    }

    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' 
    });
  }
});

// Create shortened URL
app.post('/api/shorten', authenticateToken, (req, res) => {
  const { originalUrl, shortCode, expiresAt } = req.body;

  // Validate original URL
  if (!originalUrl || !isValidUrl(originalUrl)) {
    return res.status(400).json({ 
      error: 'กรุณาระบุ URL ที่ถูกต้อง' 
    });
  }

  // Validate short code
  if (!shortCode || !isValidShortCode(shortCode)) {
    return res.status(400).json({ 
      error: 'รหัสย่อต้องมี 3-20 ตัวอักษร และใช้ได้เฉพาะตัวอักษร ตัวเลข - และ _' 
    });
  }

  // Check if short code already exists
  if (database.shortCodeExists(shortCode)) {
    return res.status(409).json({ 
      error: 'รหัสย่อนี้มีผู้ใช้แล้ว กรุณาเลือกรหัสอื่น' 
    });
  }

  // Validate expiration date
  if (expiresAt) {
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    if (expiryDate <= now) {
      return res.status(400).json({ 
        error: 'วันหมดอายุต้องเป็นวันในอนาคต' 
      });
    }
  }

  try {
    const newLink = database.createLink({
      userId: req.user.userId,
      originalUrl,
      shortCode,
      expiresAt: expiresAt || null
    });

    res.status(201).json({
      success: true,
      data: newLink,
      shortUrl: `${req.protocol}://${req.get('host')}/${shortCode}`
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'เกิดข้อผิดพลาดในการสร้างลิงก์' 
    });
  }
});

// Get all links
app.get('/api/links', authenticateToken, (req, res) => {
  try {
    const links = database.getAllLinks(req.user.userId);
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    const linksWithUrls = links.map(link => ({
      ...link,
      shortUrl: `${baseUrl}/${link.shortCode}`,
      isExpired: link.expiresAt ? new Date() > new Date(link.expiresAt) : false
    }));

    res.json({
      success: true,
      data: linksWithUrls
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูลลิงก์' 
    });
  }
});

// Toggle link status
app.put('/api/links/:id/toggle', authenticateToken, (req, res) => {
  try {
    const link = database.getLinkByIdAndUser(req.params.id, req.user.userId);
    
    if (!link) {
      return res.status(404).json({ 
        error: 'ไม่พบลิงก์ที่ระบุ' 
      });
    }

    const updatedLink = database.updateLink(req.params.id, req.user.userId, {
      isActive: !link.isActive
    });

    res.json({
      success: true,
      data: updatedLink
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'เกิดข้อผิดพลาดในการอัปเดตสถานะลิงก์' 
    });
  }
});

// Delete link
app.delete('/api/links/:id', authenticateToken, (req, res) => {
  try {
    const deletedLink = database.deleteLink(req.params.id, req.user.userId);
    
    if (!deletedLink) {
      return res.status(404).json({ 
        error: 'ไม่พบลิงก์ที่ระบุ' 
      });
    }

    res.json({
      success: true,
      message: 'ลบลิงก์เรียบร้อยแล้ว'
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'เกิดข้อผิดพลาดในการลบลิงก์' 
    });
  }
});

// Redirect short URL
app.get('/:shortCode', (req, res) => {
  try {
    const link = database.getLinkByShortCode(req.params.shortCode);
    
    if (!link) {
      return res.status(404).json({ 
        error: 'ไม่พบลิงก์ที่ระบุ' 
      });
    }

    if (!database.isLinkValid(link)) {
      return res.status(410).json({ 
        error: 'ลิงก์นี้หมดอายุหรือถูกปิดการใช้งานแล้ว' 
      });
    }

    // Increment click count
    database.incrementClickCount(link.id);
    
    // Redirect to original URL
    res.redirect(302, link.originalUrl);
  } catch (error) {
    res.status(500).json({ 
      error: 'เกิดข้อผิดพลาดในการเปลี่ยนเส้นทาง' 
    });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});