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
    return db.settings;
  },

  // --- BATCHES ---
  getBatches(query?: string): Batch[] {
    const db = loadDatabase();
    let result = db.batches.filter(b => b.is_published !== 0);
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
        const chs = db.chapters.filter(c => c.subject_id === s.id && c.is_published !== 0);
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
    return db.batches[idx];
  },

  deleteBatch(id: string): boolean {
    const db = loadDatabase();
    const initLen = db.batches.length;
    db.batches = db.batches.filter(b => String(b.id) !== String(id));
    if (db.batches.length === initLen) return false;

    // Cascade delete related subjects, chapters, content, announcements
    const subIds = db.subjects.filter(s => String(s.batch_id) === String(id)).map(s => s.id);
    db.subjects = db.subjects.filter(s => String(s.batch_id) !== String(id));
    
    const chIds = db.chapters.filter(c => subIds.includes(c.subject_id)).map(c => c.id);
    db.chapters = db.chapters.filter(c => !subIds.includes(c.subject_id));

    db.lectures = db.lectures.filter(l => !chIds.includes(l.chapter_id));
    db.notes = db.notes.filter(n => !chIds.includes(n.chapter_id));
    db.quizzes = db.quizzes.filter(q => !chIds.includes(q.chapter_id));
    db.announcements = db.announcements.filter(a => String(a.batch_id) !== String(id));

    saveDatabase();
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
    const subject = db.subjects.find(s => s.id === Number(id));
    if (!subject) return null;

    const batch = db.batches.find(b => String(b.id) === String(subject.batch_id));
    const chapters = db.chapters
      .filter(c => c.subject_id === subject.id && c.is_published !== 0)
      .sort((a, b) => (a.chapter_number || a.display_order || 0) - (b.chapter_number || b.display_order || 0))
      .map(c => {
        const lecs = db.lectures.filter(l => l.chapter_id === c.id && l.is_published !== 0);
        const nts = db.notes.filter(n => n.chapter_id === c.id && n.is_published !== 0);
        const qzs = db.quizzes.filter(q => q.chapter_id === c.id && q.is_published !== 0);
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

  createSubject(batchId: string, data: Partial<Subject>): Subject {
    const db = loadDatabase();
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
    return newSubject;
  },

  updateSubject(id: number, data: Partial<Subject>): Subject | null {
    const db = loadDatabase();
    const idx = db.subjects.findIndex(s => s.id === Number(id));
    if (idx === -1) return null;
    db.subjects[idx] = { ...db.subjects[idx], ...data, id: Number(id) };
    saveDatabase();
    return db.subjects[idx];
  },

  deleteSubject(id: number): boolean {
    const db = loadDatabase();
    const initLen = db.subjects.length;
    db.subjects = db.subjects.filter(s => s.id !== Number(id));
    if (db.subjects.length === initLen) return false;

    const chIds = db.chapters.filter(c => c.subject_id === Number(id)).map(c => c.id);
    db.chapters = db.chapters.filter(c => c.subject_id !== Number(id));
    db.lectures = db.lectures.filter(l => !chIds.includes(l.chapter_id));
    db.notes = db.notes.filter(n => !chIds.includes(n.chapter_id));
    db.quizzes = db.quizzes.filter(q => !chIds.includes(q.chapter_id));

    saveDatabase();
    return true;
  },

  // --- CHAPTERS ---
  getChaptersBySubject(subjectId: number): Chapter[] {
    const db = loadDatabase();
    return db.chapters
      .filter(c => c.subject_id === Number(subjectId))
      .sort((a, b) => (a.chapter_number || a.display_order || 0) - (b.chapter_number || b.display_order || 0));
  },

  getChapterById(id: number): any {
    const db = loadDatabase();
    const chapter = db.chapters.find(c => c.id === Number(id));
    if (!chapter) return null;

    const subject = db.subjects.find(s => s.id === chapter.subject_id);
    const batch = subject ? db.batches.find(b => String(b.id) === String(subject.batch_id)) : null;
    const sibling_chapters = subject
      ? db.chapters
          .filter(c => c.subject_id === subject.id && c.is_published !== 0)
          .sort((a, b) => (a.chapter_number || 0) - (b.chapter_number || 0))
      : [];

    const rawLectures = db.lectures.filter(l => l.chapter_id === chapter.id && l.is_published !== 0 && l.video_type !== 'dpp_video');
    const rawDppVideos = db.lectures.filter(l => l.chapter_id === chapter.id && l.is_published !== 0 && l.video_type === 'dpp_video');
    const rawNotes = db.notes.filter(n => n.chapter_id === chapter.id && n.is_published !== 0 && n.type === 'note');
    const rawDppPdfs = db.notes.filter(n => n.chapter_id === chapter.id && n.is_published !== 0 && n.type === 'dpp_pdf');
    const rawQuizzes = db.quizzes.filter(q => q.chapter_id === chapter.id && q.is_published !== 0);

    // Attach nested notes, dpp_pdf, dpp_video, dpp_quiz, and extra_resources to each lecture
    const populatedLectures = rawLectures.map(lec => {
      const lecNote = db.notes.find(n => n.lecture_id === lec.id && n.type === 'note');
      const lecDppPdf = db.notes.find(n => n.lecture_id === lec.id && n.type === 'dpp_pdf');
      const lecDppVid = db.lectures.find(l => l.chapter_id === chapter.id && l.video_type === 'dpp_video' && l.lecture_number === lec.lecture_number);
      const lecQuiz = db.quizzes.find(q => q.lecture_id === lec.id);
      const extras = db.extra_resources.filter(e => e.lecture_id === lec.id);

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
    return newChapter;
  },

  updateChapter(id: number, data: Partial<Chapter>): Chapter | null {
    const db = loadDatabase();
    const idx = db.chapters.findIndex(c => c.id === Number(id));
    if (idx === -1) return null;
    db.chapters[idx] = { ...db.chapters[idx], ...data, id: Number(id) };
    saveDatabase();
    return db.chapters[idx];
  },

  deleteChapter(id: number): boolean {
    const db = loadDatabase();
    const initLen = db.chapters.length;
    db.chapters = db.chapters.filter(c => c.id !== Number(id));
    if (db.chapters.length === initLen) return false;

    db.lectures = db.lectures.filter(l => l.chapter_id !== Number(id));
    db.notes = db.notes.filter(n => n.chapter_id !== Number(id));
    db.quizzes = db.quizzes.filter(q => q.chapter_id !== Number(id));

    saveDatabase();
    return true;
  },

  // --- CHAPTER CONTENT FOR ADMIN ---
  getAdminChapterContent(chapterId: number): any {
    const db = loadDatabase();
    const chId = Number(chapterId);
    const chapter = db.chapters.find(c => c.id === chId);

    const lecs = db.lectures.filter(l => l.chapter_id === chId && l.video_type !== 'dpp_video');
    const dppVideos = db.lectures.filter(l => l.chapter_id === chId && l.video_type === 'dpp_video');
    const notes = db.notes.filter(n => n.chapter_id === chId && n.type === 'note');
    const dppPdfs = db.notes.filter(n => n.chapter_id === chId && n.type === 'dpp_pdf');
    const quizzes = db.quizzes.filter(q => q.chapter_id === chId);

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
    const lec = db.lectures.find(l => l.id === Number(lectureId));
    if (!lec) return null;

    const extras = db.extra_resources.filter(e => e.lecture_id === lec.id);
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

    const lecNumber = Number(payload.lecture_number) || Number(payload.lecture_order) || db.lectures.filter(l => l.chapter_id === chId).length + 1;
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
      is_today: payload.is_today !== undefined ? Number(payload.is_today) : 0,
      thumbnail_url: payload.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600',
      display_order: Number(payload.lecture_order) || lecNumber,
      lecture_number: lecNumber,
      video_type: 'lecture',
      is_published: payload.is_published !== undefined ? Number(payload.is_published) : 1,
      created_at: new Date().toISOString()
    };
    db.lectures.push(newLecture);

    // Optional Notes
    if (payload.notes_title && payload.notes_pdf_url) {
      db.notes.push({
        id: db.nextId.note++,
        chapter_id: chId,
        lecture_id: lectureId,
        title: payload.notes_title,
        external_link: payload.notes_pdf_url,
        file_size: payload.notes_file_size || '2.4 MB',
        type: 'note',
        display_order: lecNumber,
        is_published: 1,
        created_at: new Date().toISOString()
      });
    }

    // Optional DPP PDF
    if (payload.dpp_pdf_title && payload.dpp_pdf_url) {
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
    return newLecture;
  },

  updateUnifiedLecture(lectureId: number, payload: any): any {
    const db = loadDatabase();
    const lecId = Number(lectureId);
    const lecIdx = db.lectures.findIndex(l => l.id === lecId);
    if (lecIdx === -1) return null;

    const existingLec = db.lectures[lecIdx];
    const chId = existingLec.chapter_id;
    const lecNumber = Number(payload.lecture_number) || Number(payload.lecture_order) || existingLec.lecture_number || 1;

    db.lectures[lecIdx] = {
      ...existingLec,
      title: payload.lecture_title || existingLec.title,
      external_link: payload.lecture_video_url !== undefined ? payload.lecture_video_url : existingLec.external_link,
      duration: payload.lecture_duration || existingLec.duration,
      teacher_name: payload.teacher_name !== undefined ? payload.teacher_name : existingLec.teacher_name,
      lecture_date: payload.lecture_date || existingLec.lecture_date,
      is_live: payload.is_live !== undefined ? Number(payload.is_live) : existingLec.is_live,
      thumbnail_url: payload.thumbnail_url !== undefined ? payload.thumbnail_url : existingLec.thumbnail_url,
      display_order: Number(payload.lecture_order) || existingLec.display_order,
      lecture_number: lecNumber,
      is_published: payload.is_published !== undefined ? Number(payload.is_published) : existingLec.is_published
    };

    // Update or Insert Note
    const existingNoteIdx = db.notes.findIndex(n => n.lecture_id === lecId && n.type === 'note');
    if (payload.notes_title && payload.notes_pdf_url) {
      if (existingNoteIdx !== -1) {
        db.notes[existingNoteIdx] = {
          ...db.notes[existingNoteIdx],
          title: payload.notes_title,
          external_link: payload.notes_pdf_url,
          file_size: payload.notes_file_size || '2.4 MB'
        };
      } else {
        db.notes.push({
          id: db.nextId.note++,
          chapter_id: chId,
          lecture_id: lecId,
          title: payload.notes_title,
          external_link: payload.notes_pdf_url,
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
    const existingDppPdfIdx = db.notes.findIndex(n => n.lecture_id === lecId && n.type === 'dpp_pdf');
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
    const existingQuizIdx = db.quizzes.findIndex(q => q.lecture_id === lecId);
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
    return db.lectures[lecIdx];
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
    return newLec;
  },

  updateVideo(id: number, data: Partial<Lecture>): Lecture | null {
    const db = loadDatabase();
    const idx = db.lectures.findIndex(l => l.id === Number(id));
    if (idx === -1) return null;
    db.lectures[idx] = {
      ...db.lectures[idx],
      ...data,
      video_type: (data as any).type || data.video_type || db.lectures[idx].video_type,
      id: Number(id)
    };
    saveDatabase();
    return db.lectures[idx];
  },

  deleteVideo(id: number): boolean {
    const db = loadDatabase();
    const initLen = db.lectures.length;
    db.lectures = db.lectures.filter(l => l.id !== Number(id));
    db.extra_resources = db.extra_resources.filter(e => e.lecture_id !== Number(id));
    saveDatabase();
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
    return newNote;
  },

  updatePdf(id: number, data: Partial<Note>): Note | null {
    const db = loadDatabase();
    const idx = db.notes.findIndex(n => n.id === Number(id));
    if (idx === -1) return null;
    db.notes[idx] = { ...db.notes[idx], ...data, id: Number(id) };
    saveDatabase();
    return db.notes[idx];
  },

  deletePdf(id: number): boolean {
    const db = loadDatabase();
    const initLen = db.notes.length;
    db.notes = db.notes.filter(n => n.id !== Number(id));
    saveDatabase();
    return db.notes.length !== initLen;
  },

  deleteQuiz(id: number): boolean {
    const db = loadDatabase();
    const initLen = db.quizzes.length;
    db.quizzes = db.quizzes.filter(q => q.id !== Number(id));
    saveDatabase();
    return db.quizzes.length !== initLen;
  },

  // Status Toggles
  setVideoToday(id: number, isToday: boolean | number): boolean {
    const db = loadDatabase();
    const v = db.lectures.find(l => l.id === Number(id));
    if (!v) return false;
    v.is_today = isToday ? 1 : 0;
    saveDatabase();
    return true;
  },

  setVideoLive(id: number, isLive: boolean | number): boolean {
    const db = loadDatabase();
    const v = db.lectures.find(l => l.id === Number(id));
    if (!v) return false;
    v.is_live = isLive ? 1 : 0;
    saveDatabase();
    return true;
  },

  setVideoStatus(id: number, isPublished: boolean | number): boolean {
    const db = loadDatabase();
    const v = db.lectures.find(l => l.id === Number(id));
    if (!v) return false;
    v.is_published = isPublished ? 1 : 0;
    saveDatabase();
    return true;
  },

  setPdfStatus(id: number, isPublished: boolean | number): boolean {
    const db = loadDatabase();
    const p = db.notes.find(n => n.id === Number(id));
    if (!p) return false;
    p.is_published = isPublished ? 1 : 0;
    saveDatabase();
    return true;
  },

  setQuizStatus(id: number, isPublished: boolean | number): boolean {
    const db = loadDatabase();
    const q = db.quizzes.find(qz => qz.id === Number(id));
    if (!q) return false;
    q.is_published = isPublished ? 1 : 0;
    saveDatabase();
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
    return db.teachers.find(t => t.id === Number(id)) || null;
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
    return newTeacher;
  },

  updateTeacher(id: number, data: Partial<Teacher>): Teacher | null {
    const db = loadDatabase();
    const idx = db.teachers.findIndex(t => t.id === Number(id));
    if (idx === -1) return null;
    db.teachers[idx] = { ...db.teachers[idx], ...data, id: Number(id) };
    saveDatabase();
    return db.teachers[idx];
  },

  deleteTeacher(id: number): boolean {
    const db = loadDatabase();
    const initLen = db.teachers.length;
    db.teachers = db.teachers.filter(t => t.id !== Number(id));
    saveDatabase();
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
    return newAnn;
  },

  deleteAnnouncement(id: number): boolean {
    const db = loadDatabase();
    const initLen = db.announcements.length;
    db.announcements = db.announcements.filter(a => a.id !== Number(id));
    saveDatabase();
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
    return newBanner;
  },

  updateBanner(id: number, data: Partial<Banner>): Banner | null {
    const db = loadDatabase();
    const idx = db.banners.findIndex(b => b.id === Number(id));
    if (idx === -1) return null;
    db.banners[idx] = { ...db.banners[idx], ...data, id: Number(id) };
    saveDatabase();
    return db.banners[idx];
  },

  setBannerStatus(id: number, isActive: boolean | number): boolean {
    const db = loadDatabase();
    const b = db.banners.find(bn => bn.id === Number(id));
    if (!b) return false;
    b.is_active = isActive ? 1 : 0;
    saveDatabase();
    return true;
  },

  reorderBanners(orderedIds: number[]): boolean {
    const db = loadDatabase();
    orderedIds.forEach((id, idx) => {
      const banner = db.banners.find(b => b.id === Number(id));
      if (banner) banner.display_order = idx + 1;
    });
    saveDatabase();
    return true;
  },

  deleteBanner(id: number): boolean {
    const db = loadDatabase();
    const initLen = db.banners.length;
    db.banners = db.banners.filter(b => b.id !== Number(id));
    saveDatabase();
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
    return newLink;
  },

  updateNavLink(id: number, data: Partial<NavLinkItem>): NavLinkItem | null {
    const db = loadDatabase();
    const idx = db.nav_links.findIndex(l => l.id === Number(id));
    if (idx === -1) return null;
    db.nav_links[idx] = { ...db.nav_links[idx], ...data, id: Number(id) };
    saveDatabase();
    return db.nav_links[idx];
  },

  deleteNavLink(id: number): boolean {
    const db = loadDatabase();
    const initLen = db.nav_links.length;
    db.nav_links = db.nav_links.filter(l => l.id !== Number(id));
    saveDatabase();
    return db.nav_links.length !== initLen;
  },

  // --- USERS ---
  getUsers(): UserItem[] {
    const db = loadDatabase();
    return [...db.users];
  },

  deleteUser(id: number): boolean {
    const db = loadDatabase();
    const initLen = db.users.length;
    db.users = db.users.filter(u => u.id !== Number(id));
    saveDatabase();
    return db.users.length !== initLen;
  },

  // --- TODAY & UPCOMING LECTURES ---
  getTodayLectures(batchId?: string): Lecture[] {
    const db = loadDatabase();
    let result = db.lectures.filter(l => l.is_published !== 0 && (l.is_today === 1 || l.is_live === 1));

    if (batchId) {
      const subIds = db.subjects.filter(s => String(s.batch_id) === String(batchId)).map(s => s.id);
      const chIds = db.chapters.filter(c => subIds.includes(c.subject_id)).map(c => c.id);
      result = result.filter(l => chIds.includes(l.chapter_id));
    }

    return result.map(lec => {
      const ch = db.chapters.find(c => c.id === lec.chapter_id);
      const sub = ch ? db.subjects.find(s => s.id === ch.subject_id) : null;
      return {
        ...lec,
        chapter_title: ch?.title || '',
        subject_name: sub?.name || 'Subject'
      };
    });
  },

  getUpcomingLectures(batchId?: string): Lecture[] {
    const db = loadDatabase();
    let result = db.lectures.filter(l => l.is_published !== 0 && l.is_live !== 1 && l.is_today !== 1);

    if (batchId) {
      const subIds = db.subjects.filter(s => String(s.batch_id) === String(batchId)).map(s => s.id);
      const chIds = db.chapters.filter(c => subIds.includes(c.subject_id)).map(c => c.id);
      result = result.filter(l => chIds.includes(l.chapter_id));
    }

    return result.slice(0, 10).map(lec => {
      const ch = db.chapters.find(c => c.id === lec.chapter_id);
      const sub = ch ? db.subjects.find(s => s.id === ch.subject_id) : null;
      return {
        ...lec,
        chapter_title: ch?.title || '',
        subject_name: sub?.name || 'Subject'
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
