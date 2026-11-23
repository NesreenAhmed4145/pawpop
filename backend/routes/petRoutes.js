const express = require('express');
const router = express.Router();
const petCtrl = require('../controllers/petController');
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/adminMiddleware'); 
const optionalAuthMiddleware = require('../middlewares/optionalAuthMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.post('/', authMiddleware, upload.single('ImageURL'), petCtrl.addPet);

router.get('/adoption', petCtrl.getAdoptionPets);

router.get('/my-pets', authMiddleware, petCtrl.getMyPets);

router.get('/:id', optionalAuthMiddleware, petCtrl.getPetById);

router.patch('/:id', authMiddleware, upload.single('ImageURL'), petCtrl.updatePet);


router.patch('/:id/status', authMiddleware, adminMiddleware, petCtrl.updatePetStatusByAdmin);


router.delete('/:id', authMiddleware, petCtrl.deletePet);

module.exports = router;