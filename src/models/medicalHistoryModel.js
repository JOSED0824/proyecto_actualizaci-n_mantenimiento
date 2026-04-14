const db = require('../config/db');

const getHistoryByPet = (pet_id) =>
    db.all(`
        SELECT
            a.id, a.service, a.appointment_date, a.status,
            a.weight, a.temperature, a.diagnosis, a.created_at,
            p.id   AS pet_id,   p.name AS pet_name,  p.species, p.breed, p.birthdate,
            o.id   AS owner_id, o.name AS owner_name, o.phone AS owner_phone
        FROM Appointments a
        JOIN Pets   p ON a.pet_id   = p.id
        JOIN Owners o ON p.owner_id = o.id
        WHERE a.pet_id = ?
        ORDER BY a.appointment_date ASC
    `, [pet_id]);

const getAllPetsWithHistory = () =>
    db.all(`
        SELECT
            p.id, p.name, p.species, p.breed,
            o.name AS owner_name,
            COUNT(a.id) AS visit_count
        FROM Pets p
        JOIN Owners      o ON p.owner_id = o.id
        JOIN Appointments a ON a.pet_id  = p.id
        GROUP BY p.id
        ORDER BY p.name ASC
    `);

module.exports = { getHistoryByPet, getAllPetsWithHistory };
