import { Router, Request, Response } from 'express';
import { db } from '../db';

const router = Router();

// Public Batches List
router.get('/', (req: Request, res: Response) => {
  const query = (req.query.q || req.query.search) as string;
  const batches = db.getBatches(query);
  res.json({ batches });
});

// Single Batch Detail
router.get('/:id', (req: Request, res: Response) => {
  const batch = db.getBatchById(req.params.id);
  if (!batch) {
    res.status(404).json({ error: 'Batch not found' });
    return;
  }
  res.json(batch);
});

// Batch Subjects
router.get('/:id/subjects', (req: Request, res: Response) => {
  const subjects = db.getSubjectsByBatch(req.params.id);
  res.json({ subjects });
});

export default router;
