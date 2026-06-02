import express from 'express';
import { getQuestionsForCategory } from '../services/questionGenerator.service.js';

const router = express.Router();

router.get('/:category', (req, res, next) => {
  try {
    const questions = getQuestionsForCategory(req.params.category);
    // don't send the full object if we don't want to expose answer structure, 
    // but there is no answer in the generated questions anyway.
    res.status(200).json({ questions });
  } catch (error) {
    next(error);
  }
});

export default router;
