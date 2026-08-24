import { Router, Request, Response } from 'express';
import { db } from '../db';
import { generateToken, verifyAdminCredentials, requireAdminAuth } from '../auth';

const router = Router();

// --- PUBLIC AUTH ROUTES ---
router.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  const admin = verifyAdminCredentials(username, password);

  if (!admin) {
    res.status(401).json({ error: 'Invalid username or password' });
    return;
  }

  const token = generateToken(admin);
  res.cookie('pw_admin_token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.json({
    success: true,
    token,
    admin
  });
});

router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('pw_admin_token');
  res.json({ success: true, message: 'Logged out successfully' });
});

// Protect all following routes with requireAdminAuth
router.use(requireAdminAuth);

// --- CURRENT ADMIN & STATS ---
router.get('/me', (req: Request, res: Response) => {
  const admin = (req as any).admin;
  res.json({ success: true, admin });
});

router.get('/dashboard', (req: Request, res: Response) => {
  const data = db.getDashboardStats();
  res.json(data);
});

router.get('/stats', (req: Request, res: Response) => {
  const data = db.getDashboardStats();
  res.json(data);
});

// --- SETTINGS ---
router.get('/settings', (req: Request, res: Response) => {
  const settings = db.getSettings();
  res.json({ settings });
});

router.post('/settings', (req: Request, res: Response) => {
  const payload = req.body.settings || req.body;
  const updated = db.updateSettings(payload);
  res.json({ success: true, settings: updated, message: 'Settings saved successfully' });
});

router.put('/settings', (req: Request, res: Response) => {
  const payload = req.body.settings || req.body;
  const updated = db.updateSettings(payload);
  res.json({ success: true, settings: updated, message: 'Settings saved successfully' });
});

// --- BATCHES ---
router.get('/batches', (req: Request, res: Response) => {
  const batches = db.getAllAdminBatches();
  res.json({ batches });
});

router.post('/batches', (req: Request, res: Response) => {
  const batch = db.createBatch(req.body);
  res.status(201).json({ success: true, batch, message: 'Batch created successfully' });
});

router.get('/batches/:id', (req: Request, res: Response) => {
  const batch = db.getBatchById(req.params.id);
  if (!batch) {
    res.status(404).json({ error: 'Batch not found' });
    return;
  }
  res.json({ batch });
});

router.put('/batches/:id', (req: Request, res: Response) => {
  const updated = db.updateBatch(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Batch not found' });
    return;
  }
  res.json({ success: true, batch: updated, message: 'Batch updated successfully' });
});

router.delete('/batches/:id', (req: Request, res: Response) => {
  const success = db.deleteBatch(req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Batch not found' });
    return;
  }
  res.json({ success: true, message: 'Batch deleted successfully' });
});

// --- SUBJECTS ---
router.get('/batches/:id/subjects', (req: Request, res: Response) => {
  const subjects = db.getSubjectsByBatch(req.params.id);
  res.json({ subjects });
});

router.post('/batches/:id/subjects', (req: Request, res: Response) => {
  const subject = db.createSubject(req.params.id, req.body);
  res.status(201).json({ success: true, subject, message: 'Subject created successfully' });
});

router.get('/subjects/:id', (req: Request, res: Response) => {
  const subject = db.getSubjectById(Number(req.params.id));
  if (!subject) {
    res.status(404).json({ error: 'Subject not found' });
    return;
  }
  res.json(subject);
});

router.put('/subjects/:id', (req: Request, res: Response) => {
  const updated = db.updateSubject(Number(req.params.id), req.body);
  if (!updated) {
    res.status(404).json({ error: 'Subject not found' });
    return;
  }
  res.json({ success: true, subject: updated, message: 'Subject updated successfully' });
});

router.delete('/subjects/:id', (req: Request, res: Response) => {
  const success = db.deleteSubject(Number(req.params.id));
  if (!success) {
    res.status(404).json({ error: 'Subject not found' });
    return;
  }
  res.json({ success: true, message: 'Subject deleted successfully' });
});

