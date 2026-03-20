const db = require('../config/db');

const getAll = () => db.getAllAppointments();

const getById = (id) => db.getAppointmentById(id);

const create = ({ pet_id, service, appointment_date, weight, temperature, diagnosis }) =>
    db.createAppointment({ pet_id, service, appointment_date, weight, temperature, diagnosis });

const updateStatus = (id, status) =>
    db.updateAppointmentStatus(id, status);

const remove = (id) => db.deleteAppointment(id);

module.exports = { getAll, getById, create, updateStatus, remove };