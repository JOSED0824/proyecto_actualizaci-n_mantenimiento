const db = require('../config/db');

const getAll = () => db.getAllPets();

const getById = (id) => db.getPetById(id);

const create = ({ owner_id, name, species, breed, birthdate }) =>
    db.createPet({ owner_id, name, species, breed, birthdate });

const update = (id, { owner_id, name, species, breed, birthdate }) =>
    db.updatePet(id, { owner_id, name, species, breed, birthdate });

const remove = (id) => db.deletePet(id);

module.exports = { getAll, getById, create, update, remove };