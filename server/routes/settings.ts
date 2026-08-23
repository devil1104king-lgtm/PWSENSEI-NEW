import { Router, Request, Response } from 'express';
import { db } from '../db';

const router = Router();

// Public Site Settings
router.get('/settings', (req: Request, res: Response) => {
  const settings = db.getSettings();
  res.json({ settings });
});

// Public Active Navigation Links
router.get('/nav-links', (req: Request, res: Response) => {
  const navLinks = db.getNavLinks(true);
  res.json({ navLinks });
});

// Public Active Banners
router.get('/banners', (req: Request, res: Response) => {
  const data = db.getBanners(true);
  res.json(data);
});

export default router;
