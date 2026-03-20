const AppointmentModel = require('../models/appointmentModel');
const OwnerModel = require('../models/ownerModel');
const PetModel = require('../models/petModel');

// Servicios que requieren constantes vitales obligatorias
const MEDICAL_SERVICES = ['Consulta General', 'Vacunación', 'Desparasitación', 'Cirugía'];

// ── GET /  →  Lista todas las citas ──────────────────────────────────────────
exports.getAllAppointments = async (req, res) => {
    try {
        const appointments = await AppointmentModel.getAll();
        res.render('index', { title: 'Panel de Citas', appointments });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// ── GET /create  →  Formulario de nueva cita ─────────────────────────────────
exports.getCreateForm = async (req, res) => {
    try {
        const owners = await OwnerModel.getAll();
        res.render('create', {
            title: 'Agendar Nueva Cita',
            owners,
            medicalServices: MEDICAL_SERVICES
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// ── POST /create  →  Crea dueño, mascota y cita ───────────────────────────────
exports.createAppointment = async (req, res) => {
    const {
        owner_name, pet_name, species,
        service, appointment_date,
        weight, temperature, diagnosis
    } = req.body;

    try {
        // 1. Buscar o crear el dueño
        const allOwners = await OwnerModel.getAll();
        let owner = allOwners.find(
            o => o.name.toLowerCase() === owner_name.toLowerCase()
        );

        let owner_id;
        if (owner) {
            owner_id = owner.id;
        } else {
            const result = await OwnerModel.create({ name: owner_name });
            owner_id = result.lastID;
        }

        // 2. Crear la mascota vinculada al dueño
        const petResult = await PetModel.create({
            owner_id,
            name: pet_name,
            species: species || 'Perro',
        });

        // 3. Validar vitales si es servicio médico
        const isMedical = MEDICAL_SERVICES.includes(service);
        if (isMedical && (!weight || !temperature || !diagnosis)) {
            const owners = await OwnerModel.getAll();
            return res.status(400).render('create', {
                title: 'Agendar Nueva Cita',
                owners,
                medicalServices: MEDICAL_SERVICES,
                error: 'Para consultas médicas, Peso, Temperatura y Diagnóstico son obligatorios.'
            });
        }

        // 4. Crear la cita
        await AppointmentModel.create({
            pet_id: petResult.lastID,
            service,
            appointment_date,
            weight: isMedical ? weight : null,
            temperature: isMedical ? temperature : null,
            diagnosis: isMedical ? diagnosis : null,
        });

        res.redirect('/');
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// ── POST /delete/:id  →  Elimina una cita ────────────────────────────────────
exports.deleteAppointment = async (req, res) => {
    try {
        await AppointmentModel.remove(req.params.id);
        res.redirect('/');
    } catch (err) {
        res.status(500).send(err.message);
    }
};