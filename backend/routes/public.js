import express from 'express';
import { getPublicBoard } from '../controllers/publicController.js';

const router = express.Router();

router.get('/board/:shareId', getPublicBoard);

export default router;