// --- CHAPTERS ---
router.get('/chapters', (req: Request, res: Response) => {
  const subjectId = req.query.subject_id;
  if (subjectId) {
    const chapters = db.getChaptersBySubject(Number(subjectId));
    res.json({ chapters });
  } else {
    res.json({ chapters: [] });
  }
});

router.post('/chapters', (req: Request, res: Response) => {
  const subjectId = req.body.subject_id;
  const chapter = db.createChapter({ ...req.body, subject_id: Number(subjectId) });
  res.status(201).json({ success: true, chapter, message: 'Chapter created successfully' });
});

router.get('/subjects/:id/chapters', (req: Request, res: Response) => {
  const chapters = db.getChaptersBySubject(Number(req.params.id));
  res.json({ chapters });
});

router.post('/subjects/:id/chapters', (req: Request, res: Response) => {
  const chapter = db.createChapter({ ...req.body, subject_id: Number(req.params.id) });
  res.status(201).json({ success: true, chapter, message: 'Chapter created successfully' });
});

router.put('/chapters/:id', (req: Request, res: Response) => {
  const updated = db.updateChapter(Number(req.params.id), req.body);
  if (!updated) {
    res.status(404).json({ error: 'Chapter not found' });
    return;
  }
  res.json({ success: true, chapter: updated, message: 'Chapter updated successfully' });
});

router.delete('/chapters/:id', (req: Request, res: Response) => {
  const success = db.deleteChapter(Number(req.params.id));
  if (!success) {
    res.status(404).json({ error: 'Chapter not found' });
    return;
  }
  res.json({ success: true, message: 'Chapter deleted successfully' });
});

// --- CHAPTER CONTENT & UNIFIED LECTURE ---
router.get('/chapters/:id/content', (req: Request, res: Response) => {
  const content = db.getAdminChapterContent(Number(req.params.id));
  res.json(content);
});

router.get('/chapters/:id/lectures', (req: Request, res: Response) => {
  const content = db.getAdminChapterContent(Number(req.params.id));
  res.json({
    lectures: content.lectures,
    notes: content.notes,
    dpp_pdfs: content.dpp_pdfs,
    dpp_videos: content.dpp_videos,
    quizzes: content.dpp_quizzes
  });
});

router.post('/chapters/:id/unified-lecture', (req: Request, res: Response) => {
  const lecture = db.createUnifiedLecture(Number(req.params.id), req.body);
  res.status(201).json({ success: true, lecture, message: 'Unified lecture created successfully' });
});

router.get('/lectures/:id', (req: Request, res: Response) => {
  const lecture = db.getLectureById(Number(req.params.id));
  if (!lecture) {
    res.status(404).json({ error: 'Lecture not found' });
    return;
  }
  res.json({ lecture });
});

router.put('/lectures/:id', (req: Request, res: Response) => {
  const updated = db.updateUnifiedLecture(Number(req.params.id), req.body);
  if (!updated) {
    res.status(404).json({ error: 'Lecture not found' });
    return;
  }
  res.json({ success: true, lecture: updated, message: 'Lecture updated successfully' });
});

router.delete('/lectures/:id', (req: Request, res: Response) => {
  const success = db.deleteVideo(Number(req.params.id));
  if (!success) {
    res.status(404).json({ error: 'Lecture not found' });
    return;
  }
  res.json({ success: true, message: 'Lecture deleted successfully' });
});

// --- SINGLE VIDEOS ---
router.post('/videos', (req: Request, res: Response) => {
  const video = db.createVideo(req.body);
  res.status(201).json({ success: true, video, message: 'Video created successfully' });
});

router.put('/videos/:id', (req: Request, res: Response) => {
  const updated = db.updateVideo(Number(req.params.id), req.body);
  if (!updated) {
    res.status(404).json({ error: 'Video not found' });
    return;
  }
  res.json({ success: true, video: updated, message: 'Video updated successfully' });
});

