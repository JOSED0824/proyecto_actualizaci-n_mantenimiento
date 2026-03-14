-- ============================================================
--  SPRINT 1 · HU-01: Reingeniería de la Base de Datos
--  Motor: SQLite  |  Clínica Veterinaria
-- ============================================================
-- SQLite requiere activar FK manualmente por conexión
PRAGMA foreign_keys = ON;

-- ============================================================
-- 1. Eliminar tablas anteriores (orden inverso por dependencias)
-- ============================================================
DROP TABLE IF EXISTS Appointments;

DROP TABLE IF EXISTS Pets;

DROP TABLE IF EXISTS Owners;

-- ============================================================
-- 2. TABLA Owners (Dueños)
-- ============================================================
CREATE TABLE Owners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 3. TABLA Pets (Mascotas)
--    Criterio 2: owner_id con FK → no puede existir mascota sin dueño válido
-- ============================================================
CREATE TABLE Pets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    species TEXT NOT NULL,
    breed TEXT,
    birthdate TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES Owners(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ============================================================
-- 4. TABLA Appointments (Citas) — reemplaza la tabla monolítica original
-- ============================================================
CREATE TABLE Appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pet_id INTEGER NOT NULL,
    service TEXT NOT NULL,
    appointment_date TEXT NOT NULL,
    status TEXT DEFAULT 'Scheduled',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pet_id) REFERENCES Pets(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ============================================================
-- 5. MIGRACIÓN: Rex (Juan Pérez) y Luna (Maria García)
-- ============================================================
-- 5a. Insertar dueños
INSERT INTO
    Owners (name)
VALUES
    ('Juan Pérez');

-- id 1 → dueño de Rex
INSERT INTO
    Owners (name)
VALUES
    ('Maria García');

-- id 2 → dueño de Luna
-- 5b. Insertar mascotas vinculadas a sus dueños
INSERT INTO
    Pets (owner_id, name, species)
VALUES
    (1, 'Rex', 'Perro');

INSERT INTO
    Pets (owner_id, name, species)
VALUES
    (2, 'Luna', 'Gato');

-- 5c. Migrar citas originales
INSERT INTO
    Appointments (pet_id, service, appointment_date, status)
VALUES
    (
        1,
        'Corte de Pelo',
        '2026-02-25 10:00',
        'Scheduled'
    );

INSERT INTO
    Appointments (pet_id, service, appointment_date, status)
VALUES
    (
        2,
        'Baño y Limpieza',
        '2026-02-25 11:30',
        'Scheduled'
    );

-- ============================================================
-- 6. VERIFICACIÓN final
-- ============================================================
SELECT
    a.id AS cita_id,
    o.name AS dueno,
    p.name AS mascota,
    p.species AS especie,
    a.service AS servicio,
    a.appointment_date AS fecha,
    a.status AS estado
FROM
    Appointments a
    JOIN Pets p ON a.pet_id = p.id
    JOIN Owners o ON p.owner_id = o.id;