const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(':memory:');

// ─────────────────────────────────────────────────────────────────────────────
// Helper: ejecutar una query que no devuelve filas (CREATE, INSERT, UPDATE…)
// ─────────────────────────────────────────────────────────────────────────────
const run = (sql, params = []) =>
    new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
        });
    });

// ─────────────────────────────────────────────────────────────────────────────
// Helper: obtener múltiples filas
// ─────────────────────────────────────────────────────────────────────────────
const all = (sql, params = []) =>
    new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });

// ─────────────────────────────────────────────────────────────────────────────
// Helper: obtener una sola fila
// ─────────────────────────────────────────────────────────────────────────────
const get = (sql, params = []) =>
    new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row || null);
        });
    });

// ─────────────────────────────────────────────────────────────────────────────
// Inicialización: tablas + datos de migración (Rex y Luna)
// ─────────────────────────────────────────────────────────────────────────────
db.serialize(async () => {
    try {
        // Activar claves foráneas en SQLite
        await run('PRAGMA foreign_keys = ON');

        // ── Tabla Owners ────────────────────────────────────────────────────────
        await run(`
      CREATE TABLE IF NOT EXISTS Owners (
        id         INTEGER  PRIMARY KEY AUTOINCREMENT,
        name       TEXT     NOT NULL,
        phone      TEXT,
        email      TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // ── Tabla Pets ──────────────────────────────────────────────────────────
        // Criterio 2: owner_id NOT NULL + FK → no se registra mascota sin dueño
        await run(`
      CREATE TABLE IF NOT EXISTS Pets (
        id         INTEGER  PRIMARY KEY AUTOINCREMENT,
        owner_id   INTEGER  NOT NULL,
        name       TEXT     NOT NULL,
        species    TEXT     NOT NULL,
        breed      TEXT,
        birthdate  TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES Owners(id)
          ON DELETE RESTRICT
          ON UPDATE CASCADE
      )
    `);

        // ── Tabla Appointments ──────────────────────────────────────────────────
        await run(`
      CREATE TABLE IF NOT EXISTS Appointments (
        id               INTEGER  PRIMARY KEY AUTOINCREMENT,
        pet_id           INTEGER  NOT NULL,
        service          TEXT     NOT NULL,
        appointment_date TEXT     NOT NULL,
        status           TEXT     DEFAULT 'Scheduled',
        created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (pet_id) REFERENCES Pets(id)
          ON DELETE RESTRICT
          ON UPDATE CASCADE
      )
    `);

        // ── Migración: Rex (Juan Pérez) y Luna (Maria García) ───────────────────
        const owner1 = await run(
            'INSERT INTO Owners (name) VALUES (?)', ['Juan Pérez']
        );
        const owner2 = await run(
            'INSERT INTO Owners (name) VALUES (?)', ['Maria García']
        );

        const pet1 = await run(
            'INSERT INTO Pets (owner_id, name, species) VALUES (?, ?, ?)',
            [owner1.lastID, 'Rex', 'Perro']
        );
        const pet2 = await run(
            'INSERT INTO Pets (owner_id, name, species) VALUES (?, ?, ?)',
            [owner2.lastID, 'Luna', 'Gato']
        );

        await run(
            'INSERT INTO Appointments (pet_id, service, appointment_date) VALUES (?, ?, ?)',
            [pet1.lastID, 'Corte de Pelo', '2026-02-25 10:00']
        );
        await run(
            'INSERT INTO Appointments (pet_id, service, appointment_date) VALUES (?, ?, ?)',
            [pet2.lastID, 'Baño y Limpieza', '2026-02-25 11:30']
        );

        console.log('✅  Base de datos inicializada con tablas normalizadas');
    } catch (err) {
        console.error('❌  Error al inicializar la base de datos:', err.message);
    }
});

// ═════════════════════════════════════════════════════════════════════════════
//  OWNERS
// ═════════════════════════════════════════════════════════════════════════════

const getAllOwners = () =>
    all('SELECT * FROM Owners ORDER BY name');

const getOwnerById = (id) =>
    get('SELECT * FROM Owners WHERE id = ?', [id]);

const createOwner = ({ name, phone, email }) =>
    run(
        'INSERT INTO Owners (name, phone, email) VALUES (?, ?, ?)',
        [name, phone || null, email || null]
    );

const updateOwner = (id, { name, phone, email }) =>
    run(
        'UPDATE Owners SET name = ?, phone = ?, email = ? WHERE id = ?',
        [name, phone || null, email || null, id]
    );

const deleteOwner = (id) =>
    run('DELETE FROM Owners WHERE id = ?', [id]);

// ═════════════════════════════════════════════════════════════════════════════
//  PETS
// ═════════════════════════════════════════════════════════════════════════════

const getAllPets = () =>
    all(`
    SELECT p.*, o.name AS owner_name, o.phone AS owner_phone
    FROM Pets p
    JOIN Owners o ON p.owner_id = o.id
    ORDER BY p.name
  `);

const getPetById = (id) =>
    get(`
    SELECT p.*, o.name AS owner_name, o.phone AS owner_phone
    FROM Pets p
    JOIN Owners o ON p.owner_id = o.id
    WHERE p.id = ?
  `, [id]);

/**
 * Criterio 2: valida que exista el dueño ANTES de insertar la mascota.
 * La FK de SQLite también lo bloquea a nivel de base de datos.
 */
const createPet = async ({ owner_id, name, species, breed, birthdate }) => {
    const owner = await getOwnerById(owner_id);
    if (!owner) {
        throw new Error(`No existe un dueño con id ${owner_id}. No se puede registrar la mascota.`);
    }
    return run(
        'INSERT INTO Pets (owner_id, name, species, breed, birthdate) VALUES (?, ?, ?, ?, ?)',
        [owner_id, name, species, breed || null, birthdate || null]
    );
};

const updatePet = async (id, { owner_id, name, species, breed, birthdate }) => {
    if (owner_id) {
        const owner = await getOwnerById(owner_id);
        if (!owner) throw new Error(`No existe un dueño con id ${owner_id}.`);
    }
    return run(
        'UPDATE Pets SET owner_id = ?, name = ?, species = ?, breed = ?, birthdate = ? WHERE id = ?',
        [owner_id, name, species, breed || null, birthdate || null, id]
    );
};

const deletePet = (id) =>
    run('DELETE FROM Pets WHERE id = ?', [id]);

// ═════════════════════════════════════════════════════════════════════════════
//  APPOINTMENTS
// ═════════════════════════════════════════════════════════════════════════════

const getAllAppointments = () =>
    all(`
    SELECT
      a.id, a.service, a.appointment_date, a.status, a.created_at,
      p.id   AS pet_id,   p.name AS pet_name,  p.species,
      o.id   AS owner_id, o.name AS owner_name, o.phone AS owner_phone
    FROM Appointments a
    JOIN Pets   p ON a.pet_id   = p.id
    JOIN Owners o ON p.owner_id = o.id
    ORDER BY a.appointment_date
  `);

const getAppointmentById = (id) =>
    get(`
    SELECT a.*, p.name AS pet_name, p.species,
           o.name AS owner_name, o.phone AS owner_phone
    FROM Appointments a
    JOIN Pets   p ON a.pet_id   = p.id
    JOIN Owners o ON p.owner_id = o.id
    WHERE a.id = ?
  `, [id]);

const createAppointment = async ({ pet_id, service, appointment_date }) => {
    const pet = await getPetById(pet_id);
    if (!pet) throw new Error(`No existe una mascota con id ${pet_id}.`);
    return run(
        'INSERT INTO Appointments (pet_id, service, appointment_date) VALUES (?, ?, ?)',
        [pet_id, service, appointment_date]
    );
};

const updateAppointmentStatus = (id, status) => {
    const valid = ['Scheduled', 'Completed', 'Cancelled'];
    if (!valid.includes(status)) throw new Error(`Estado inválido: ${status}`);
    return run('UPDATE Appointments SET status = ? WHERE id = ?', [status, id]);
};

const deleteAppointment = (id) =>
    run('DELETE FROM Appointments WHERE id = ?', [id]);

// ─────────────────────────────────────────────────────────────────────────────
// Exportar — se expone db para compatibilidad con código existente
// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
    db,          // instancia raw (por si el resto del código la usa directamente)

    // Owners
    getAllOwners,
    getOwnerById,
    createOwner,
    updateOwner,
    deleteOwner,

    // Pets
    getAllPets,
    getPetById,
    createPet,
    updatePet,
    deletePet,

    // Appointments
    getAllAppointments,
    getAppointmentById,
    createAppointment,
    updateAppointmentStatus,
    deleteAppointment,
};