router.delete('/videos/:id', (req: Request, res: Response) => {
  const success = db.deleteVideo(Number(req.params.id));
  if (!success) {
    res.status(404).json({ error: 'Video not found' });
    return;
  }
  res.json({ success: true, message: 'Video deleted successfully' });
});

router.patch('/videos/:id/today', (req: Request, res: Response) => {
  const success = db.setVideoToday(Number(req.params.id), req.body.is_today);
  res.json({ success });
});

router.patch('/videos/:id/live', (req: Request, res: Response) => {
  const success = db.setVideoLive(Number(req.params.id), req.body.is_live);
  res.json({ success });
});

router.patch('/videos/:id/status', (req: Request, res: Response) => {
  const success = db.setVideoStatus(Number(req.params.id), req.body.is_published);
  res.json({ success });
});

// --- SINGLE PDFS ---
router.post('/pdfs', (req: Request, res: Response) => {
  const pdf = db.createPdf(req.body);
  res.status(201).json({ success: true, pdf, message: 'PDF created successfully' });
});

router.put('/pdfs/:id', (req: Request, res: Response) => {
  const updated = db.updatePdf(Number(req.params.id), req.body);
  if (!updated) {
    res.status(404).json({ error: 'PDF not found' });
    return;
  }
  res.json({ success: true, pdf: updated, message: 'PDF updated successfully' });
});

router.delete('/pdfs/:id', (req: Request, res: Response) => {
  const success = db.deletePdf(Number(req.params.id));
  if (!success) {
    res.status(404).json({ error: 'PDF not found' });
    return;
  }
  res.json({ success: true, message: 'PDF deleted successfully' });
});

router.patch('/pdfs/:id/status', (req: Request, res: Response) => {
  const success = db.setPdfStatus(Number(req.params.id), req.body.is_published);
  res.json({ success });
});

// --- SINGLE QUIZZES ---
router.delete('/quizzes/:id', (req: Request, res: Response) => {
  const success = db.deleteQuiz(Number(req.params.id));
  if (!success) {
    res.status(404).json({ error: 'Quiz not found' });
    return;
  }
  res.json({ success: true, message: 'Quiz deleted successfully' });
});

router.patch('/quizzes/:id/status', (req: Request, res: Response) => {
  const success = db.setQuizStatus(Number(req.params.id), req.body.is_published);
  res.json({ success });
});

// --- ANNOUNCEMENTS ---
router.get('/announcements', (req: Request, res: Response) => {
  const batchId = req.query.batch_id as string;
  const announcements = db.getAnnouncements(batchId || '1203896577937539073');
  res.json({ announcements });
});

router.get('/announcements/:batch_id', (req: Request, res: Response) => {
  const batchId = req.params.batch_id;
  const announcements = db.getAnnouncements(batchId);
  res.json({ announcements });
});

router.post('/announcements', (req: Request, res: Response) => {
  const { batch_id, message } = req.body;
  if (!batch_id || !message) {
    res.status(400).json({ error: 'Batch ID and message are required' });
    return;
  }
  const ann = db.createAnnouncement(batch_id, message);
  res.status(201).json({ success: true, announcement: ann, message: 'Announcement created successfully' });
});

router.delete('/announcements/:id', (req: Request, res: Response) => {
  const success = db.deleteAnnouncement(Number(req.params.id));
  if (!success) {
    res.status(404).json({ error: 'Announcement not found' });
    return;
  }
  res.json({ success: true, message: 'Announcement deleted successfully' });
});

// --- TEACHERS ---
router.get('/teachers', (req: Request, res: Response) => {
  const batchId = req.query.batch_id as string;
  const teachers = db.getTeachers(batchId);
  res.json({ teachers });
});

router.post('/teachers', (req: Request, res: Response) => {
  const teacher = db.createTeacher(req.body);
  res.status(201).json({ success: true, teacher, message: 'Educator added successfully' });
});

