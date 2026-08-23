import { Router, Request, Response } from 'express';
import { db } from '../db';

const router = Router();

// Subject details with chapters
router.get('/subjects/:id', (req: Request, res: Response) => {
  const data = db.getSubjectById(Number(req.params.id));
  if (!data) {
    res.status(404).json({ error: 'Subject not found' });
    return;
  }
  res.json(data);
});

// Chapter details with content (lectures, notes, DPPs, quizzes)
router.get('/chapters/:id', (req: Request, res: Response) => {
  const data = db.getChapterById(Number(req.params.id));
  if (!data) {
    res.status(404).json({ error: 'Chapter not found' });
    return;
  }
  res.json(data);
});

// Today's Lectures
router.get('/today-lectures', (req: Request, res: Response) => {
  const batchId = req.query.batch_id as string;
  const lectures = db.getTodayLectures(batchId);
  res.json({ lectures });
});

// Upcoming Lectures
router.get('/upcoming-lectures', (req: Request, res: Response) => {
  const batchId = req.query.batch_id as string;
  const lectures = db.getUpcomingLectures(batchId);
  res.json({ lectures });
});

// Public announcements for batch
router.get('/announcements', (req: Request, res: Response) => {
  const batchId = req.query.batch_id as string;
  const announcements = db.getAnnouncements(batchId || '1203896577937539073');
  res.json({ announcements });
});

// Public teachers list
router.get('/teachers', (req: Request, res: Response) => {
  const batchId = req.query.batch_id as string;
  const teachers = db.getTeachers(batchId);
  res.json({ teachers });
});

export default router;
