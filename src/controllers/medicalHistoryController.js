const MedicalHistoryModel = require('../models/medicalHistoryModel');

exports.getPetList = async (req, res) => {
    try {
        const pets = await MedicalHistoryModel.getAllPetsWithHistory();
        res.render('history/index', { title: 'Historial Clínico', pets });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

exports.getPetHistory = async (req, res) => {
    try {
        const history = await MedicalHistoryModel.getHistoryByPet(req.params.pet_id);
        if (!history || history.length === 0) {
            return res.status(404).render('error', {
                title: 'Sin historial',
                message: 'No se encontró historial clínico para esta mascota.'
            });
        }
        const pet = {
            id:         history[0].pet_id,
            name:       history[0].pet_name,
            species:    history[0].species,
            breed:      history[0].breed,
            birthdate:  history[0].birthdate,
            owner_name: history[0].owner_name,
            owner_phone: history[0].owner_phone,
        };
        res.render('history/detail', { title: `Historial de ${pet.name}`, pet, history });
    } catch (err) {
        res.status(500).send(err.message);
    }
};
