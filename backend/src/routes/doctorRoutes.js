const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', doctorController.getAllDoctors);
router.get('/:id', doctorController.getDoctor);
router.post('/', doctorController.createDoctor);
router.put('/:id', doctorController.updateDoctor);
router.delete('/:id', doctorController.deleteDoctor);
router.delete('/reset/all', doctorController.deleteAllDoctors);

module.exports = router;
