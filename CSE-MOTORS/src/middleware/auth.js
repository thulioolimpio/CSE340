const { TOKEN_NAME, verifyToken } = require('../utils/jwt')

/**
 * Popula req.user se o cookie JWT existir e for válido.
 * NÃO bloqueia a rota; útil para páginas públicas.
 */
function attachUser(req, res, next) {
  try {
    const token = req.cookies?.[TOKEN_NAME]
    if (!token) return next()
    const payload = verifyToken(token)
    req.user = payload
    res.locals.user = payload // útil nas views
  } catch (e) {
    // token inválido/expirado: ignora silenciosamente
  }
  next()
}

/**
 * Exige usuário autenticado. Em falha, entrega a view de login.
 */
function requireAuth(renderLoginView = 'account/login') {
  return (req, res, next) => {
    const user = req.user
    if (!user) {
      req.flash?.('notice', 'Faça login para continuar.')
      return res.status(401).render(renderLoginView, { title: 'Login' })
    }
    next()
  }
}

/**
 * Restringe acesso a Employee/Admin para rotas de inventário.
 */
function requireEmployeeOrAdmin(renderLoginView = 'account/login') {
  return (req, res, next) => {
    const user = req.user
    if (!user || !['Employee', 'Admin'].includes(user.account_type)) {
      req.flash?.('notice', 'Acesso restrito a funcionários/administradores.')
      return res.status(403).render(renderLoginView, { title: 'Login' })
    }
    next()
  }
}

module.exports = { attachUser, requireAuth, requireEmployeeOrAdmin }