router.put('/teachers/:id', (req: Request, res: Response) => {
  const updated = db.updateTeacher(Number(req.params.id), req.body);
  if (!updated) {
    res.status(404).json({ error: 'Teacher not found' });
    return;
  }
  res.json({ success: true, teacher: updated, message: 'Educator updated successfully' });
});

router.delete('/teachers/:id', (req: Request, res: Response) => {
  const success = db.deleteTeacher(Number(req.params.id));
  if (!success) {
    res.status(404).json({ error: 'Teacher not found' });
    return;
  }
  res.json({ success: true, message: 'Educator removed successfully' });
});

// --- BANNERS ---
router.get('/banners', (req: Request, res: Response) => {
  const data = db.getBanners(false);
  res.json(data);
});

router.post('/banners', (req: Request, res: Response) => {
  const banner = db.createBanner(req.body);
  res.status(201).json({ success: true, banner, message: 'Banner created successfully' });
});

router.put('/banners/:id', (req: Request, res: Response) => {
  const updated = db.updateBanner(Number(req.params.id), req.body);
  if (!updated) {
    res.status(404).json({ error: 'Banner not found' });
    return;
  }
  res.json({ success: true, banner: updated, message: 'Banner updated successfully' });
});

router.delete('/banners/:id', (req: Request, res: Response) => {
  const success = db.deleteBanner(Number(req.params.id));
  if (!success) {
    res.status(404).json({ error: 'Banner not found' });
    return;
  }
  res.json({ success: true, message: 'Banner deleted successfully' });
});

router.patch('/banners/:id/status', (req: Request, res: Response) => {
  const success = db.setBannerStatus(Number(req.params.id), req.body.is_active);
  res.json({ success });
});

router.post('/banners/reorder', (req: Request, res: Response) => {
  const { banners, ids } = req.body;
  if (Array.isArray(banners)) {
    db.reorderBanners(banners.map((b: any) => b.id));
  } else if (Array.isArray(ids)) {
    db.reorderBanners(ids);
  }
  res.json({ success: true, message: 'Banners reordered successfully' });
});

router.put('/banners/reorder', (req: Request, res: Response) => {
  const { banners, ids } = req.body;
  if (Array.isArray(banners)) {
    db.reorderBanners(banners.map((b: any) => b.id));
  } else if (Array.isArray(ids)) {
    db.reorderBanners(ids);
  }
  res.json({ success: true, message: 'Banners reordered successfully' });
});

router.put('/banners/settings', (req: Request, res: Response) => {
  const { interval, auto_slide } = req.body;
  db.updateSettings({
    banner_interval: interval,
    banner_auto_slide: auto_slide
  });
  res.json({ success: true, message: 'Banner settings updated successfully' });
});

// --- NAVIGATION LINKS ---
router.get('/nav-links', (req: Request, res: Response) => {
  const navLinks = db.getNavLinks(false);
  res.json({ navLinks });
});

router.post('/nav-links', (req: Request, res: Response) => {
  const link = db.createNavLink(req.body);
  res.status(201).json({ success: true, navLink: link, message: 'Nav link created successfully' });
});

router.put('/nav-links/:id', (req: Request, res: Response) => {
  const updated = db.updateNavLink(Number(req.params.id), req.body);
  if (!updated) {
    res.status(404).json({ error: 'Nav link not found' });
    return;
  }
  res.json({ success: true, navLink: updated, message: 'Nav link updated successfully' });
});

router.delete('/nav-links/:id', (req: Request, res: Response) => {
  const success = db.deleteNavLink(Number(req.params.id));
  if (!success) {
    res.status(404).json({ error: 'Nav link not found' });
    return;
  }
  res.json({ success: true, message: 'Nav link deleted successfully' });
});

// --- USERS ---
router.get('/users', (req: Request, res: Response) => {
  const users = db.getUsers();
  res.json({ users });
});

router.delete('/users/:id', (req: Request, res: Response) => {
  const success = db.deleteUser(Number(req.params.id));
  if (!success) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ success: true, message: 'User deleted successfully' });
});

export default router;
