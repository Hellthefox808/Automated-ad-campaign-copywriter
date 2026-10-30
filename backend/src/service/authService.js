import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { ROLES } from '../config/constants.js'

const JWT_SECRET = process.env.JWT_SECRET || 'adcraft-enterprise-secret-key-2026'

export class AuthService {
  static generateToken (user) {
    return jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )
  }

  static verifyToken (token) {
    try {
      return jwt.verify(token, JWT_SECRET)
    } catch {
      return null
    }
  }

  static verifyPassword (plain, hash) {
    return bcrypt.compareSync(plain, hash)
  }

  static hashPassword (plain) {
    return bcrypt.hashSync(plain, 10)
  }

  /**
   * Express middleware: extracts Bearer token or falls back to demo persona header if provided.
   */
  static authenticate (req, res, next) {
    // Check for demo role override header (allows live role switching in frontend demo mode)
    const demoRole = req.headers['x-demo-role']
    if (demoRole && Object.values(ROLES).includes(demoRole)) {
      req.user = {
        id: `usr_demo_${demoRole}`,
        username: `demo_${demoRole}`,
        email: `${demoRole}@adcraft.ai`,
        role: demoRole
      }
      return next()
    }

    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Default to guest copywriter role for seamless local developer testing
      req.user = {
        id: 'usr_guest_copywriter',
        username: 'guest_copywriter',
        email: 'guest@adcraft.ai',
        role: ROLES.COPYWRITER
      }
      return next()
    }

    const token = authHeader.split(' ')[1]
    const decoded = AuthService.verifyToken(token)

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired bearer token' })
    }

    req.user = decoded
    next()
  }

  /**
   * RBAC authorization guard middleware.
   */
  static requireRole (allowedRoles = []) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' })
      }

      if (req.user.role === ROLES.ADMIN) {
        return next() // Admin has omnipotent access
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          error: `Forbidden: role '${req.user.role}' lacks permission for this action. Required: [${allowedRoles.join(', ')}]`
        })
      }

      next()
    }
  }
}

