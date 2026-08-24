import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

export interface SiteSettings {
  site_name?: string;
  site_logo_url?: string;
  hero_heading?: string;
  hero_subheading?: string;
  hero_cta_text?: string;
  hero_cta_link?: string;
  notice_bar_text?: string;
  notice_bar_link?: string;
  notice_bar_active?: string | number;
  app_download_link?: string;
  banner_image_url?: string;
  banner_link?: string;
  banner_interval?: string | number;
  banner_auto_slide?: string | number | boolean;
  footer_text?: string;
  telegram_link?: string;
  telegram_channel_name?: string;
  telegram_bot?: string;
  donate_upi_id?: string;
  donate_qr_url?: string;
  donate_qr_image_url?: string;
  primary_color?: string;
  admin_email?: string;
  contact_email?: string;
  ent_section_title?: string;
  ent_section_desc?: string;
  ent_web_title?: string;
  ent_web_desc?: string;
  ent_web_img?: string;
  ent_web_url?: string;
  ent_tg_title?: string;
  ent_tg_desc?: string;
  ent_tg_img?: string;
  ent_tg_url?: string;
  [key: string]: any;
}

export interface Batch {
  id: string;
  title: string;
  thumbnail_url?: string | null;
  banner_url?: string | null;
  language?: string;
  target_audience?: string;
  start_date?: string;
  end_date?: string;
  price?: number;
  is_free?: number;
  is_new?: number;
  is_published?: number;
  description?: string;
  display_order?: number;
  created_at?: string;
}

export interface Subject {
  id: number;
  batch_id: string;
  name: string;
  default_teacher_name?: string;
  default_thumbnail_url?: string;
  icon?: string;
  chapter_count?: number;
  display_order?: number;
  created_at?: string;
}

export interface Chapter {
  id: number;
  subject_id: number;
  chapter_number: number;
  title: string;
  description?: string;
  display_order?: number;
  is_published?: number;
  created_at?: string;
}

export interface Lecture {
  id: number;
  chapter_id: number;
  title: string;
  external_link: string;
  duration?: string;
  teacher_name?: string;
  lecture_date?: string;
  is_live?: number;
  is_today?: number;
  thumbnail_url?: string;
  display_order?: number;
  lecture_number?: number;
  video_type?: string;
  is_published?: number;
  created_at?: string;
  notes?: any;
  dpp_pdf?: any;
  dpp_video?: any;
  dpp_quiz?: any;
  extra_resources?: any[];
}

export interface Note {
  id: number;
  chapter_id: number;
  lecture_id?: number | null;
  title: string;
  external_link: string;
  file_size?: string;
  type?: string;
  display_order?: number;
  is_published?: number;
  created_at?: string;
}

export interface Quiz {
  id: number;
  chapter_id: number;
  lecture_id?: number | null;
  title: string;
  total_questions?: number;
  duration?: number;
  external_link?: string;
  is_published?: number;
  created_at?: string;
}

export interface ExtraResource {
  id: number;
  lecture_id: number;
  title: string;
  url: string;
  resource_type?: string;
  description?: string;
  display_order?: number;
  created_at?: string;
}

export interface Teacher {
  id: number;
  batch_id?: string | null;
  name: string;
  photo_url?: string;
  default_thumbnail_url?: string;
  subject?: string;
  subjects_taught?: string;
  experience?: string;
  bio?: string;
  display_order?: number;
  created_at?: string;
}

export interface Announcement {
  id: number;
  batch_id: string;
  message: string;
  created_at?: string;
}

export interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  image_url: string;
  link?: string;
  target_url?: string;
  badge_text?: string;
  badge_color?: string;
  display_order?: number;
  is_active?: number;
  created_at?: string;
}

export interface NavLinkItem {
  id: number;
  label: string;
  url: string;
  icon?: string;
  display_order?: number;
  is_external?: number;
  is_active?: number;
  created_at?: string;
}

export interface UserItem {
  id: number;
  name: string;
  email: string;
  password_hash?: string;
  xp?: number;
  enrolled_count?: number;
  created_at?: string;
}

interface InMemoryDB {
  settings: SiteSettings;
  batches: Batch[];
  subjects: Subject[];
  chapters: Chapter[];
  lectures: Lecture[];
  notes: Note[];
  quizzes: Quiz[];
  extra_resources: ExtraResource[];
  teachers: Teacher[];
  announcements: Announcement[];
  banners: Banner[];
  nav_links: NavLinkItem[];
  users: UserItem[];
  nextId: {
    subject: number;
    chapter: number;
    lecture: number;
    note: number;
    quiz: number;
    extra_resource: number;
    teacher: number;
    announcement: number;
    banner: number;
    nav_link: number;
    user: number;
  };
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'pwsensei.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let dbMemory: InMemoryDB | null = null;
let pgPool: Pool | null = null;

if (process.env.DATABASE_URL) {
  try {
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
    });
  } catch (err) {
    console.warn('PostgreSQL connection initialization failed, using file database:', err);
    pgPool = null;
  }
}

