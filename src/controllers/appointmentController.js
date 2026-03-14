const db = require('../config/db');

// ── GET /  →  Lista todas las citas ──────────────────────────────────────────
exports.getAllAppointments = async (req, res) => {
    try {
        const appointments = await db.getAllAppointments();
        res.render('index', { title: 'Panel de Citas', appointments });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// ── GET /create  →  Formulario de nueva cita ─────────────────────────────────
exports.getCreateForm = async (req, res) => {
    try {
        // Se pasan los dueños existentes para que puedan seleccionarse en el form
        const owners = await db.getAllOwners();
        res.render('create', { title: 'Agendar Nueva Cita', owners });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// ── POST /create  →  Crea dueño (si es nuevo), mascota y cita ────────────────
exports.createAppointment = async (req, res) => {
    const { owner_name, pet_name, species, service, appointment_date } = req.body;

    try {
        // 1. Buscar si ya existe un dueño con ese nombre
        const allOwners = await db.getAllOwners();
        let owner = allOwners.find(
            o => o.name.toLowerCase() === owner_name.toLowerCase()
        );

        // 2. Si no existe, crear el dueño
        let owner_id;
        if (owner) {
            owner_id = owner.id;
        } else {
            const result = await db.createOwner({ name: owner_name });
            owner_id = result.lastID;
        }

        // 3. Crear la mascota vinculada al dueño
        const petResult = await db.createPet({
            owner_id,
            name: pet_name,
            species: species || 'Perro',
        });

        // 4. Crear la cita vinculada a la mascota
        await db.createAppointment({
            pet_id: petResult.lastID,
            service,
            appointment_date,
        });

        res.redirect('/');
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// ── POST /delete/:id  →  Elimina una cita ────────────────────────────────────
exports.deleteAppointment = async (req, res) => {
    try {
        await db.deleteAppointment(req.params.id);
        res.redirect('/');
    } catch (err) {
        res.status(500).send(err.message);
    }
};