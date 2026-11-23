const express = require('express');
const router = express.Router();
const adoptionCtrl = require('../controllers/adoptionController');
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/adminMiddleware');

router.post('/', authMiddleware, adoptionCtrl.createAdoptionRequest);

router.get('/my-requests', authMiddleware, adoptionCtrl.getMyAdoptionRequests);

router.get('/my-pet-requests', authMiddleware, adoptionCtrl.getOwnerPetsRequests);

router.get('/admin/all', authMiddleware, adminMiddleware, adoptionCtrl.getAllAdoptionRequests);

router.patch('/:id/status', authMiddleware, adoptionCtrl.updateRequestStatus);

router.patch('/:id/cancel', authMiddleware, adoptionCtrl.cancelAdoptionRequest);

module.exports = router;