function getDefaultSeedData(): InMemoryDB {
  const defaultSettings: SiteSettings = {
    site_name: "PW SENSEI",
    site_logo_url: "https://cdn.phototourl.com/member/2026-08-20-364f45ea-0915-4d2f-8ccd-7d7f984f418f.png",
    hero_heading: "We Make Education Affordable.",
    hero_subheading: "Access premium educational content, structured live batches, and comprehensive study materials from India's top educators with zero barrier to entry.",
    hero_cta_text: "Start Learning Now",
    hero_cta_link: "/study.html",
    notice_bar_text: "Batch Lectures & DPPs are now LIVE! Join our official Telegram channel for updates.",
    notice_bar_link: "https://t.me/PW_SENSEI",
    notice_bar_active: "1",
    app_download_link: "https://www.appcreator24.com/app3677124-jauk1r",
    banner_image_url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1200",
    banner_link: "/study.html",
    banner_interval: "4000",
    banner_auto_slide: "1",
    footer_text: "The premier platform for accessible structured education. © 2026 PW SENSEI. All rights reserved.",
    telegram_link: "https://t.me/PW_SENSEI",
    telegram_channel_name: "@PW_SENSEI",
    telegram_bot: "https://t.me/PW_SENSEI",
    donate_upi_id: "pwsensei@upi",
    donate_qr_url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=400",
    primary_color: "#7c3aed",
    admin_email: "contact@pwsensei.live",
    ent_section_title: "Official Entertainment",
    ent_section_desc: "Explore our official web portal and community channels for Movies, Web Series & Entertainment",
    ent_web_title: "Official Website",
    ent_web_desc: "Access our official web platform for Movies, Web Series & Entertainment",
    ent_web_img: "https://i.ibb.co/0pG9PnRT/uploaded-image.jpg",
    ent_web_url: "https://skxmovies.onrender.com/",
    ent_tg_title: "Official Telegram Channel",
    ent_tg_desc: "Movies, Web Series & Entertainment Updates",
    ent_tg_img: "https://i.ibb.co/bg9P0hnr/uploaded-image.jpg",
    ent_tg_url: "https://t.me/The_Sk08",
    contact_email: "support@pwsensei.live",
    donate_qr_image_url: ""
  };

  const batches: Batch[] = [
    {
      id: "1203896577937539073",
      title: "Vidyapeeth 28-YN201EA (NEET 2024)",
      thumbnail_url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800",
      banner_url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=1200",
      language: "Hinglish",
      target_audience: "For NEET 2024",
      start_date: "12 Apr 2024",
      end_date: "30 Jan 2025",
      is_free: 1,
      price: 0,
      is_new: 1,
      is_published: 1,
      description: "Full offline-online synchronized crash course & comprehensive NEET preparation with expert faculty.",
      display_order: 1,
      created_at: new Date().toISOString()
    },
    {
      id: "1203896577937539074",
      title: "Yakeen NEET 2.0 (Dropper Batch)",
      thumbnail_url: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=800",
      banner_url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=1200",
      language: "Hindi / Hinglish",
      target_audience: "For NEET Droppers",
      start_date: "15 May 2024",
      end_date: "28 Feb 2025",
      is_free: 1,
      price: 0,
      is_new: 1,
      is_published: 1,
      description: "India's most trusted batch for NEET droppers with daily live lectures, DPPs, and full video solutions.",
      display_order: 2,
      created_at: new Date().toISOString()
    },
    {
      id: "1203896577937539075",
      title: "Lakshya JEE 2025 (Class 12th)",
      thumbnail_url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800",
      banner_url: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=1200",
      language: "Hinglish",
      target_audience: "Class 12th JEE Main & Advanced",
      start_date: "01 Jun 2024",
      end_date: "15 Mar 2025",
      is_free: 1,
      price: 0,
      is_new: 0,
      is_published: 1,
      description: "Complete class 12th Board + JEE Main & Advanced syllabus coverage with advanced problem solving.",
      display_order: 3,
      created_at: new Date().toISOString()
    },
    {
      id: "1203896577937539076",
      title: "Arjuna NEET 2025 (Class 11th)",
      thumbnail_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800",
      banner_url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1200",
      language: "Hinglish",
      target_audience: "Class 11th NEET Aspirants",
      start_date: "20 Jun 2024",
      end_date: "10 Apr 2025",
      is_free: 1,
      price: 0,
      is_new: 0,
      is_published: 1,
      description: "Foundation and deep conceptual clarity for Class 11 medical aspirants with regular test series.",
      display_order: 4,
      created_at: new Date().toISOString()
    }
  ];

  const subjects: Subject[] = [
    {
      id: 1,
      batch_id: "1203896577937539073",
      name: "Physics",
      default_teacher_name: "Alakh Sir & Rajwant Sir",
      default_thumbnail_url: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&q=80&w=600",
      icon: "⚡",
      chapter_count: 14,
      display_order: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      batch_id: "1203896577937539073",
      name: "Chemistry",
      default_teacher_name: "Pankaj Sir & Amit Sir",
      default_thumbnail_url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=600",
      icon: "🧪",
      chapter_count: 16,
      display_order: 2,
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      batch_id: "1203896577937539073",
      name: "Botany",
      default_teacher_name: "Tarun Sir & Rishabh Sir",
      default_thumbnail_url: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&q=80&w=600",
      icon: "🌱",
      chapter_count: 12,
      display_order: 3,
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      batch_id: "1203896577937539073",
      name: "Zoology",
      default_teacher_name: "Samapti Ma'am & Manish Sir",
      default_thumbnail_url: "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=600",
      icon: "🧬",
      chapter_count: 11,
      display_order: 4,
      created_at: new Date().toISOString()
    },
    // Subjects for Yakeen NEET
    {
      id: 5,
      batch_id: "1203896577937539074",
      name: "Physics",
      default_teacher_name: "MR Sir",
      default_thumbnail_url: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&q=80&w=600",
      icon: "⚡",
      chapter_count: 15,
      display_order: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 6,
      batch_id: "1203896577937539074",
      name: "Chemistry",
      default_teacher_name: "Sudhanshu Sir",
      default_thumbnail_url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=600",
      icon: "🧪",
      chapter_count: 16,
      display_order: 2,
      created_at: new Date().toISOString()
    },
    // Subjects for Lakshya JEE
    {
      id: 7,
      batch_id: "1203896577937539075",
      name: "Mathematics",
      default_teacher_name: "Sachin Sir & Ashish Sir",
      default_thumbnail_url: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=600",
      icon: "📐",
      chapter_count: 18,
      display_order: 1,
      created_at: new Date().toISOString()
    }
  ];

  const chapters: Chapter[] = [
    {
      id: 1,
      subject_id: 1,
      chapter_number: 1,
      title: "Electrostatics & Electric Field",
      description: "Electric Charges, Coulomb's Law, Electric Fields, Gauss's Law, Dipoles, and flux calculations.",
      display_order: 1,
      is_published: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      subject_id: 1,
      chapter_number: 2,
      title: "Electric Potential and Capacitance",
      description: "Electrostatic potential energy, equipotential surfaces, capacitors, dielectric mediums.",
      display_order: 2,
      is_published: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      subject_id: 1,
      chapter_number: 3,
      title: "Current Electricity",
      description: "Ohm's law, drift velocity, Kirchhoff's laws, potentiometer, Wheatstone bridge.",
      display_order: 3,
      is_published: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      subject_id: 2,
      chapter_number: 1,
      title: "Solutions & Colligative Properties",
      description: "Raoult's law, ideal and non-ideal solutions, osmotic pressure, Van't Hoff factor.",
      display_order: 1,
      is_published: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 5,
      subject_id: 2,
      chapter_number: 2,
      title: "Electrochemistry",
      description: "Nernst equation, conductance, Kohlrausch's law, fuel cells and corrosion.",
      display_order: 2,
      is_published: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 6,
      subject_id: 3,
      chapter_number: 1,
      title: "Sexual Reproduction in Flowering Plants",
      description: "Microsporogenesis, megasporogenesis, pollination mechanisms, double fertilization.",
      display_order: 1,
      is_published: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 7,
      subject_id: 4,
      chapter_number: 1,
      title: "Human Reproduction & Reproductive Health",
      description: "Gametogenesis, menstrual cycle, fertilization, embryonic development and contraception.",
      display_order: 1,
      is_published: 1,
      created_at: new Date().toISOString()
    }
  ];

  const lectures: Lecture[] = [
    {
      id: 1,
      chapter_id: 1,
      title: "Lecture 01: Electric Charges & Coulomb's Law",
      external_link: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      duration: "1 hr 15 mins",
      teacher_name: "Alakh Sir",
      lecture_date: new Date().toISOString().split('T')[0],
      is_live: 0,
      is_today: 1,
      thumbnail_url: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&q=80&w=600",
      display_order: 1,
      lecture_number: 1,
      video_type: "lecture",
      is_published: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      chapter_id: 1,
      title: "Lecture 02: Electric Field & Superposition Principle",
      external_link: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      duration: "1 hr 20 mins",
      teacher_name: "Alakh Sir",
      lecture_date: new Date().toISOString().split('T')[0],
      is_live: 1,
      is_today: 1,
      thumbnail_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600",
      display_order: 2,
      lecture_number: 2,
      video_type: "lecture",
      is_published: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      chapter_id: 1,
      title: "Lecture 03: Electric Flux and Gauss's Law",
      external_link: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      duration: "1 hr 10 mins",
      teacher_name: "Alakh Sir",
      lecture_date: new Date().toISOString().split('T')[0],
      is_live: 0,
      is_today: 0,
      thumbnail_url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=600",
      display_order: 3,
      lecture_number: 3,
      video_type: "lecture",
      is_published: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      chapter_id: 1,
      title: "DPP 01 Video Solution: Electric Charges",
      external_link: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      duration: "35 mins",
      teacher_name: "Alakh Sir",
      lecture_date: new Date().toISOString().split('T')[0],
      is_live: 0,
      is_today: 0,
      thumbnail_url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=600",
      display_order: 4,
      lecture_number: 1,
      video_type: "dpp_video",
      is_published: 1,
      created_at: new Date().toISOString()
    }
  ];

  const notes: Note[] = [
    {
      id: 1,
      chapter_id: 1,
      lecture_id: 1,
      title: "Lecture 01 Class Notes - Coulomb's Law",
      external_link: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      file_size: "3.2 MB",
      type: "note",
      display_order: 1,
      is_published: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      chapter_id: 1,
      lecture_id: 2,
      title: "Lecture 02 Class Notes - Electric Field & Dipoles",
      external_link: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      file_size: "2.8 MB",
      type: "note",
      display_order: 2,
      is_published: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      chapter_id: 1,
      lecture_id: 1,
      title: "DPP 01: Electric Charges & Forces (Sheet)",
      external_link: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      file_size: "1.4 MB",
      type: "dpp_pdf",
      display_order: 1,
      is_published: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      chapter_id: 1,
      lecture_id: 2,
      title: "DPP 02: Electric Field & Superposition (Sheet)",
      external_link: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      file_size: "1.6 MB",
      type: "dpp_pdf",
      display_order: 2,
      is_published: 1,
      created_at: new Date().toISOString()
    }
  ];

  const quizzes: Quiz[] = [
    {
      id: 1,
      chapter_id: 1,
      lecture_id: 1,
      title: "DPP 01 Interactive Quiz: Coulomb's Law & Charges",
      total_questions: 15,
      duration: 20,
      external_link: "https://quiz.pwsensei.live/dpp1",
      is_published: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      chapter_id: 1,
      lecture_id: 2,
      title: "DPP 02 Interactive Quiz: Electric Fields & Dipole",
      total_questions: 15,
      duration: 20,
      external_link: "https://quiz.pwsensei.live/dpp2",
      is_published: 1,
      created_at: new Date().toISOString()
    }
  ];

  const extraResources: ExtraResource[] = [
    {
      id: 1,
      lecture_id: 1,
      title: "Formula Sheet: Electrostatics Quick Revision",
      url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      resource_type: "pdf",
      description: "Summary formula cheatsheet for rapid exam revision.",
      display_order: 1,
      created_at: new Date().toISOString()
    }
  ];

  const teachers: Teacher[] = [
    {
      id: 1,
      batch_id: "1203896577937539073",
      name: "Alakh Pandey Sir",
      photo_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
      default_thumbnail_url: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&q=80&w=600",
      subject: "Physics",
      subjects_taught: "Physics (NEET/JEE)",
      experience: "10+ Years Experience",
      bio: "Founder & Master Physics Educator inspiring millions of aspiring doctors and engineers across India.",
      display_order: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      batch_id: "1203896577937539073",
      name: "Pankaj Sijairya Sir",
      photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
      default_thumbnail_url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=600",
      subject: "Chemistry",
      subjects_taught: "Chemistry Specialist",
      experience: "8+ Years Experience",
      bio: "Renowned Chemistry faculty known for memory tricks and lucid conceptual breakdown.",
      display_order: 2,
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      batch_id: "1203896577937539073",
      name: "Tarun Kumar Sir",
      photo_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
      default_thumbnail_url: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&q=80&w=600",
      subject: "Botany",
      subjects_taught: "Biology / Botany",
      experience: "9+ Years Experience",
      bio: "Expert Botany mentor delivering 360/360 biology results year after year.",
      display_order: 3,
      created_at: new Date().toISOString()
    }
  ];

  const announcements: Announcement[] = [
    {
      id: 1,
      batch_id: "1203896577937539073",
      message: "🚨 Electrostatics Chapter 01 DPPs & Video Solutions have been uploaded. Make sure to complete the interactive quiz before next class!",
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      batch_id: "1203896577937539073",
      message: "📢 Live Doubt Clearing Session is scheduled this Sunday at 6:00 PM IST on Telegram and YouTube Live.",
      created_at: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  const banners: Banner[] = [
    {
      id: 1,
      title: "PW SENSEI - Free Education Revolution",
      subtitle: "Access high quality structured batches with DPPs and Notes for NEET & JEE 2025/2026.",
      image_url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1200",
      link: "/study.html",
      target_url: "/study.html",
      badge_text: "⭐ Top Rated",
      badge_color: "#7C3AED",
      display_order: 1,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      title: "Official Telegram Channel",
      subtitle: "Get lecture PDFs, DPP sheets, and daily class alerts instantly on Telegram.",
      image_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1200",
      link: "https://t.me/PW_SENSEI",
      target_url: "https://t.me/PW_SENSEI",
      badge_text: "📱 Community",
      badge_color: "#24A1DE",
      display_order: 2,
      is_active: 1,
      created_at: new Date().toISOString()
    }
  ];

  const navLinks: NavLinkItem[] = [];

  const users: UserItem[] = [
    {
      id: 1,
      name: "Rohit Sharma",
      email: "rohit.student@gmail.com",
      xp: 450,
      enrolled_count: 3,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      name: "Ananya Verma",
      email: "ananya.v@gmail.com",
      xp: 620,
      enrolled_count: 4,
      created_at: new Date().toISOString()
    }
  ];

  return {
    settings: defaultSettings,
    batches,
    subjects,
    chapters,
    lectures,
    notes,
    quizzes,
    extra_resources: extraResources,
    teachers,
    announcements,
    banners,
    nav_links: navLinks,
    users,
    nextId: {
      subject: 8,
      chapter: 8,
      lecture: 5,
      note: 5,
      quiz: 3,
      extra_resource: 2,
      teacher: 4,
      announcement: 3,
      banner: 3,
      nav_link: 4,
      user: 3
    }
  };
}

async function syncFromDatabase(): Promise<void> {
  if (!pgPool) return;
  try {
    const defaultSeed = getDefaultSeedData();
    const settingsObj: any = { ...defaultSeed.settings };
    try {
      const sRes = await pgPool.query('SELECT key, value FROM settings');
      sRes.rows.forEach(r => { settingsObj[r.key] = r.value; });
    } catch (e) {
      console.warn('Could not query settings table:', e);
    }

    let batches = defaultSeed.batches;
    try {
      const batchesRes = await pgPool.query('SELECT * FROM batches');
      batches = batchesRes.rows;
    } catch (e) {
      console.warn('Could not query batches table:', e);
    }

    let subjects = defaultSeed.subjects;
    try {
      const subjectsRes = await pgPool.query('SELECT * FROM subjects');
      subjects = subjectsRes.rows;
    } catch (e) {
      console.warn('Could not query subjects table:', e);
    }

    let chapters = defaultSeed.chapters;
    try {
      const chaptersRes = await pgPool.query('SELECT * FROM chapters');
      chapters = chaptersRes.rows;
    } catch (e) {
      console.warn('Could not query chapters table:', e);
    }

    let lectures = defaultSeed.lectures;
    try {
      const lecturesRes = await pgPool.query('SELECT * FROM lectures');
      lectures = lecturesRes.rows;
    } catch (e) {
      console.warn('Could not query lectures table:', e);
    }

    let notes = defaultSeed.notes;
    try {
      const notesRes = await pgPool.query('SELECT * FROM notes');
      notes = notesRes.rows;
    } catch (e) {
      console.warn('Could not query notes table:', e);
    }

    let quizzes = defaultSeed.quizzes;
    try {
      const quizzesRes = await pgPool.query('SELECT * FROM quizzes');
      quizzes = quizzesRes.rows;
    } catch (e) {
      console.warn('Could not query quizzes table:', e);
    }

    let extraResources = defaultSeed.extra_resources;
    try {
      const extrasRes = await pgPool.query('SELECT * FROM extra_resources');
      extraResources = extrasRes.rows;
    } catch (e) {
      console.warn('Could not query extra_resources table:', e);
    }

    let teachers = defaultSeed.teachers;
    try {
      const teachersRes = await pgPool.query('SELECT * FROM teachers');
      teachers = teachersRes.rows;
    } catch (e) {
      console.warn('Could not query teachers table:', e);
    }

    let announcements = defaultSeed.announcements;
    try {
      const announcementsRes = await pgPool.query('SELECT * FROM announcements');
      announcements = announcementsRes.rows;
    } catch (e) {
      console.warn('Could not query announcements table:', e);
    }

    let banners = defaultSeed.banners;
    try {
      const bannersRes = await pgPool.query('SELECT * FROM banners');
      banners = bannersRes.rows;
    } catch (e) {
      console.warn('Could not query banners table:', e);
    }

    let navLinks = defaultSeed.nav_links;
    try {
      const navLinksRes = await pgPool.query('SELECT * FROM nav_links');
      navLinks = navLinksRes.rows;
    } catch (e) {
      console.warn('Could not query nav_links table:', e);
    }

    let users = defaultSeed.users;
    try {
      const usersRes = await pgPool.query('SELECT * FROM users');
      users = usersRes.rows;
    } catch (e) {
      console.warn('Could not query users table:', e);
    }

    const nextId = {
      subject: (subjects.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0)) + 1,
      chapter: (chapters.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0)) + 1,
      lecture: (lectures.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0)) + 1,
      note: (notes.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0)) + 1,
      quiz: (quizzes.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0)) + 1,
      extra_resource: (extraResources.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0)) + 1,
      teacher: (teachers.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0)) + 1,
      announcement: (announcements.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0)) + 1,
      banner: (banners.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0)) + 1,
      nav_link: (navLinks.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0)) + 1,
      user: (users.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0)) + 1,
    };

    dbMemory = {
      settings: settingsObj,
      batches,
      subjects,
      chapters,
      lectures,
      notes,
      quizzes,
      extra_resources: extraResources,
      teachers,
      announcements,
      banners,
      nav_links: navLinks,
      users,
      nextId
    };
    saveDatabase();
    console.log('✅ Synchronized database state into memory from PostgreSQL/CockroachDB');
  } catch (err) {
    console.error('Error syncing from database:', err);
  }
}

