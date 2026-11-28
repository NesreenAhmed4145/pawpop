const express = require('express');
const router = express.Router();
const vaccinationCtrl = require('../controllers/vaccinationController');
const authMiddleware = require('../middlewares/auth');
const requirePetAccess = require('../middlewares/petAccessMiddleware');
const Pet = require('../models/petModel');

router.get('/:id/vaccinations', async (req, res, next) => {
    try {
        const pet = await Pet.findByPk(req.params.id);

        if (!pet) {
            return res.status(404).json({
                message: "Pet not found!"
            });
        }

        if (pet.IsForAdoption !== true && pet.IsForAdoption !== 1) {
            return res.status(403).json({
                message: "Vaccination records are not publicly available."
            });
        }

        req.pet = pet;
        next();

    } catch (error) {
        next(error);
    }
}, vaccinationCtrl.getVaccinations);

router.post(
    '/:id/vaccinations',
    authMiddleware,
    requirePetAccess,
    vaccinationCtrl.addVaccination
);

router.patch(
    '/:id/vaccinations/:vaccinationId',
    authMiddleware,
    requirePetAccess,
    vaccinationCtrl.updateVaccination
);

router.delete(
    '/:id/vaccinations/:vaccinationId',
    authMiddleware,
    requirePetAccess,
    vaccinationCtrl.deleteVaccination
);

module.exports = router;
