const db = require('../config/db');

// ── GET /login  →  Formulario de login ───────────────────────────────────────
exports.getLoginForm = (req, res) => {
    // Si ya hay sesión activa, redirigir al panel
    if (req.session.user) {
        return res.redirect('/');
    }
    res.render('login', { title: 'Iniciar Sesión', error: null });
};

// ── POST /login  →  Validar credenciales ─────────────────────────────────────
exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await db.getUserByUsername(username);

        // Verificar que el usuario existe y la contraseña coincide
        if (!user || user.password !== password) {
            return res.status(401).render('login', {
                title: 'Iniciar Sesión',
                error: 'Usuario o contraseña incorrectos.'
            });
        }

        // Guardar usuario en sesión (sin la contraseña)
        req.session.user = {
            id:       user.id,
            username: user.username,
            role:     user.role
        };

        res.redirect('/');
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// ── POST /logout  →  Cerrar sesión ───────────────────────────────────────────
exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
};