export async function initDatabase(): Promise<void> {
  if (!pgPool) {
    loadDatabase();
    return;
  }
  try {
    const schemaSqlPath = path.join(process.cwd(), 'schema.sql');
    if (fs.existsSync(schemaSqlPath)) {
      const schemaSql = fs.readFileSync(schemaSqlPath, 'utf8');
      await pgPool.query(schemaSql);
      console.log('✅ PostgreSQL/CockroachDB schema initialized successfully');
    }

    const migrations = [
      'ALTER TABLE batches ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0',
      'ALTER TABLE batches ADD COLUMN IF NOT EXISTS is_published INTEGER DEFAULT 1',
      'ALTER TABLE batches ADD COLUMN IF NOT EXISTS is_new INTEGER DEFAULT 1',
      'ALTER TABLE batches ADD COLUMN IF NOT EXISTS is_free INTEGER DEFAULT 1',
      'ALTER TABLE batches ADD COLUMN IF NOT EXISTS target_audience VARCHAR(255) DEFAULT \'For NEET/JEE Students\'',
      'ALTER TABLE batches ADD COLUMN IF NOT EXISTS language VARCHAR(50) DEFAULT \'Hinglish\'',
      'ALTER TABLE subjects ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0',
      'ALTER TABLE subjects ADD COLUMN IF NOT EXISTS default_teacher_name VARCHAR(255)',
      'ALTER TABLE subjects ADD COLUMN IF NOT EXISTS default_thumbnail_url TEXT',
      'ALTER TABLE subjects ADD COLUMN IF NOT EXISTS icon VARCHAR(50) DEFAULT \'📚\'',
      'ALTER TABLE subjects ADD COLUMN IF NOT EXISTS chapter_count INTEGER DEFAULT 0',
      'ALTER TABLE chapters ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0',
      'ALTER TABLE chapters ADD COLUMN IF NOT EXISTS is_published INTEGER DEFAULT 1',
      'ALTER TABLE chapters ADD COLUMN IF NOT EXISTS chapter_number INTEGER DEFAULT 1',
      'ALTER TABLE lectures ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 1',
      'ALTER TABLE lectures ADD COLUMN IF NOT EXISTS lecture_number INTEGER DEFAULT 1',
      'ALTER TABLE lectures ADD COLUMN IF NOT EXISTS video_type VARCHAR(50) DEFAULT \'lecture\'',
      'ALTER TABLE lectures ADD COLUMN IF NOT EXISTS is_published INTEGER DEFAULT 1',
      'ALTER TABLE lectures ADD COLUMN IF NOT EXISTS is_live INTEGER DEFAULT 0',
      'ALTER TABLE lectures ADD COLUMN IF NOT EXISTS is_today INTEGER DEFAULT 0',
      'ALTER TABLE lectures ADD COLUMN IF NOT EXISTS teacher_name VARCHAR(255)',
      'ALTER TABLE notes ADD COLUMN IF NOT EXISTS lecture_id INTEGER',
      'ALTER TABLE notes ADD COLUMN IF NOT EXISTS file_size VARCHAR(50) DEFAULT \'2.4 MB\'',
      'ALTER TABLE notes ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT \'note\'',
      'ALTER TABLE notes ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 1',
      'ALTER TABLE notes ADD COLUMN IF NOT EXISTS is_published INTEGER DEFAULT 1',
      'ALTER TABLE teachers ADD COLUMN IF NOT EXISTS batch_id VARCHAR(100)',
      'ALTER TABLE teachers ADD COLUMN IF NOT EXISTS default_thumbnail_url TEXT',
      'ALTER TABLE teachers ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0',
      'ALTER TABLE banners ADD COLUMN IF NOT EXISTS badge_text VARCHAR(100)',
      'ALTER TABLE banners ADD COLUMN IF NOT EXISTS badge_color VARCHAR(50)',
      'ALTER TABLE banners ADD COLUMN IF NOT EXISTS target_url TEXT',
      'ALTER TABLE banners ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0',
      'ALTER TABLE banners ADD COLUMN IF NOT EXISTS is_active INTEGER DEFAULT 1',
      'ALTER TABLE nav_links ADD COLUMN IF NOT EXISTS is_external INTEGER DEFAULT 0',
      'ALTER TABLE nav_links ADD COLUMN IF NOT EXISTS is_active INTEGER DEFAULT 1',
      'ALTER TABLE nav_links ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0'
    ];
    for (const mig of migrations) {
      try {
        await pgPool.query(mig);
      } catch (e) {
        // column already exists or table not yet created
      }
    }

    const batchRes = await pgPool.query('SELECT COUNT(*) as cnt FROM batches');
    const count = parseInt(batchRes.rows[0]?.cnt || '0', 10);
    if (count === 0) {
      console.log('🌱 Seeding initial data into PostgreSQL/CockroachDB...');
      const seed = loadDatabase();
      
      for (const [k, v] of Object.entries(seed.settings)) {
        await pgPool.query('INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value', [k, String(v)]);
      }
      for (const b of seed.batches) {
        await pgPool.query(`INSERT INTO batches (id, title, thumbnail_url, banner_url, language, target_audience, start_date, end_date, price, is_free, is_new, is_published, description, display_order)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) ON CONFLICT (id) DO NOTHING`,
          [b.id, b.title, b.thumbnail_url, b.banner_url, b.language, b.target_audience, b.start_date, b.end_date, b.price, b.is_free, b.is_new, b.is_published, b.description, b.display_order]);
      }
      for (const s of seed.subjects) {
        await pgPool.query(`INSERT INTO subjects (id, batch_id, name, default_teacher_name, default_thumbnail_url, icon, chapter_count, display_order)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING`,
          [s.id, s.batch_id, s.name, s.default_teacher_name, s.default_thumbnail_url, s.icon, s.chapter_count, s.display_order]);
      }
      for (const c of seed.chapters) {
        await pgPool.query(`INSERT INTO chapters (id, subject_id, chapter_number, title, description, display_order, is_published)
          VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING`,
          [c.id, c.subject_id, c.chapter_number, c.title, c.description, c.display_order, c.is_published]);
      }
      for (const l of seed.lectures) {
        await pgPool.query(`INSERT INTO lectures (id, chapter_id, title, external_link, duration, teacher_name, lecture_date, is_live, is_today, thumbnail_url, display_order, lecture_number, video_type, is_published)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) ON CONFLICT (id) DO NOTHING`,
          [l.id, l.chapter_id, l.title, l.external_link, l.duration, l.teacher_name, l.lecture_date, l.is_live, l.is_today, l.thumbnail_url, l.display_order, l.lecture_number, l.video_type, l.is_published]);
      }
      for (const n of seed.notes) {
        await pgPool.query(`INSERT INTO notes (id, chapter_id, lecture_id, title, external_link, file_size, type, display_order, is_published)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING`,
          [n.id, n.chapter_id, n.lecture_id, n.title, n.external_link, n.file_size, n.type, n.display_order, n.is_published]);
      }
      for (const q of seed.quizzes) {
        await pgPool.query(`INSERT INTO quizzes (id, chapter_id, lecture_id, title, total_questions, duration, external_link, is_published)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING`,
          [q.id, q.chapter_id, q.lecture_id, q.title, q.total_questions, q.duration, q.external_link, q.is_published]);
      }
      for (const e of seed.extra_resources) {
        await pgPool.query(`INSERT INTO extra_resources (id, lecture_id, title, url, resource_type, description, display_order)
          VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING`,
          [e.id, e.lecture_id, e.title, e.url, e.resource_type, e.description, e.display_order]);
      }
      for (const t of seed.teachers) {
        await pgPool.query(`INSERT INTO teachers (id, batch_id, name, photo_url, default_thumbnail_url, subject, subjects_taught, experience, bio, display_order)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (id) DO NOTHING`,
          [t.id, t.batch_id, t.name, t.photo_url, t.default_thumbnail_url, t.subject, t.subjects_taught, t.experience, t.bio, t.display_order]);
      }
      for (const b of seed.banners) {
        await pgPool.query(`INSERT INTO banners (id, title, subtitle, image_url, link, target_url, badge_text, badge_color, display_order, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (id) DO NOTHING`,
          [b.id, b.title, b.subtitle, b.image_url, b.link, b.target_url, b.badge_text, b.badge_color, b.display_order, b.is_active]);
      }
      for (const nl of seed.nav_links) {
        await pgPool.query(`INSERT INTO nav_links (id, label, url, icon, display_order, is_external, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING`,
          [nl.id, nl.label, nl.url, nl.icon, nl.display_order, nl.is_external, nl.is_active]);
      }
      for (const a of seed.announcements) {
        await pgPool.query(`INSERT INTO announcements (id, batch_id, message)
          VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING`,
          [a.id, a.batch_id, a.message]);
      }
      for (const u of seed.users) {
        await pgPool.query(`INSERT INTO users (id, name, email, xp, enrolled_count)
          VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING`,
          [u.id, u.name, u.email, u.xp, u.enrolled_count]);
      }
      console.log('✅ Seed data initialized in CockroachDB / PostgreSQL');
    } else {
      console.log('📦 Loading existing data from CockroachDB / PostgreSQL into local state...');
      await syncFromDatabase();
    }
  } catch (err) {
    console.error('Error during CockroachDB / PostgreSQL initialization:', err);
  }
}

function loadDatabase(): InMemoryDB {
  if (dbMemory) return dbMemory;

  if (fs.existsSync(DATA_FILE)) {
    try {
      const content = fs.readFileSync(DATA_FILE, 'utf8');
      dbMemory = JSON.parse(content);
      return dbMemory!;
    } catch (err) {
      console.error('Failed reading database file, loading default seeds:', err);
    }
  }

  dbMemory = getDefaultSeedData();
  saveDatabase();
  return dbMemory;
}

export function saveDatabase(): void {
  if (!dbMemory) return;
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(dbMemory, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving database to file:', err);
  }
}

// -------------------------------------------------------------
// Database Operations / Repositories
// -------------------------------------------------------------

