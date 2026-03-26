// ── Verifica que el usuario esté autenticado ──────────────────────────────────
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
};

// ── Verifica que el usuario tenga rol de veterinario ─────────────────────────
const isVeterinario = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'veterinario') {
        return next();
    }
    res.status(403).render('error', {
        title: 'Acceso Denegado',
        message: 'Solo el veterinario puede realizar esta acción.'
    });
};

module.exports = { isAuthenticated, isVeterinario };