const db = require('../config/db');

const getAll = () => db.getAllOwners();

const getById = (id) => db.getOwnerById(id);

const create = ({ name, phone, email }) =>
    db.createOwner({ name, phone, email });

const update = (id, { name, phone, email }) =>
    db.updateOwner(id, { name, phone, email });

const remove = (id) => db.deleteOwner(id);

module.exports = { getAll, getById, create, update, remove };