export const db = {
  // --- SETTINGS ---
  getSettings(): SiteSettings {
    const db = loadDatabase();
    return { ...db.settings };
  },

  updateSettings(newSettings: Partial<SiteSettings>): SiteSettings {
    const db = loadDatabase();
    db.settings = { ...db.settings, ...newSettings };
    saveDatabase();
    if (pgPool) {
      (async () => {
        try {
          for (const [k, v] of Object.entries(newSettings)) {
            await pgPool.query(
              'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP',
              [k, String(v ?? '')]
            );
          }
        } catch (err) {
          console.error('Error syncing settings to PostgreSQL/CockroachDB:', err);
        }
      })();
    }
    return db.settings;
  },

  // --- BATCHES ---
  getBatches(query?: string): Batch[] {
    const db = loadDatabase();
    let result = db.batches.filter(b => Number(b.is_published) !== 0);
    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      result = result.filter(b =>
        b.title.toLowerCase().includes(q) ||
        (b.target_audience && b.target_audience.toLowerCase().includes(q)) ||
        (b.language && b.language.toLowerCase().includes(q))
      );
    }
    return result.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  },

  getAllAdminBatches(): Batch[] {
    const db = loadDatabase();
    return [...db.batches].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  },

  getBatchById(id: string): any {
    const db = loadDatabase();
    const batch = db.batches.find(b => String(b.id) === String(id));
    if (!batch) return null;

    const subjects = db.subjects
      .filter(s => String(s.batch_id) === String(id))
      .map(s => {
        const chs = db.chapters.filter(c => c.subject_id === s.id && Number(c.is_published) !== 0);
        return {
          ...s,
          chapter_count: chs.length > 0 ? chs.length : (s.chapter_count || 0)
        };
      })
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

    const announcements = db.announcements
      .filter(a => String(a.batch_id) === String(id))
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

    const teachers = db.teachers
      .filter(t => !t.batch_id || String(t.batch_id) === String(id))
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

    return {
      ...batch,
      subjects,
      announcements,
      teachers
    };
  },

  createBatch(data: Partial<Batch>): Batch {
    const db = loadDatabase();
    const newId = data.id || String(Date.now());
    const newBatch: Batch = {
      id: newId,
      title: data.title || 'Untitled Batch',
      thumbnail_url: data.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800',
      banner_url: data.banner_url || '',
      language: data.language || 'Hinglish',
      target_audience: data.target_audience || 'For NEET/JEE Students',
      start_date: data.start_date || 'Immediate',
      end_date: data.end_date || '2025',
      price: typeof data.price === 'number' ? data.price : (data.is_free ? 0 : 0),
      is_free: data.is_free !== undefined ? Number(data.is_free) : 1,
      is_new: data.is_new !== undefined ? Number(data.is_new) : 1,
      is_published: data.is_published !== undefined ? Number(data.is_published) : 1,
      description: data.description || '',
      display_order: data.display_order || db.batches.length + 1,
      created_at: new Date().toISOString()
    };
    db.batches.push(newBatch);
    saveDatabase();
    if (pgPool) {
      (async () => {
        try {
          await pgPool.query(
            `INSERT INTO batches (id, title, thumbnail_url, banner_url, language, target_audience, start_date, end_date, price, is_free, is_new, is_published, description, display_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
             ON CONFLICT (id) DO UPDATE SET
               title = EXCLUDED.title, thumbnail_url = EXCLUDED.thumbnail_url, banner_url = EXCLUDED.banner_url,
               language = EXCLUDED.language, target_audience = EXCLUDED.target_audience,
               start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date, price = EXCLUDED.price,
               is_free = EXCLUDED.is_free, is_new = EXCLUDED.is_new, is_published = EXCLUDED.is_published,
               description = EXCLUDED.description, display_order = EXCLUDED.display_order`,
            [newBatch.id, newBatch.title, newBatch.thumbnail_url, newBatch.banner_url, newBatch.language,
             newBatch.target_audience, newBatch.start_date, newBatch.end_date, newBatch.price,
             newBatch.is_free, newBatch.is_new, newBatch.is_published, newBatch.description, newBatch.display_order]
          );
        } catch (err) {
          console.error('Error creating batch in PostgreSQL/CockroachDB:', err);
        }
      })();
    }
    return newBatch;
  },

  updateBatch(id: string, data: Partial<Batch>): Batch | null {
    const db = loadDatabase();
    const idx = db.batches.findIndex(b => String(b.id) === String(id));
    if (idx === -1) return null;
    db.batches[idx] = {
      ...db.batches[idx],
      ...data,
      id: String(id) // Ensure ID remains immutable
    };
    saveDatabase();
    const updatedBatch = db.batches[idx];
    if (pgPool) {
      (async () => {
        try {
          await pgPool.query(
            `UPDATE batches SET title = $1, thumbnail_url = $2, banner_url = $3, language = $4, target_audience = $5,
             start_date = $6, end_date = $7, price = $8, is_free = $9, is_new = $10, is_published = $11,
             description = $12, display_order = $13 WHERE id::text = $14`,
            [updatedBatch.title, updatedBatch.thumbnail_url, updatedBatch.banner_url, updatedBatch.language,
             updatedBatch.target_audience, updatedBatch.start_date, updatedBatch.end_date, updatedBatch.price,
             updatedBatch.is_free, updatedBatch.is_new, updatedBatch.is_published, updatedBatch.description,
             updatedBatch.display_order, String(id)]
          );
        } catch (err) {
          console.error('Error updating batch in PostgreSQL/CockroachDB:', err);
        }
      })();
    }
    return updatedBatch;
  },

  async deleteBatch(id: string): Promise<boolean> {
    const db = loadDatabase();
    const strId = String(id);
    const initLen = db.batches.length;
    db.batches = db.batches.filter(b => String(b.id) !== strId);
    if (db.batches.length === initLen) return false;

    // Cascade delete related subjects, chapters, content, announcements
    const subIds = db.subjects.filter(s => String(s.batch_id) === strId).map(s => s.id);
    db.subjects = db.subjects.filter(s => String(s.batch_id) !== strId);
    
    const chIds = db.chapters.filter(c => subIds.map(Number).includes(Number(c.subject_id))).map(c => c.id);
    db.chapters = db.chapters.filter(c => !subIds.map(Number).includes(Number(c.subject_id)));

    const lecIds = db.lectures.filter(l => chIds.map(Number).includes(Number(l.chapter_id))).map(l => l.id);
    db.lectures = db.lectures.filter(l => !chIds.map(Number).includes(Number(l.chapter_id)));
    db.notes = db.notes.filter(n => !chIds.map(Number).includes(Number(n.chapter_id)));
    db.quizzes = db.quizzes.filter(q => !chIds.map(Number).includes(Number(q.chapter_id)));
    db.extra_resources = db.extra_resources.filter(e => !lecIds.map(Number).includes(Number(e.lecture_id)));
    db.announcements = db.announcements.filter(a => String(a.batch_id) !== strId);
    db.teachers.forEach(t => {
      if (String(t.batch_id) === strId) t.batch_id = null as any;
    });

    saveDatabase();

    if (pgPool) {
      try {
        await pgPool.query('UPDATE teachers SET batch_id = NULL WHERE batch_id::text = $1', [strId]);
      } catch (_) {}
      try {
        await pgPool.query('DELETE FROM batches WHERE id::text = $1', [strId]);
      } catch (err) {
        console.error('Error executing deleteBatch on PostgreSQL/CockroachDB:', err);
      }
    }

    return true;
  },

  // --- SUBJECTS ---
  getSubjectsByBatch(batchId: string): Subject[] {
    const db = loadDatabase();
    return db.subjects
      .filter(s => String(s.batch_id) === String(batchId))
      .map(s => {
        const chs = db.chapters.filter(c => c.subject_id === s.id);
        return {
          ...s,
          chapter_count: chs.length > 0 ? chs.length : (s.chapter_count || 0)
        };
      })
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  },

  getSubjectById(id: number): any {
    const db = loadDatabase();
    const subject = db.subjects.find(s => Number(s.id) === Number(id));
    if (!subject) return null;

    const batch = db.batches.find(b => String(b.id) === String(subject.batch_id));
    const chapters = db.chapters
      .filter(c => Number(c.subject_id) === Number(subject.id) && Number(c.is_published) !== 0)
      .sort((a, b) => (Number(a.chapter_number) || Number(a.display_order) || 0) - (Number(b.chapter_number) || Number(b.display_order) || 0))
      .map(c => {
        const lecs = db.lectures.filter(l => Number(l.chapter_id) === Number(c.id) && Number(l.is_published) !== 0);
        const nts = db.notes.filter(n => Number(n.chapter_id) === Number(c.id) && Number(n.is_published) !== 0);
        const qzs = db.quizzes.filter(q => Number(q.chapter_id) === Number(c.id) && Number(q.is_published) !== 0);
        return {
          ...c,
          lecture_count: lecs.length,
          notes_count: nts.filter(n => n.type === 'note').length,
          dpp_count: nts.filter(n => n.type === 'dpp_pdf').length + lecs.filter(l => l.video_type === 'dpp_video').length,
          quiz_count: qzs.length
        };
      });

    let totalLecs = 0;
    let totalNotes = 0;
    let totalDpps = 0;
    chapters.forEach(c => {
      totalLecs += c.lecture_count;
      totalNotes += c.notes_count;
      totalDpps += c.dpp_count;
    });

    return {
      subject,
      batch: batch || { id: subject.batch_id, title: 'Batch' },
      chapters,
      summary: {
        total_chapters: chapters.length,
        total_lectures: totalLecs,
        total_notes: totalNotes,
        total_dpps: totalDpps
      }
    };
  },

  createSubject(batchIdOrData: string | Partial<Subject>, optionalData?: Partial<Subject>): Subject {
    const db = loadDatabase();
    const batchId = typeof batchIdOrData === 'string' ? batchIdOrData : (batchIdOrData.batch_id || '');
    const data = typeof batchIdOrData === 'string' ? (optionalData || {}) : batchIdOrData;
    const newSubject: Subject = {
      id: db.nextId.subject++,
      batch_id: String(batchId),
      name: data.name || 'New Subject',
      default_teacher_name: data.default_teacher_name || '',
      default_thumbnail_url: data.default_thumbnail_url || 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=600',
      icon: data.icon || '📚',
      chapter_count: data.chapter_count || 0,
      display_order: data.display_order || db.subjects.length + 1,
      created_at: new Date().toISOString()
    };
    db.subjects.push(newSubject);
    saveDatabase();
    if (pgPool) {
      (async () => {
        try {
          await pgPool.query(
            `INSERT INTO subjects (id, batch_id, name, default_teacher_name, default_thumbnail_url, icon, chapter_count, display_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             ON CONFLICT (id) DO UPDATE SET
               batch_id = EXCLUDED.batch_id, name = EXCLUDED.name, default_teacher_name = EXCLUDED.default_teacher_name,
               default_thumbnail_url = EXCLUDED.default_thumbnail_url, icon = EXCLUDED.icon,
               chapter_count = EXCLUDED.chapter_count, display_order = EXCLUDED.display_order`,
            [newSubject.id, newSubject.batch_id, newSubject.name, newSubject.default_teacher_name,
             newSubject.default_thumbnail_url, newSubject.icon, newSubject.chapter_count, newSubject.display_order]
          );
        } catch (err) {
          console.error('Error creating subject in PostgreSQL/CockroachDB:', err);
        }
      })();
    }
    return newSubject;
  },

  updateSubject(id: number, data: Partial<Subject>): Subject | null {
    const db = loadDatabase();
    const idx = db.subjects.findIndex(s => Number(s.id) === Number(id));
    if (idx === -1) return null;
    db.subjects[idx] = { ...db.subjects[idx], ...data, id: Number(id) };
    saveDatabase();
    const updatedSubject = db.subjects[idx];
    if (pgPool) {
      (async () => {
        try {
          await pgPool.query(
            `UPDATE subjects SET batch_id = $1, name = $2, default_teacher_name = $3, default_thumbnail_url = $4,
             icon = $5, chapter_count = $6, display_order = $7 WHERE id = $8`,
            [updatedSubject.batch_id, updatedSubject.name, updatedSubject.default_teacher_name,
             updatedSubject.default_thumbnail_url, updatedSubject.icon, updatedSubject.chapter_count,
             updatedSubject.display_order, Number(id)]
          );
        } catch (err) {
          console.error('Error updating subject in PostgreSQL/CockroachDB:', err);
        }
      })();
    }
    return updatedSubject;
  },

  async deleteSubject(id: number): Promise<boolean> {
    const db = loadDatabase();
    const numId = Number(id);
    const initLen = db.subjects.length;
    db.subjects = db.subjects.filter(s => Number(s.id) !== numId);
    if (db.subjects.length === initLen) return false;

    const chIds = db.chapters.filter(c => Number(c.subject_id) === Number(numId)).map(c => c.id);
    db.chapters = db.chapters.filter(c => c.subject_id !== numId);
    const lecIds = db.lectures.filter(l => chIds.map(Number).includes(Number(l.chapter_id))).map(l => l.id);
    db.lectures = db.lectures.filter(l => !chIds.map(Number).includes(Number(l.chapter_id)));
    db.notes = db.notes.filter(n => !chIds.map(Number).includes(Number(n.chapter_id)));
    db.quizzes = db.quizzes.filter(q => !chIds.map(Number).includes(Number(q.chapter_id)));
    db.extra_resources = db.extra_resources.filter(e => !lecIds.map(Number).includes(Number(e.lecture_id)));

    saveDatabase();

    if (pgPool) {
      try {
        await pgPool.query('DELETE FROM subjects WHERE id = $1', [numId]);
      } catch (err) {
        console.error('Error executing deleteSubject on PostgreSQL/CockroachDB:', err);
      }
    }

    return true;
  },

  // --- CHAPTERS ---
  getChaptersBySubject(subjectId: number): Chapter[] {
    const db = loadDatabase();
    return db.chapters
      .filter(c => Number(c.subject_id) === Number(subjectId))
      .sort((a, b) => (a.chapter_number || a.display_order || 0) - (b.chapter_number || b.display_order || 0));
  },

  getChapterById(id: number): any {
    const db = loadDatabase();
    const chapter = db.chapters.find(c => Number(c.id) === Number(id));
    if (!chapter) return null;

    const subject = db.subjects.find(s => s.id === chapter.subject_id);
    const batch = subject ? db.batches.find(b => String(b.id) === String(subject.batch_id)) : null;
    const sibling_chapters = subject
      ? db.chapters
          .filter(c => Number(c.subject_id) === Number(subject.id) && Number(c.is_published) !== 0)
          .sort((a, b) => (a.chapter_number || 0) - (b.chapter_number || 0))
      : [];

    const rawLectures = db.lectures.filter(l => Number(l.chapter_id) === Number(chapter.id) && Number(l.is_published) !== 0 && l.video_type !== 'dpp_video');
    const rawDppVideos = db.lectures.filter(l => Number(l.chapter_id) === Number(chapter.id) && Number(l.is_published) !== 0 && l.video_type === 'dpp_video');
    const rawNotes = db.notes.filter(n => Number(n.chapter_id) === Number(chapter.id) && Number(n.is_published) !== 0 && n.type === 'note');
    const rawDppPdfs = db.notes.filter(n => Number(n.chapter_id) === Number(chapter.id) && Number(n.is_published) !== 0 && n.type === 'dpp_pdf');
    const rawQuizzes = db.quizzes.filter(q => Number(q.chapter_id) === Number(chapter.id) && Number(q.is_published) !== 0);

    // Attach nested notes, dpp_pdf, dpp_video, dpp_quiz, and extra_resources to each lecture
    const populatedLectures = rawLectures.map(lec => {
      const lecNote = db.notes.find(n => n.lecture_id === lec.id && n.type === 'note');
      const lecDppPdf = db.notes.find(n => n.lecture_id === lec.id && n.type === 'dpp_pdf');
      const lecDppVid = db.lectures.find(l => l.chapter_id === chapter.id && l.video_type === 'dpp_video' && l.lecture_number === lec.lecture_number);
      const lecQuiz = db.quizzes.find(q => q.lecture_id === lec.id);
      const extras = db.extra_resources.filter(e => Number(e.lecture_id) === Number(lec.id));

      return {
        ...lec,
        notes: lecNote || null,
        dpp_pdf: lecDppPdf || null,
        dpp_video: lecDppVid || null,
        dpp_quiz: lecQuiz || null,
        extra_resources: extras
      };
    });

    return {
      chapter,
      subject: subject || { id: chapter.subject_id, name: 'Subject', icon: '📚' },
      batch: batch || { id: '1', title: 'Batch' },
      sibling_chapters,
      counts: {
        lectures: populatedLectures.length,
        notes: rawNotes.length,
        dpp_pdfs: rawDppPdfs.length,
        dpp_videos: rawDppVideos.length,
        dpp_quizzes: rawQuizzes.length
      },
      content: {
        lectures: populatedLectures,
        notes: rawNotes,
        dpp_pdfs: rawDppPdfs,
        dpp_videos: rawDppVideos,
        dpp_quizzes: rawQuizzes
      }
    };
  },

  createChapter(data: Partial<Chapter>): Chapter {
    const db = loadDatabase();
    const newChapter: Chapter = {
      id: db.nextId.chapter++,
      subject_id: Number(data.subject_id),
      chapter_number: Number(data.chapter_number) || 1,
      title: data.title || 'New Chapter',
      description: data.description || '',
      display_order: Number(data.display_order) || 0,
      is_published: data.is_published !== undefined ? Number(data.is_published) : 1,
      created_at: new Date().toISOString()
    };
    db.chapters.push(newChapter);
    saveDatabase();
    if (pgPool) {
      (async () => {
        try {
          await pgPool.query(
            `INSERT INTO chapters (id, subject_id, chapter_number, title, description, display_order, is_published)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (id) DO UPDATE SET
               subject_id = EXCLUDED.subject_id, chapter_number = EXCLUDED.chapter_number, title = EXCLUDED.title,
               description = EXCLUDED.description, display_order = EXCLUDED.display_order, is_published = EXCLUDED.is_published`,
            [newChapter.id, newChapter.subject_id, newChapter.chapter_number, newChapter.title,
             newChapter.description, newChapter.display_order, newChapter.is_published]
          );
        } catch (err) {
          console.error('Error creating chapter in PostgreSQL/CockroachDB:', err);
        }
      })();
    }
    return newChapter;
  },

  updateChapter(id: number, data: Partial<Chapter>): Chapter | null {
    const db = loadDatabase();
    const idx = db.chapters.findIndex(c => Number(c.id) === Number(id));
    if (idx === -1) return null;
    db.chapters[idx] = { ...db.chapters[idx], ...data, id: Number(id) };
    saveDatabase();
    const updatedChapter = db.chapters[idx];
    if (pgPool) {
      (async () => {
        try {
          await pgPool.query(
            `UPDATE chapters SET subject_id = $1, chapter_number = $2, title = $3, description = $4,
             display_order = $5, is_published = $6 WHERE id = $7`,
            [updatedChapter.subject_id, updatedChapter.chapter_number, updatedChapter.title,
             updatedChapter.description, updatedChapter.display_order, updatedChapter.is_published, Number(id)]
          );
        } catch (err) {
          console.error('Error updating chapter in PostgreSQL/CockroachDB:', err);
        }
      })();
    }
    return updatedChapter;
  },

  async deleteChapter(id: number): Promise<boolean> {
    const db = loadDatabase();
    const numId = Number(id);
    const initLen = db.chapters.length;
    db.chapters = db.chapters.filter(c => Number(c.id) !== numId);
    if (db.chapters.length === initLen) return false;

    const lecIds = db.lectures.filter(l => Number(l.chapter_id) === Number(numId)).map(l => l.id);
    db.lectures = db.lectures.filter(l => l.chapter_id !== numId);
    db.notes = db.notes.filter(n => n.chapter_id !== numId);
    db.quizzes = db.quizzes.filter(q => q.chapter_id !== numId);
    db.extra_resources = db.extra_resources.filter(e => !lecIds.map(Number).includes(Number(e.lecture_id)));

    saveDatabase();

    if (pgPool) {
      try {
        await pgPool.query('DELETE FROM chapters WHERE id = $1', [numId]);
      } catch (err) {
        console.error('Error executing deleteChapter on PostgreSQL/CockroachDB:', err);
      }
    }

    return true;
  },

  // --- CHAPTER CONTENT FOR ADMIN ---
  getAdminChapterContent(chapterId: number): any {
    const db = loadDatabase();
    const chId = Number(chapterId);
    const chapter = db.chapters.find(c => Number(c.id) === Number(chId));

    const lecs = db.lectures.filter(l => l.chapter_id === chId && l.video_type !== 'dpp_video');
    const dppVideos = db.lectures.filter(l => l.chapter_id === chId && l.video_type === 'dpp_video');
    const notes = db.notes.filter(n => n.chapter_id === chId && n.type === 'note');
    const dppPdfs = db.notes.filter(n => n.chapter_id === chId && n.type === 'dpp_pdf');
    const quizzes = db.quizzes.filter(q => Number(q.chapter_id) === Number(chId));

    // Populate extra resources and connected entities for admin view
    const populatedLecs = lecs.map(l => {
      const extras = db.extra_resources.filter(e => e.lecture_id === l.id);
      const note = db.notes.find(n => n.lecture_id === l.id && n.type === 'note');
      const dppPdf = db.notes.find(n => n.lecture_id === l.id && n.type === 'dpp_pdf');
      const dppVid = db.lectures.find(v => v.chapter_id === chId && v.video_type === 'dpp_video' && v.lecture_number === l.lecture_number);
      const quiz = db.quizzes.find(q => q.lecture_id === l.id);

      return {
        ...l,
        extra_resources: extras,
        notes: note || null,
        dpp_pdf: dppPdf || null,
        dpp_video: dppVid || null,
        dpp_quiz: quiz || null
      };
    });

    return {
      chapter,
      counts: {
        lectures: lecs.length,
        notes: notes.length,
        dpp_pdfs: dppPdfs.length,
        dpp_videos: dppVideos.length,
        quizzes: quizzes.length
      },
      lectures: populatedLecs,
      notes,
      dpp_pdfs: dppPdfs,
      dpp_videos: dppVideos,
      dpp_quizzes: quizzes
    };
  },

  getLectureById(lectureId: number): any {
    const db = loadDatabase();
    const lec = db.lectures.find(l => Number(l.id) === Number(lectureId));
    if (!lec) return null;

    const extras = db.extra_resources.filter(e => Number(e.lecture_id) === Number(lec.id));
    const note = db.notes.find(n => n.lecture_id === lec.id && n.type === 'note');
    const dppPdf = db.notes.find(n => n.lecture_id === lec.id && n.type === 'dpp_pdf');
    const dppVid = db.lectures.find(v => v.chapter_id === lec.chapter_id && v.video_type === 'dpp_video' && v.lecture_number === lec.lecture_number);
    const quiz = db.quizzes.find(q => q.lecture_id === lec.id);

    return {
      ...lec,
      notes_title: note?.title || '',
      notes_pdf_url: note?.external_link || '',
      notes_file_size: note?.file_size || '2.4 MB',
      dpp_pdf_title: dppPdf?.title || '',
      dpp_pdf_url: dppPdf?.external_link || '',
      dpp_pdf_file_size: dppPdf?.file_size || '1.5 MB',
      dpp_video_title: dppVid?.title || '',
      dpp_video_url: dppVid?.external_link || '',
      dpp_video_duration: dppVid?.duration || '30 mins',
      dpp_quiz_title: quiz?.title || '',
      dpp_quiz_total_questions: quiz?.total_questions || 10,
      dpp_quiz_duration: quiz?.duration || 15,
      extra_resources: extras
    };
  },

  createUnifiedLecture(chapterId: number, payload: any): any {
    const db = loadDatabase();
    const chId = Number(chapterId);

    const lecNumber = Number(payload.lecture_number) || Number(payload.lecture_order) || db.lectures.filter(l => Number(l.chapter_id) === Number(chId)).length + 1;
    const lectureId = db.nextId.lecture++;

    const newLecture: Lecture = {
      id: lectureId,
      chapter_id: chId,
      title: payload.lecture_title || `Lecture ${lecNumber}`,
      external_link: payload.lecture_video_url || '',
      duration: payload.lecture_duration || '50 mins',
      teacher_name: payload.teacher_name || '',
      lecture_date: payload.lecture_date || new Date().toISOString().split('T')[0],
      is_live: payload.is_live !== undefined ? Number(payload.is_live) : 0,
      is_today: (function() {
        if (payload.is_today !== undefined) return Number(payload.is_today);
        const d = String(payload.lecture_date || '').trim().slice(0, 10);
        const nowIst = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
        const todayStr = nowIst.toISOString().slice(0, 10);
        return d === todayStr ? 1 : 0;
      })(),
      thumbnail_url: (function() {
        const provided = (payload.thumbnail_url || '').trim();
        if (provided && !provided.includes('unsplash.com/photo-1516321318423')) return provided;
        const tName = (payload.teacher_name || '').trim();
        if (tName) {
          const teacher = db.teachers.find(t => String(t.name).toLowerCase() === tName.toLowerCase()
            || String(t.name).toLowerCase().includes(tName.toLowerCase())
            || tName.toLowerCase().includes(String(t.name).toLowerCase()));
          if (teacher) {
            return teacher.default_thumbnail_url || teacher.photo_url || provided || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600';
          }
        }
        // fallback: subject default teacher thumbnail via chapter
        const ch = db.chapters.find(c => Number(c.id) === chId);
        if (ch) {
          const sub = db.subjects.find(s => Number(s.id) === Number(ch.subject_id));
          if (sub && sub.default_thumbnail_url) return sub.default_thumbnail_url;
        }
        return provided || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600';
      })(),
      display_order: Number(payload.lecture_order) || lecNumber,
      lecture_number: lecNumber,
      video_type: 'lecture',
      is_published: payload.is_published !== undefined ? Number(payload.is_published) : 1,
      created_at: new Date().toISOString()
    };
    db.lectures.push(newLecture);

    // Optional Notes (save if title OR url provided)
    if ((payload.notes_title && String(payload.notes_title).trim()) || (payload.notes_pdf_url && String(payload.notes_pdf_url).trim())) {
      db.notes.push({
        id: db.nextId.note++,
        chapter_id: chId,
        lecture_id: lectureId,
        title: (payload.notes_title && String(payload.notes_title).trim()) || 'Class Notes',
        external_link: (payload.notes_pdf_url && String(payload.notes_pdf_url).trim()) || '',
        file_size: payload.notes_file_size || '2.4 MB',
        type: 'note',
        display_order: lecNumber,
        is_published: 1,
        created_at: new Date().toISOString()
      });
    }

    // Optional DPP PDF (save if title OR url provided)
    if ((payload.dpp_pdf_title && String(payload.dpp_pdf_title).trim()) || (payload.dpp_pdf_url && String(payload.dpp_pdf_url).trim())) {
      db.notes.push({
        id: db.nextId.note++,
        chapter_id: chId,
        lecture_id: lectureId,
        title: payload.dpp_pdf_title,
        external_link: payload.dpp_pdf_url,
        file_size: payload.dpp_pdf_file_size || '1.5 MB',
        type: 'dpp_pdf',
        display_order: lecNumber,
        is_published: 1,
        created_at: new Date().toISOString()
      });
    }

    // Optional DPP Video
    if (payload.dpp_video_title && payload.dpp_video_url) {
      db.lectures.push({
        id: db.nextId.lecture++,
        chapter_id: chId,
        title: payload.dpp_video_title,
        external_link: payload.dpp_video_url,
        duration: payload.dpp_video_duration || '30 mins',
        teacher_name: payload.teacher_name || '',
        lecture_date: payload.lecture_date || new Date().toISOString().split('T')[0],
        is_live: 0,
        is_today: 0,
        thumbnail_url: payload.thumbnail_url || 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=600',
        display_order: lecNumber,
        lecture_number: lecNumber,
        video_type: 'dpp_video',
        is_published: 1,
        created_at: new Date().toISOString()
      });
    }

    // Optional Quiz
    if (payload.dpp_quiz_title) {
      db.quizzes.push({
        id: db.nextId.quiz++,
        chapter_id: chId,
        lecture_id: lectureId,
        title: payload.dpp_quiz_title,
        total_questions: Number(payload.dpp_quiz_total_questions) || 10,
        duration: Number(payload.dpp_quiz_duration) || 15,
        external_link: '',
        is_published: 1,
        created_at: new Date().toISOString()
      });
    }

    // Extra Resources
    if (Array.isArray(payload.extra_resources)) {
      payload.extra_resources.forEach((r: any, idx: number) => {
        if (r.title && r.url) {
          db.extra_resources.push({
            id: db.nextId.extra_resource++,
            lecture_id: lectureId,
            title: r.title,
            url: r.url,
            resource_type: r.resource_type || 'pdf',
            description: r.description || '',
            display_order: idx + 1,
            created_at: new Date().toISOString()
          });
        }
      });
    }

    saveDatabase();
    if (pgPool) {
      (async () => {
        try {
          // Re-read current state for related items
          const mem = loadDatabase();
          const lec = mem.lectures.find(l => l.id === newLecture.id);
          if (lec) {
            await pgPool.query(
              `INSERT INTO lectures (id, chapter_id, title, external_link, duration, teacher_name, lecture_date, is_live, is_today, thumbnail_url, display_order, lecture_number, video_type, is_published)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
               ON CONFLICT (id) DO UPDATE SET
                 chapter_id=EXCLUDED.chapter_id, title=EXCLUDED.title, external_link=EXCLUDED.external_link,
                 duration=EXCLUDED.duration, teacher_name=EXCLUDED.teacher_name, lecture_date=EXCLUDED.lecture_date,
                 is_live=EXCLUDED.is_live, is_today=EXCLUDED.is_today, thumbnail_url=EXCLUDED.thumbnail_url,
                 display_order=EXCLUDED.display_order, lecture_number=EXCLUDED.lecture_number,
                 video_type=EXCLUDED.video_type, is_published=EXCLUDED.is_published`,
              [lec.id, lec.chapter_id, lec.title, lec.external_link, lec.duration, lec.teacher_name,
               lec.lecture_date, lec.is_live, lec.is_today, lec.thumbnail_url, lec.display_order,
               lec.lecture_number, lec.video_type, lec.is_published]
            );
          }
          // Sync notes for this lecture
          for (const n of mem.notes.filter(n => n.lecture_id === newLecture.id)) {
            await pgPool.query(
              `INSERT INTO notes (id, chapter_id, lecture_id, title, external_link, file_size, type, display_order, is_published)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
               ON CONFLICT (id) DO UPDATE SET
                 chapter_id=EXCLUDED.chapter_id, lecture_id=EXCLUDED.lecture_id, title=EXCLUDED.title,
                 external_link=EXCLUDED.external_link, file_size=EXCLUDED.file_size, type=EXCLUDED.type,
                 display_order=EXCLUDED.display_order, is_published=EXCLUDED.is_published`,
              [n.id, n.chapter_id, n.lecture_id, n.title, n.external_link, n.file_size, n.type, n.display_order, n.is_published]
            );
          }
          // Sync quizzes for this lecture
          for (const q of mem.quizzes.filter(q => q.lecture_id === newLecture.id)) {
            await pgPool.query(
              `INSERT INTO quizzes (id, chapter_id, lecture_id, title, total_questions, duration, external_link, is_published)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
               ON CONFLICT (id) DO UPDATE SET
                 chapter_id=EXCLUDED.chapter_id, lecture_id=EXCLUDED.lecture_id, title=EXCLUDED.title,
                 total_questions=EXCLUDED.total_questions, duration=EXCLUDED.duration,
                 external_link=EXCLUDED.external_link, is_published=EXCLUDED.is_published`,
              [q.id, q.chapter_id, q.lecture_id, q.title, q.total_questions, q.duration, q.external_link, q.is_published]
            );
          }
          // Sync dpp videos (other lectures with same chapter + dpp_video type)
          for (const dv of mem.lectures.filter(l => l.chapter_id === newLecture.chapter_id && l.video_type === 'dpp_video' && l.lecture_number === newLecture.lecture_number)) {
            await pgPool.query(
              `INSERT INTO lectures (id, chapter_id, title, external_link, duration, teacher_name, lecture_date, is_live, is_today, thumbnail_url, display_order, lecture_number, video_type, is_published)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
               ON CONFLICT (id) DO UPDATE SET
                 chapter_id=EXCLUDED.chapter_id, title=EXCLUDED.title, external_link=EXCLUDED.external_link,
                 duration=EXCLUDED.duration, teacher_name=EXCLUDED.teacher_name, lecture_date=EXCLUDED.lecture_date,
                 is_live=EXCLUDED.is_live, is_today=EXCLUDED.is_today, thumbnail_url=EXCLUDED.thumbnail_url,
                 display_order=EXCLUDED.display_order, lecture_number=EXCLUDED.lecture_number,
                 video_type=EXCLUDED.video_type, is_published=EXCLUDED.is_published`,
              [dv.id, dv.chapter_id, dv.title, dv.external_link, dv.duration, dv.teacher_name,
               dv.lecture_date, dv.is_live, dv.is_today, dv.thumbnail_url, dv.display_order,
               dv.lecture_number, dv.video_type, dv.is_published]
            );
          }
          // Sync extra resources
          for (const e of mem.extra_resources.filter(e => e.lecture_id === newLecture.id)) {
            await pgPool.query(
              `INSERT INTO extra_resources (id, lecture_id, title, url, resource_type, description, display_order)
               VALUES ($1,$2,$3,$4,$5,$6,$7)
               ON CONFLICT (id) DO UPDATE SET
                 lecture_id=EXCLUDED.lecture_id, title=EXCLUDED.title, url=EXCLUDED.url,
                 resource_type=EXCLUDED.resource_type, description=EXCLUDED.description, display_order=EXCLUDED.display_order`,
              [e.id, e.lecture_id, e.title, e.url, e.resource_type, e.description, e.display_order]
            );
          }
        } catch (err) {
          console.error('Error creating unified lecture in PostgreSQL/CockroachDB:', err);
        }
      })();
    }
    return newLecture;
  },

  updateUnifiedLecture(lectureId: number, payload: any): any {
    const db = loadDatabase();
    const lecId = Number(lectureId);
    const lecIdx = db.lectures.findIndex(l => Number(l.id) === lecId);
    if (lecIdx === -1) return null;

    const existingLec = db.lectures[lecIdx];
    const chId = Number(existingLec.chapter_id);
    const lecNumber = Number(payload.lecture_number) || Number(payload.lecture_order) || existingLec.lecture_number || 1;

    // Auto teacher/subject thumbnail if blank or default
    let resolvedThumb = payload.thumbnail_url !== undefined ? payload.thumbnail_url : existingLec.thumbnail_url;
    const tName = (payload.teacher_name !== undefined ? payload.teacher_name : existingLec.teacher_name) || '';
    if (!resolvedThumb || String(resolvedThumb).includes('unsplash.com/photo-1516321318423')) {
      if (tName) {
        const teacher = db.teachers.find(t => String(t.name).toLowerCase() === String(tName).toLowerCase()
          || String(t.name).toLowerCase().includes(String(tName).toLowerCase())
          || String(tName).toLowerCase().includes(String(t.name).toLowerCase()));
        if (teacher) resolvedThumb = teacher.default_thumbnail_url || teacher.photo_url || resolvedThumb;
      }
      if (!resolvedThumb || String(resolvedThumb).includes('unsplash.com/photo-1516321318423')) {
        const ch = db.chapters.find(c => Number(c.id) === chId);
        if (ch) {
          const sub = db.subjects.find(s => Number(s.id) === Number(ch.subject_id));
          if (sub && sub.default_thumbnail_url) resolvedThumb = sub.default_thumbnail_url;
        }
      }
    }

    db.lectures[lecIdx] = {
      ...existingLec,
      title: payload.lecture_title || existingLec.title,
      external_link: payload.lecture_video_url !== undefined ? payload.lecture_video_url : existingLec.external_link,
      duration: payload.lecture_duration || existingLec.duration,
      teacher_name: payload.teacher_name !== undefined ? payload.teacher_name : existingLec.teacher_name,
      lecture_date: payload.lecture_date || existingLec.lecture_date,
      is_live: payload.is_live !== undefined ? Number(payload.is_live) : existingLec.is_live,
      thumbnail_url: resolvedThumb,
      display_order: Number(payload.lecture_order) || existingLec.display_order,
      lecture_number: lecNumber,
      is_published: payload.is_published !== undefined ? Number(payload.is_published) : existingLec.is_published
    };

    // Update or Insert Note (save if title OR url provided)
    const existingNoteIdx = db.notes.findIndex(n => Number(n.lecture_id) === lecId && n.type === 'note');
    if ((payload.notes_title && String(payload.notes_title).trim()) || (payload.notes_pdf_url && String(payload.notes_pdf_url).trim())) {
      const noteTitle = (payload.notes_title && String(payload.notes_title).trim()) || 'Class Notes';
      const noteUrl = (payload.notes_pdf_url && String(payload.notes_pdf_url).trim()) || '';
      if (existingNoteIdx !== -1) {
        db.notes[existingNoteIdx] = {
          ...db.notes[existingNoteIdx],
          title: noteTitle,
          external_link: noteUrl || db.notes[existingNoteIdx].external_link,
          file_size: payload.notes_file_size || db.notes[existingNoteIdx].file_size || '2.4 MB'
        };
      } else {
        db.notes.push({
          id: db.nextId.note++,
          chapter_id: chId,
          lecture_id: lecId,
          title: noteTitle,
          external_link: noteUrl,
          file_size: payload.notes_file_size || '2.4 MB',
          type: 'note',
          display_order: lecNumber,
          is_published: 1,
          created_at: new Date().toISOString()
        });
      }
    } else if (existingNoteIdx !== -1 && (!payload.notes_title || !payload.notes_pdf_url)) {
      db.notes.splice(existingNoteIdx, 1);
    }

    // Update or Insert DPP PDF
    const existingDppPdfIdx = db.notes.findIndex(n => Number(n.lecture_id) === lecId && n.type === 'dpp_pdf');
    if (payload.dpp_pdf_title && payload.dpp_pdf_url) {
      if (existingDppPdfIdx !== -1) {
        db.notes[existingDppPdfIdx] = {
          ...db.notes[existingDppPdfIdx],
          title: payload.dpp_pdf_title,
          external_link: payload.dpp_pdf_url,
          file_size: payload.dpp_pdf_file_size || '1.5 MB'
        };
      } else {
        db.notes.push({
          id: db.nextId.note++,
          chapter_id: chId,
          lecture_id: lecId,
          title: payload.dpp_pdf_title,
          external_link: payload.dpp_pdf_url,
          file_size: payload.dpp_pdf_file_size || '1.5 MB',
          type: 'dpp_pdf',
          display_order: lecNumber,
          is_published: 1,
          created_at: new Date().toISOString()
        });
      }
    } else if (existingDppPdfIdx !== -1 && (!payload.dpp_pdf_title || !payload.dpp_pdf_url)) {
      db.notes.splice(existingDppPdfIdx, 1);
    }

    // Update or Insert DPP Video
    const existingDppVidIdx = db.lectures.findIndex(v => v.chapter_id === chId && v.video_type === 'dpp_video' && v.lecture_number === lecNumber);
    if (payload.dpp_video_title && payload.dpp_video_url) {
      if (existingDppVidIdx !== -1) {
        db.lectures[existingDppVidIdx] = {
          ...db.lectures[existingDppVidIdx],
          title: payload.dpp_video_title,
          external_link: payload.dpp_video_url,
          duration: payload.dpp_video_duration || '30 mins'
        };
      } else {
        db.lectures.push({
          id: db.nextId.lecture++,
          chapter_id: chId,
          title: payload.dpp_video_title,
          external_link: payload.dpp_video_url,
          duration: payload.dpp_video_duration || '30 mins',
          teacher_name: payload.teacher_name || '',
          lecture_date: payload.lecture_date || new Date().toISOString().split('T')[0],
          is_live: 0,
          is_today: 0,
          thumbnail_url: payload.thumbnail_url || 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=600',
          display_order: lecNumber,
          lecture_number: lecNumber,
          video_type: 'dpp_video',
          is_published: 1,
          created_at: new Date().toISOString()
        });
      }
    } else if (existingDppVidIdx !== -1 && (!payload.dpp_video_title || !payload.dpp_video_url)) {
      db.lectures.splice(existingDppVidIdx, 1);
    }

    // Update or Insert Quiz
    const existingQuizIdx = db.quizzes.findIndex(q => Number(q.lecture_id) === lecId);
    if (payload.dpp_quiz_title) {
      if (existingQuizIdx !== -1) {
        db.quizzes[existingQuizIdx] = {
          ...db.quizzes[existingQuizIdx],
          title: payload.dpp_quiz_title,
          total_questions: Number(payload.dpp_quiz_total_questions) || 10,
          duration: Number(payload.dpp_quiz_duration) || 15
        };
      } else {
        db.quizzes.push({
          id: db.nextId.quiz++,
          chapter_id: chId,
          lecture_id: lecId,
          title: payload.dpp_quiz_title,
          total_questions: Number(payload.dpp_quiz_total_questions) || 10,
          duration: Number(payload.dpp_quiz_duration) || 15,
          external_link: '',
          is_published: 1,
          created_at: new Date().toISOString()
        });
      }
    } else if (existingQuizIdx !== -1 && !payload.dpp_quiz_title) {
      db.quizzes.splice(existingQuizIdx, 1);
    }

    // Update Extra Resources
    db.extra_resources = db.extra_resources.filter(e => e.lecture_id !== lecId);
    if (Array.isArray(payload.extra_resources)) {
      payload.extra_resources.forEach((r: any, idx: number) => {
        if (r.title && r.url) {
          db.extra_resources.push({
            id: db.nextId.extra_resource++,
            lecture_id: lecId,
            title: r.title,
            url: r.url,
            resource_type: r.resource_type || 'pdf',
            description: r.description || '',
            display_order: idx + 1,
            created_at: new Date().toISOString()
          });
        }
      });
    }

    saveDatabase();
    const updatedLec = db.lectures[lecIdx];
    if (pgPool) {
      (async () => {
        try {
          const mem = loadDatabase();
          const lec = mem.lectures.find(l => l.id === updatedLec.id);
          if (lec) {
            await pgPool.query(
              `UPDATE lectures SET chapter_id=$1, title=$2, external_link=$3, duration=$4, teacher_name=$5,
               lecture_date=$6, is_live=$7, is_today=$8, thumbnail_url=$9, display_order=$10,
               lecture_number=$11, video_type=$12, is_published=$13 WHERE id=$14`,
              [lec.chapter_id, lec.title, lec.external_link, lec.duration, lec.teacher_name,
               lec.lecture_date, lec.is_live, lec.is_today, lec.thumbnail_url, lec.display_order,
               lec.lecture_number, lec.video_type, lec.is_published, lec.id]
            );
          }
          for (const n of mem.notes.filter(n => n.lecture_id === updatedLec.id)) {
            await pgPool.query(
              `INSERT INTO notes (id, chapter_id, lecture_id, title, external_link, file_size, type, display_order, is_published)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
               ON CONFLICT (id) DO UPDATE SET
                 chapter_id=EXCLUDED.chapter_id, lecture_id=EXCLUDED.lecture_id, title=EXCLUDED.title,
                 external_link=EXCLUDED.external_link, file_size=EXCLUDED.file_size, type=EXCLUDED.type,
                 display_order=EXCLUDED.display_order, is_published=EXCLUDED.is_published`,
              [n.id, n.chapter_id, n.lecture_id, n.title, n.external_link, n.file_size, n.type, n.display_order, n.is_published]
            );
          }
          for (const q of mem.quizzes.filter(q => q.lecture_id === updatedLec.id)) {
            await pgPool.query(
              `INSERT INTO quizzes (id, chapter_id, lecture_id, title, total_questions, duration, external_link, is_published)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
               ON CONFLICT (id) DO UPDATE SET
                 chapter_id=EXCLUDED.chapter_id, lecture_id=EXCLUDED.lecture_id, title=EXCLUDED.title,
                 total_questions=EXCLUDED.total_questions, duration=EXCLUDED.duration,
                 external_link=EXCLUDED.external_link, is_published=EXCLUDED.is_published`,
              [q.id, q.chapter_id, q.lecture_id, q.title, q.total_questions, q.duration, q.external_link, q.is_published]
            );
          }
          for (const e of mem.extra_resources.filter(e => e.lecture_id === updatedLec.id)) {
            await pgPool.query(
              `INSERT INTO extra_resources (id, lecture_id, title, url, resource_type, description, display_order)
               VALUES ($1,$2,$3,$4,$5,$6,$7)
               ON CONFLICT (id) DO UPDATE SET
                 lecture_id=EXCLUDED.lecture_id, title=EXCLUDED.title, url=EXCLUDED.url,
                 resource_type=EXCLUDED.resource_type, description=EXCLUDED.description, display_order=EXCLUDED.display_order`,
              [e.id, e.lecture_id, e.title, e.url, e.resource_type, e.description, e.display_order]
            );
          }
        } catch (err) {
          console.error('Error updating unified lecture in PostgreSQL/CockroachDB:', err);
        }
      })();
    }
    return updatedLec;
  },

  // --- SINGLE VIDEOS / PDFS / QUIZZES ---
  createVideo(data: Partial<Lecture>): Lecture {
    const db = loadDatabase();
    const newLec: Lecture = {
      id: db.nextId.lecture++,
      chapter_id: Number(data.chapter_id),
      title: data.title || 'Video Lecture',
      external_link: data.external_link || '',
      duration: data.duration || '50 mins',
      teacher_name: data.teacher_name || '',
      lecture_date: data.lecture_date || new Date().toISOString().split('T')[0],
      is_live: data.is_live !== undefined ? Number(data.is_live) : 0,
      is_today: data.is_today !== undefined ? Number(data.is_today) : 0,
      thumbnail_url: data.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600',
      display_order: Number(data.display_order) || 1,
      lecture_number: Number(data.lecture_number) || Number(data.display_order) || 1,
      video_type: (data as any).type || data.video_type || 'lecture',
      is_published: data.is_published !== undefined ? Number(data.is_published) : 1,
      created_at: new Date().toISOString()
    };
    db.lectures.push(newLec);
    saveDatabase();
    if (pgPool) {
      (async () => {
        try {
          await pgPool.query(
            `INSERT INTO lectures (id, chapter_id, title, external_link, duration, teacher_name, lecture_date, is_live, is_today, thumbnail_url, display_order, lecture_number, video_type, is_published)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
             ON CONFLICT (id) DO UPDATE SET
               chapter_id=EXCLUDED.chapter_id, title=EXCLUDED.title, external_link=EXCLUDED.external_link,
               duration=EXCLUDED.duration, teacher_name=EXCLUDED.teacher_name, lecture_date=EXCLUDED.lecture_date,
               is_live=EXCLUDED.is_live, is_today=EXCLUDED.is_today, thumbnail_url=EXCLUDED.thumbnail_url,
               display_order=EXCLUDED.display_order, lecture_number=EXCLUDED.lecture_number,
               video_type=EXCLUDED.video_type, is_published=EXCLUDED.is_published`,
            [newLec.id, newLec.chapter_id, newLec.title, newLec.external_link, newLec.duration, newLec.teacher_name,
             newLec.lecture_date, newLec.is_live, newLec.is_today, newLec.thumbnail_url, newLec.display_order,
             newLec.lecture_number, newLec.video_type, newLec.is_published]
          );
        } catch (err) {
          console.error('Error creating video in PostgreSQL/CockroachDB:', err);
        }
      })();
    }
    return newLec;
  },

  updateVideo(id: number, data: Partial<Lecture>): Lecture | null {
    const db = loadDatabase();
    const idx = db.lectures.findIndex(l => Number(l.id) === Number(id));
    if (idx === -1) return null;
    db.lectures[idx] = {
      ...db.lectures[idx],
      ...data,
      video_type: (data as any).type || data.video_type || db.lectures[idx].video_type,
      id: Number(id)
    };
    saveDatabase();
    const updatedVideo = db.lectures[idx];
    if (pgPool) {
      (async () => {
        try {
          await pgPool.query(
            `UPDATE lectures SET chapter_id=$1, title=$2, external_link=$3, duration=$4, teacher_name=$5,
             lecture_date=$6, is_live=$7, is_today=$8, thumbnail_url=$9, display_order=$10,
             lecture_number=$11, video_type=$12, is_published=$13 WHERE id=$14`,
            [updatedVideo.chapter_id, updatedVideo.title, updatedVideo.external_link, updatedVideo.duration,
             updatedVideo.teacher_name, updatedVideo.lecture_date, updatedVideo.is_live, updatedVideo.is_today,
             updatedVideo.thumbnail_url, updatedVideo.display_order, updatedVideo.lecture_number,
             updatedVideo.video_type, updatedVideo.is_published, Number(id)]
          );
        } catch (err) {
          console.error('Error updating video in PostgreSQL/CockroachDB:', err);
        }
      })();
    }
    return updatedVideo;
  },

  async deleteVideo(id: number): Promise<boolean> {
    const db = loadDatabase();
    const initLen = db.lectures.length;
    const numId = Number(id);
    db.lectures = db.lectures.filter(l => Number(l.id) !== numId);
    db.extra_resources = db.extra_resources.filter(e => e.lecture_id !== numId);
    db.notes.forEach(n => {
      if (n.lecture_id === numId) n.lecture_id = null;
    });
    db.quizzes.forEach(q => {
      if (q.lecture_id === numId) q.lecture_id = null;
    });
    saveDatabase();

    if (pgPool) {
      try {
        await pgPool.query('DELETE FROM lectures WHERE id = $1', [numId]);
      } catch (err) {
        console.error('Error executing deleteVideo on PostgreSQL/CockroachDB:', err);
      }
    }

    return db.lectures.length !== initLen;
  },

  createPdf(data: Partial<Note>): Note {
    const db = loadDatabase();
    const newNote: Note = {
      id: db.nextId.note++,
      chapter_id: Number(data.chapter_id),
      lecture_id: data.lecture_id ? Number(data.lecture_id) : null,
      title: data.title || 'Document PDF',
      external_link: data.external_link || '',
      file_size: data.file_size || '2.4 MB',
      type: data.type || 'note',
      display_order: Number(data.display_order) || 1,
      is_published: data.is_published !== undefined ? Number(data.is_published) : 1,
      created_at: new Date().toISOString()
    };
    db.notes.push(newNote);
    saveDatabase();
    if (pgPool) {
      (async () => {
        try {
          await pgPool.query(
            `INSERT INTO notes (id, chapter_id, lecture_id, title, external_link, file_size, type, display_order, is_published)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
             ON CONFLICT (id) DO UPDATE SET
               chapter_id=EXCLUDED.chapter_id, lecture_id=EXCLUDED.lecture_id, title=EXCLUDED.title,
               external_link=EXCLUDED.external_link, file_size=EXCLUDED.file_size, type=EXCLUDED.type,
               display_order=EXCLUDED.display_order, is_published=EXCLUDED.is_published`,
            [newNote.id, newNote.chapter_id, newNote.lecture_id, newNote.title, newNote.external_link,
             newNote.file_size, newNote.type, newNote.display_order, newNote.is_published]
          );
        } catch (err) {
          console.error('Error creating PDF in PostgreSQL/CockroachDB:', err);
        }
      })();
    }
    return newNote;
  },

  updatePdf(id: number, data: Partial<Note>): Note | null {
    const db = loadDatabase();
    const idx = db.notes.findIndex(n => Number(n.id) === Number(id));
    if (idx === -1) return null;
    db.notes[idx] = { ...db.notes[idx], ...data, id: Number(id) };
    saveDatabase();
    const updatedPdf = db.notes[idx];
    if (pgPool) {
      (async () => {
        try {
          await pgPool.query(
            `UPDATE notes SET chapter_id=$1, lecture_id=$2, title=$3, external_link=$4, file_size=$5,
             type=$6, display_order=$7, is_published=$8 WHERE id=$9`,
            [updatedPdf.chapter_id, updatedPdf.lecture_id, updatedPdf.title, updatedPdf.external_link,
             updatedPdf.file_size, updatedPdf.type, updatedPdf.display_order, updatedPdf.is_published, Number(id)]
          );
        } catch (err) {
          console.error('Error updating PDF in PostgreSQL/CockroachDB:', err);
        }
      })();
    }
    return updatedPdf;
  },

  async deletePdf(id: number): Promise<boolean> {
    const db = loadDatabase();
    const initLen = db.notes.length;
    const numId = Number(id);
    db.notes = db.notes.filter(n => Number(n.id) !== numId);
    saveDatabase();

    if (pgPool) {
      try {
        await pgPool.query('DELETE FROM notes WHERE id = $1', [numId]);
      } catch (err) {
        console.error('Error executing deletePdf on PostgreSQL/CockroachDB:', err);
      }
    }

    return db.notes.length !== initLen;
  },

  async deleteQuiz(id: number): Promise<boolean> {
    const db = loadDatabase();
    const initLen = db.quizzes.length;
    const numId = Number(id);
    db.quizzes = db.quizzes.filter(q => Number(q.id) !== numId);
    saveDatabase();

    if (pgPool) {
      try {
        await pgPool.query('DELETE FROM quizzes WHERE id = $1', [numId]);
      } catch (err) {
        console.error('Error executing deleteQuiz on PostgreSQL/CockroachDB:', err);
      }
    }

    return db.quizzes.length !== initLen;
  },

  // Status Toggles
  setVideoToday(id: number, isToday: boolean | number): boolean {
    const db = loadDatabase();
    const v = db.lectures.find(l => Number(l.id) === Number(id));
    if (!v) return false;
    v.is_today = isToday ? 1 : 0;
    saveDatabase();
    if (pgPool) {
      pgPool.query('UPDATE lectures SET is_today = $1 WHERE id = $2', [v.is_today, Number(id)])
        .catch(err => console.error('Error setVideoToday in DB:', err));
    }
    return true;
  },

  setVideoLive(id: number, isLive: boolean | number): boolean {
    const db = loadDatabase();
    const v = db.lectures.find(l => Number(l.id) === Number(id));
    if (!v) return false;
    v.is_live = isLive ? 1 : 0;
    saveDatabase();
    if (pgPool) {
      pgPool.query('UPDATE lectures SET is_live = $1 WHERE id = $2', [v.is_live, Number(id)])
        .catch(err => console.error('Error setVideoLive in DB:', err));
    }
    return true;
  },

  setVideoStatus(id: number, isPublished: boolean | number): boolean {
    const db = loadDatabase();
    const v = db.lectures.find(l => Number(l.id) === Number(id));
    if (!v) return false;
    v.is_published = isPublished ? 1 : 0;
    saveDatabase();
    if (pgPool) {
      pgPool.query('UPDATE lectures SET is_published = $1 WHERE id = $2', [v.is_published, Number(id)])
        .catch(err => console.error('Error setVideoStatus in DB:', err));
    }
    return true;
  },

  setPdfStatus(id: number, isPublished: boolean | number): boolean {
    const db = loadDatabase();
    const p = db.notes.find(n => Number(n.id) === Number(id));
    if (!p) return false;
    p.is_published = isPublished ? 1 : 0;
    saveDatabase();
    if (pgPool) {
      pgPool.query('UPDATE notes SET is_published = $1 WHERE id = $2', [p.is_published, Number(id)])
        .catch(err => console.error('Error setPdfStatus in DB:', err));
    }
    return true;
  },

  setQuizStatus(id: number, isPublished: boolean | number): boolean {
    const db = loadDatabase();
    const q = db.quizzes.find(qz => qz.id === Number(id));
    if (!q) return false;
    q.is_published = isPublished ? 1 : 0;
    saveDatabase();
    if (pgPool) {
      pgPool.query('UPDATE quizzes SET is_published = $1 WHERE id = $2', [q.is_published, Number(id)])
        .catch(err => console.error('Error setQuizStatus in DB:', err));
    }
    return true;
  },

  // --- TEACHERS ---
  getTeachers(batchId?: string): Teacher[] {
    const db = loadDatabase();
    let result = db.teachers;
    if (batchId) {
      result = result.filter(t => !t.batch_id || String(t.batch_id) === String(batchId));
    }
    return result.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  },

  getTeacherById(id: number): Teacher | null {
    const db = loadDatabase();
    return db.teachers.find(t => Number(t.id) === Number(id)) || null;
  },

  createTeacher(data: Partial<Teacher>): Teacher {
    const db = loadDatabase();
    const newTeacher: Teacher = {
      id: db.nextId.teacher++,
      batch_id: data.batch_id ? String(data.batch_id) : null,
      name: data.name || 'Educator',
      photo_url: data.photo_url || '',
      default_thumbnail_url: data.default_thumbnail_url || '',
      subject: data.subject || data.subjects_taught || 'General',
      subjects_taught: data.subjects_taught || data.subject || 'General',
      experience: data.experience || '',
      bio: data.bio || '',
      display_order: Number(data.display_order) || db.teachers.length + 1,
      created_at: new Date().toISOString()
    };
    db.teachers.push(newTeacher);
    saveDatabase();
    if (pgPool) {
      (async () => {
        try {
          await pgPool.query(
            `INSERT INTO teachers (id, batch_id, name, photo_url, default_thumbnail_url, subject, subjects_taught, experience, bio, display_order)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
             ON CONFLICT (id) DO UPDATE SET
               batch_id=EXCLUDED.batch_id, name=EXCLUDED.name, photo_url=EXCLUDED.photo_url,
               default_thumbnail_url=EXCLUDED.default_thumbnail_url, subject=EXCLUDED.subject,
               subjects_taught=EXCLUDED.subjects_taught, experience=EXCLUDED.experience,
               bio=EXCLUDED.bio, display_order=EXCLUDED.display_order`,
            [newTeacher.id, newTeacher.batch_id, newTeacher.name, newTeacher.photo_url,
             newTeacher.default_thumbnail_url, newTeacher.subject, newTeacher.subjects_taught,
             newTeacher.experience, newTeacher.bio, newTeacher.display_order]
          );
        } catch (err) {
          console.error('Error creating teacher in PostgreSQL/CockroachDB:', err);
        }
      })();
    }
    return newTeacher;
  },

  updateTeacher(id: number, data: Partial<Teacher>): Teacher | null {
    const db = loadDatabase();
    const idx = db.teachers.findIndex(t => Number(t.id) === Number(id));
    if (idx === -1) return null;
    db.teachers[idx] = { ...db.teachers[idx], ...data, id: Number(id) };
    saveDatabase();
    const updatedTeacher = db.teachers[idx];
    if (pgPool) {
      (async () => {
        try {
          await pgPool.query(
            `UPDATE teachers SET batch_id=$1, name=$2, photo_url=$3, default_thumbnail_url=$4, subject=$5,
             subjects_taught=$6, experience=$7, bio=$8, display_order=$9 WHERE id=$10`,
            [updatedTeacher.batch_id, updatedTeacher.name, updatedTeacher.photo_url,
             updatedTeacher.default_thumbnail_url, updatedTeacher.subject, updatedTeacher.subjects_taught,
             updatedTeacher.experience, updatedTeacher.bio, updatedTeacher.display_order, Number(id)]
          );
        } catch (err) {
          console.error('Error updating teacher in PostgreSQL/CockroachDB:', err);
        }
      })();
    }
    return updatedTeacher;
  },

  async deleteTeacher(id: number): Promise<boolean> {
    const db = loadDatabase();
    const initLen = db.teachers.length;
    const numId = Number(id);
    db.teachers = db.teachers.filter(t => Number(t.id) !== numId);
    saveDatabase();

    if (pgPool) {
      try {
        await pgPool.query('DELETE FROM teachers WHERE id = $1', [numId]);
      } catch (err) {
        console.error('Error executing deleteTeacher on PostgreSQL/CockroachDB:', err);
      }
    }

    return db.teachers.length !== initLen;
  },

  // --- ANNOUNCEMENTS ---
  getAnnouncements(batchId: string): Announcement[] {
    const db = loadDatabase();
    return db.announcements
      .filter(a => String(a.batch_id) === String(batchId))
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  },

  createAnnouncement(batchId: string, message: string): Announcement {
    const db = loadDatabase();
    const newAnn: Announcement = {
      id: db.nextId.announcement++,
      batch_id: String(batchId),
      message,
      created_at: new Date().toISOString()
    };
    db.announcements.push(newAnn);
    saveDatabase();
    if (pgPool) {
      (async () => {
        try {
          await pgPool.query(
            `INSERT INTO announcements (id, batch_id, message)
             VALUES ($1, $2, $3)
             ON CONFLICT (id) DO UPDATE SET batch_id = EXCLUDED.batch_id, message = EXCLUDED.message`,
            [newAnn.id, newAnn.batch_id, newAnn.message]
          );
        } catch (err) {
          console.error('Error creating announcement in PostgreSQL/CockroachDB:', err);
        }
      })();
    }
    return newAnn;
  },

  async deleteAnnouncement(id: number): Promise<boolean> {
    const db = loadDatabase();
    const initLen = db.announcements.length;
    const numId = Number(id);
    db.announcements = db.announcements.filter(a => Number(a.id) !== numId);
    saveDatabase();

    if (pgPool) {
      try {
        await pgPool.query('DELETE FROM announcements WHERE id = $1', [numId]);
      } catch (err) {
        console.error('Error executing deleteAnnouncement on PostgreSQL/CockroachDB:', err);
      }
    }

    return db.announcements.length !== initLen;
  },

  // --- BANNERS ---
  getBanners(activeOnly = false): { banners: Banner[]; interval: number; auto_slide: boolean } {
    const db = loadDatabase();
    let result = db.banners;
    if (activeOnly) {
      result = result.filter(b => b.is_active !== 0);
    }
    const interval = Number(db.settings.banner_interval) || 4000;
    const auto_slide = db.settings.banner_auto_slide !== '0' && db.settings.banner_auto_slide !== false;

    return {
      banners: result.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)),
      interval,
      auto_slide
    };
  },

  createBanner(data: Partial<Banner>): Banner {
    const db = loadDatabase();
    const newBanner: Banner = {
      id: db.nextId.banner++,
      title: data.title || 'Promotional Banner',
      subtitle: data.subtitle || '',
      image_url: data.image_url || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1200',
      link: data.link || data.target_url || '/study.html',
      target_url: data.target_url || data.link || '/study.html',
      badge_text: data.badge_text || '',
      badge_color: data.badge_color || '#7C3AED',
      display_order: Number(data.display_order) || db.banners.length + 1,
      is_active: data.is_active !== undefined ? Number(data.is_active) : 1,
      created_at: new Date().toISOString()
    };
    db.banners.push(newBanner);
    saveDatabase();
    if (pgPool) {
      (async () => {
        try {
          await pgPool.query(
            `INSERT INTO banners (id, title, subtitle, image_url, link, target_url, badge_text, badge_color, display_order, is_active)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
             ON CONFLICT (id) DO UPDATE SET
               title=EXCLUDED.title, subtitle=EXCLUDED.subtitle, image_url=EXCLUDED.image_url,
               link=EXCLUDED.link, target_url=EXCLUDED.target_url, badge_text=EXCLUDED.badge_text,
               badge_color=EXCLUDED.badge_color, display_order=EXCLUDED.display_order, is_active=EXCLUDED.is_active`,
            [newBanner.id, newBanner.title, newBanner.subtitle, newBanner.image_url, newBanner.link,
             newBanner.target_url, newBanner.badge_text, newBanner.badge_color, newBanner.display_order, newBanner.is_active]
          );
        } catch (err) {
          console.error('Error creating banner in PostgreSQL/CockroachDB:', err);
        }
      })();
    }
    return newBanner;
  },

  updateBanner(id: number, data: Partial<Banner>): Banner | null {
    const db = loadDatabase();
    const idx = db.banners.findIndex(b => Number(b.id) === Number(id));
    if (idx === -1) return null;
    db.banners[idx] = { ...db.banners[idx], ...data, id: Number(id) };
    saveDatabase();
    const updatedBanner = db.banners[idx];
    if (pgPool) {
      (async () => {
        try {
          await pgPool.query(
            `UPDATE banners SET title=$1, subtitle=$2, image_url=$3, link=$4, target_url=$5,
             badge_text=$6, badge_color=$7, display_order=$8, is_active=$9 WHERE id=$10`,
            [updatedBanner.title, updatedBanner.subtitle, updatedBanner.image_url, updatedBanner.link,
             updatedBanner.target_url, updatedBanner.badge_text, updatedBanner.badge_color,
             updatedBanner.display_order, updatedBanner.is_active, Number(id)]
          );
        } catch (err) {
          console.error('Error updating banner in PostgreSQL/CockroachDB:', err);
        }
      })();
    }
    return updatedBanner;
  },

  setBannerStatus(id: number, isActive: boolean | number): boolean {
    const db = loadDatabase();
    const b = db.banners.find(bn => bn.id === Number(id));
    if (!b) return false;
    b.is_active = isActive ? 1 : 0;
    saveDatabase();
    if (pgPool) {
      pgPool.query('UPDATE banners SET is_active = $1 WHERE id = $2', [b.is_active, Number(id)])
        .catch(err => console.error('Error setBannerStatus in DB:', err));
    }
    return true;
  },

  reorderBanners(orderedIds: number[]): boolean {
    const db = loadDatabase();
    orderedIds.forEach((id, idx) => {
      const banner = db.banners.find(b => b.id === Number(id));
      if (banner) banner.display_order = idx + 1;
    });
    saveDatabase();
    if (pgPool) {
      (async () => {
        try {
          for (let i = 0; i < orderedIds.length; i++) {
            await pgPool.query('UPDATE banners SET display_order = $1 WHERE id = $2', [i + 1, Number(orderedIds[i])]);
          }
        } catch (err) {
          console.error('Error reorderBanners in PostgreSQL/CockroachDB:', err);
        }
      })();
    }
    return true;
  },

  async deleteBanner(id: number): Promise<boolean> {
    const db = loadDatabase();
    const initLen = db.banners.length;
    const numId = Number(id);
    db.banners = db.banners.filter(b => Number(b.id) !== numId);
    saveDatabase();

    if (pgPool) {
      try {
        await pgPool.query('DELETE FROM banners WHERE id = $1', [numId]);
      } catch (err) {
        console.error('Error executing deleteBanner on PostgreSQL/CockroachDB:', err);
      }
    }

    return db.banners.length !== initLen;
  },

  // --- NAVIGATION LINKS ---
  getNavLinks(activeOnly = false): NavLinkItem[] {
    const db = loadDatabase();
    let result = db.nav_links;
    if (activeOnly) {
      result = result.filter(l => l.is_active !== 0);
    }
    return result.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  },

  createNavLink(data: Partial<NavLinkItem>): NavLinkItem {
    const db = loadDatabase();
    const newLink: NavLinkItem = {
      id: db.nextId.nav_link++,
      label: data.label || 'Link',
      url: data.url || '#',
      icon: data.icon || '🔗',
      display_order: Number(data.display_order) || db.nav_links.length + 1,
      is_external: data.is_external !== undefined ? Number(data.is_external) : 0,
      is_active: data.is_active !== undefined ? Number(data.is_active) : 1,
      created_at: new Date().toISOString()
    };
    db.nav_links.push(newLink);
    saveDatabase();
    if (pgPool) {
      (async () => {
        try {
          await pgPool.query(
            `INSERT INTO nav_links (id, label, url, icon, display_order, is_external, is_active)
             VALUES ($1,$2,$3,$4,$5,$6,$7)
             ON CONFLICT (id) DO UPDATE SET
               label=EXCLUDED.label, url=EXCLUDED.url, icon=EXCLUDED.icon,
               display_order=EXCLUDED.display_order, is_external=EXCLUDED.is_external, is_active=EXCLUDED.is_active`,
            [newLink.id, newLink.label, newLink.url, newLink.icon, newLink.display_order, newLink.is_external, newLink.is_active]
          );
        } catch (err) {
          console.error('Error creating nav link in PostgreSQL/CockroachDB:', err);
        }
      })();
    }
    return newLink;
  },

  updateNavLink(id: number, data: Partial<NavLinkItem>): NavLinkItem | null {
    const db = loadDatabase();
    const idx = db.nav_links.findIndex(l => Number(l.id) === Number(id));
    if (idx === -1) return null;
    db.nav_links[idx] = { ...db.nav_links[idx], ...data, id: Number(id) };
    saveDatabase();
    const updatedLink = db.nav_links[idx];
    if (pgPool) {
      (async () => {
        try {
          await pgPool.query(
            `UPDATE nav_links SET label=$1, url=$2, icon=$3, display_order=$4, is_external=$5, is_active=$6 WHERE id=$7`,
            [updatedLink.label, updatedLink.url, updatedLink.icon, updatedLink.display_order,
             updatedLink.is_external, updatedLink.is_active, Number(id)]
          );
        } catch (err) {
          console.error('Error updating nav link in PostgreSQL/CockroachDB:', err);
        }
      })();
    }
    return updatedLink;
  },

  async deleteNavLink(id: number): Promise<boolean> {
    const db = loadDatabase();
    const initLen = db.nav_links.length;
    const numId = Number(id);
    db.nav_links = db.nav_links.filter(l => Number(l.id) !== numId);
    saveDatabase();

    if (pgPool) {
      try {
        await pgPool.query('DELETE FROM nav_links WHERE id = $1', [numId]);
      } catch (err) {
        console.error('Error executing deleteNavLink on PostgreSQL/CockroachDB:', err);
      }
    }

    return db.nav_links.length !== initLen;
  },

  // --- USERS ---
  getUsers(): UserItem[] {
    const db = loadDatabase();
    return [...db.users];
  },

  createUser(data: Partial<UserItem>): UserItem {
    const db = loadDatabase();
    const newUser: UserItem = {
      id: db.nextId.user++,
      name: data.name || 'Student',
      email: data.email || `user${Date.now()}@example.com`,
      xp: data.xp || 100,
      enrolled_count: data.enrolled_count || 1,
      created_at: new Date().toISOString()
    };
    db.users.push(newUser);
    saveDatabase();
    if (pgPool) {
      (async () => {
        try {
          await pgPool.query(
            `INSERT INTO users (id, name, email, xp, enrolled_count)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, xp = EXCLUDED.xp, enrolled_count = EXCLUDED.enrolled_count`,
            [newUser.id, newUser.name, newUser.email, newUser.xp, newUser.enrolled_count]
          );
        } catch (err) {
          console.error('Error creating user in PostgreSQL/CockroachDB:', err);
        }
      })();
    }
    return newUser;
  },

  async deleteUser(id: number): Promise<boolean> {
    const db = loadDatabase();
    const initLen = db.users.length;
    const numId = Number(id);
    db.users = db.users.filter(u => Number(u.id) !== numId);
    saveDatabase();

    if (pgPool) {
      try {
        await pgPool.query('DELETE FROM users WHERE id = $1', [numId]);
      } catch (err) {
        console.error('Error executing deleteUser on PostgreSQL/CockroachDB:', err);
      }
    }

    return db.users.length !== initLen;
  },

  // --- TODAY & UPCOMING LECTURES ---
  getTodayLectures(batchId?: string): Lecture[] {
    const db = loadDatabase();
    // Today's date in IST (Asia/Kolkata)
    const nowIst = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const todayStr = nowIst.toISOString().slice(0, 10); // YYYY-MM-DD

    const normalizeDate = (d: any): string => {
      if (!d) return '';
      const s = String(d).trim();
      // already YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
      // try parse other formats
      const t = Date.parse(s);
      if (!isNaN(t)) {
        const dt = new Date(t);
        return dt.toISOString().slice(0, 10);
      }
      return s;
    };

    let result = db.lectures.filter(l => {
      if (Number(l.is_published) === 0) return false;
      if (l.video_type === 'dpp_video') return false;
      const ld = normalizeDate(l.lecture_date);
      // Today = lecture_date is today OR explicitly marked is_live
      // is_today flag is also honored if date matches / live
      return ld === todayStr || Number(l.is_live) === 1;
    });

    if (batchId) {
      const subIds = db.subjects.filter(s => String(s.batch_id) === String(batchId)).map(s => Number(s.id));
      const chIds = db.chapters.filter(c => subIds.includes(Number(c.subject_id))).map(c => Number(c.id));
      result = result.filter(l => chIds.includes(Number(l.chapter_id)));
    }

    return result.map(lec => {
      const ch = db.chapters.find(c => Number(c.id) === Number(lec.chapter_id));
      const sub = ch ? db.subjects.find(s => Number(s.id) === Number(ch.subject_id)) : null;
      return {
        ...lec,
        is_today: 1,
        chapter_title: ch?.title || '',
        subject_name: sub?.name || 'Subject',
        subject_id: sub?.id,
        chapter_id: lec.chapter_id
      };
    });
  },

  getUpcomingLectures(batchId?: string): Lecture[] {
    const db = loadDatabase();
    const nowIst = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const todayStr = nowIst.toISOString().slice(0, 10);

    const normalizeDate = (d: any): string => {
      if (!d) return '';
      const s = String(d).trim();
      if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
      const t = Date.parse(s);
      if (!isNaN(t)) return new Date(t).toISOString().slice(0, 10);
      return s;
    };

    // Upcoming = published, not live, lecture_date STRICTLY after today
    // Past classes (date < today) do NOT appear in schedule
    // Empty/missing video link is allowed (title-only schedule)
    let result = db.lectures.filter(l => {
      if (Number(l.is_published) === 0) return false;
      if (l.video_type === 'dpp_video') return false;
      if (Number(l.is_live) === 1) return false;
      const ld = normalizeDate(l.lecture_date);
      if (!ld) return false;
      return ld > todayStr; // future dates only
    });

    if (batchId) {
      const subIds = db.subjects.filter(s => String(s.batch_id) === String(batchId)).map(s => Number(s.id));
      const chIds = db.chapters.filter(c => subIds.includes(Number(c.subject_id))).map(c => Number(c.id));
      result = result.filter(l => chIds.includes(Number(l.chapter_id)));
    }

    // Sort by date ascending
    result.sort((a, b) => String(normalizeDate(a.lecture_date)).localeCompare(String(normalizeDate(b.lecture_date))));

    return result.slice(0, 20).map(lec => {
      const ch = db.chapters.find(c => Number(c.id) === Number(lec.chapter_id));
      const sub = ch ? db.subjects.find(s => Number(s.id) === Number(ch.subject_id)) : null;
      return {
        ...lec,
        is_today: 0,
        chapter_title: ch?.title || '',
        subject_name: sub?.name || 'Subject',
        subject_id: sub?.id,
        chapter_id: lec.chapter_id
      };
    });
  },

  // --- DASHBOARD STATS ---
  getDashboardStats(): any {
    const db = loadDatabase();
    return {
      stats: {
        totalBatches: db.batches.length,
        totalSubjects: db.subjects.length,
        totalVideos: db.lectures.length,
        totalPdfs: db.notes.length,
        totalBanners: db.banners.length
      },
      recentBatches: db.batches.slice(0, 5)
    };
  }
};
