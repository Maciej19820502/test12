import { Router } from 'express';
import * as trainingController from '../controllers/trainingController.js';

const router = Router();

router.post('/', trainingController.createTraining);
router.get('/', trainingController.listTrainings);
router.get('/:id', trainingController.getTrainingById);
router.post('/:id/sections', trainingController.addSectionToTraining);
router.get('/:id/sections', trainingController.getSectionsByTraining);

export default router;
