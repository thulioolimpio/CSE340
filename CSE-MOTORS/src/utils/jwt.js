const jwt = require('jsonwebtoken')

const TOKEN_NAME = process.env.JWT_COOKIE_NAME || 'jwt'
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h'

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: EXPIRES_IN })
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET)
}

module.exports = { TOKEN_NAME, signToken, verifyToken }
