import {
  ChapterYearItem,
  CourseReviewItem,
  VideoYearItem,
  YearChapterItem,
} from '@/types';

export const DEFAULT_SAMPLE_VIDEO = 'https://vjs.zencdn.net/v/oceans.mp4';

export const defaultVideoYearItems: VideoYearItem[] = [
  {
    id: 'v1',
    year: '2024',
    description: 'Complete paper breakdown with step-by-step derivations & error checks',
    duration: '2.8 hrs',
  },
  {
    id: 'v2',
    year: '2023',
    description: 'Detailed numerical derivations and concept analysis for high-yield questions',
    duration: '3.1 hrs',
  },
  {
    id: 'v3',
    year: '2022',
    description: 'Past paper questions with speed solving techniques and shortcuts',
    duration: '2.5 hrs',
  },
  {
    id: 'v4',
    year: '2021',
    description: 'Exam pattern drills & high-frequency formulas reviewed thoroughly',
    duration: '2.9 hrs',
  },
  {
    id: 'v5',
    year: '2020',
    description: 'In-depth video analysis and conceptual drills for tricky sections',
    duration: '2.4 hrs',
  },
  {
    id: 'v6',
    year: '2019',
    description: 'Previous year question paper complete walkthrough with solutions',
    duration: '2.7 hrs',
  },
];

export const defaultCourseReviewItems: CourseReviewItem[] = [
  {
    id: 'r1',
    name: 'Aarav Sharma',
    rating: 5,
    date: '2 days ago',
    comment:
      'Extremely well structured PYQ solutions. Cleared all my conceptual doubts!',
  },
  {
    id: 'r2',
    name: 'Priya Patel',
    rating: 5,
    date: '1 week ago',
    comment:
      'The video explanations for past 10 years papers are the best on this platform.',
  },
  {
    id: 'r3',
    name: 'Rohan Sen',
    rating: 4,
    date: '2 weeks ago',
    comment:
      'Great depth in problem-solving techniques and formula shortcuts.',
  },
];

export const defaultPhysicsChapters: YearChapterItem[] = [
  {
    id: 'ch-1',
    chapterNumber: '01',
    title: 'Units, Dimensions & Errors',
    subtitle: 'Dimensional analysis, significant figures & vernier calipers',
    duration: '22:15',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop',
    questionsCount: 4,
  },
  {
    id: 'ch-2',
    chapterNumber: '02',
    title: 'Kinematics & 2D Motion',
    subtitle: '1D motion, projectile motion & relative velocity vectors',
    duration: '31:40',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=800&auto=format&fit=crop',
    questionsCount: 5,
  },
  {
    id: 'ch-3',
    chapterNumber: '03',
    title: 'Laws of Motion & Friction',
    subtitle: 'Free body diagrams, static/kinetic friction & tension',
    duration: '38:20',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1518152006812-edab29b069ac?q=80&w=800&auto=format&fit=crop',
    questionsCount: 6,
  },
  {
    id: 'ch-4',
    chapterNumber: '04',
    title: 'Work, Energy & Power',
    subtitle: 'Work-energy theorem, conservative forces & spring potential',
    duration: '26:50',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
    questionsCount: 4,
  },
  {
    id: 'ch-5',
    chapterNumber: '05',
    title: 'Rotational Motion & Dynamics',
    subtitle: 'Moment of inertia, torque & angular momentum conservation',
    duration: '44:10',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800&auto=format&fit=crop',
    questionsCount: 7,
  },
  {
    id: 'ch-6',
    chapterNumber: '06',
    title: 'Gravitation & Kepler Laws',
    subtitle: 'Gravitational potential, escape velocity & orbital motion',
    duration: '24:35',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=800&auto=format&fit=crop',
    questionsCount: 4,
  },
  {
    id: 'ch-7',
    chapterNumber: '07',
    title: 'Thermodynamics & Heat Transfer',
    subtitle: 'First law of thermodynamics, Carnot engine & heat conduction',
    duration: '35:12',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?q=80&w=800&auto=format&fit=crop',
    questionsCount: 5,
  },
  {
    id: 'ch-8',
    chapterNumber: '08',
    title: 'Wave Optics & Interference',
    subtitle: 'Young double slit experiment, diffraction & polarization',
    duration: '29:45',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=800&auto=format&fit=crop',
    questionsCount: 5,
  },
];

export const defaultChemistryChapters: YearChapterItem[] = [
  {
    id: 'chem-ch-1',
    chapterNumber: '01',
    title: 'Basic Concepts of Chemistry',
    subtitle: 'Mole concept, stoichiometry & concentration units',
    duration: '25:10',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800&auto=format&fit=crop',
    questionsCount: 4,
  },
  {
    id: 'chem-ch-2',
    chapterNumber: '02',
    title: 'Atomic Structure & Orbitals',
    subtitle: 'Bohr model, quantum numbers & electronic configuration',
    duration: '30:45',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?q=80&w=800&auto=format&fit=crop',
    questionsCount: 5,
  },
  {
    id: 'chem-ch-3',
    chapterNumber: '03',
    title: 'Chemical Bonding & VSEPR',
    subtitle: 'Hybridization, molecular orbital theory & bond polarity',
    duration: '36:20',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=800&auto=format&fit=crop',
    questionsCount: 6,
  },
  {
    id: 'chem-ch-4',
    chapterNumber: '04',
    title: 'Chemical Thermodynamics',
    subtitle: 'First law, enthalpy, entropy & Gibbs free energy',
    duration: '32:15',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?q=80&w=800&auto=format&fit=crop',
    questionsCount: 5,
  },
  {
    id: 'chem-ch-5',
    chapterNumber: '05',
    title: 'Equilibrium & pH Calculations',
    subtitle: 'Le Chatelier principle, ionic equilibrium & buffer systems',
    duration: '39:50',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop',
    questionsCount: 7,
  },
  {
    id: 'chem-ch-6',
    chapterNumber: '06',
    title: 'Coordination Chemistry',
    subtitle: 'IUPAC naming, crystal field theory & isomerism',
    duration: '28:30',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800&auto=format&fit=crop',
    questionsCount: 5,
  },
];

export const defaultMathChapters: YearChapterItem[] = [
  {
    id: 'math-ch-1',
    chapterNumber: '01',
    title: 'Sets, Relations & Functions',
    subtitle: 'Types of relations, domain, range & composite functions',
    duration: '27:10',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=800&auto=format&fit=crop',
    questionsCount: 4,
  },
  {
    id: 'math-ch-2',
    chapterNumber: '02',
    title: 'Matrices & Determinants',
    subtitle: 'Properties of determinants, adjoint & matrix inversion',
    duration: '34:25',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?q=80&w=800&auto=format&fit=crop',
    questionsCount: 5,
  },
  {
    id: 'math-ch-3',
    chapterNumber: '03',
    title: 'Limits, Continuity & Differentiability',
    subtitle: 'Standard limits, L’Hôpital rule & continuity proofs',
    duration: '36:40',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop',
    questionsCount: 6,
  },
  {
    id: 'math-ch-4',
    chapterNumber: '04',
    title: 'Definite Integrals & Areas',
    subtitle: 'Definite integral properties & bounded curve area problems',
    duration: '42:15',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1518152006812-edab29b069ac?q=80&w=800&auto=format&fit=crop',
    questionsCount: 7,
  },
  {
    id: 'math-ch-5',
    chapterNumber: '05',
    title: 'Vectors & 3D Geometry',
    subtitle: 'Dot product, cross product, line and plane equations',
    duration: '38:50',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
    questionsCount: 6,
  },
];

export function getChapterYears(chapterNumber: string, chapterTitle: string): ChapterYearItem[] {
  const yearsData = [
    {
      year: '2024',
      duration: '24:15',
      questionsCount: 4,
      subtitle: 'Dimensional analysis, vernier precision & error formulas',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop',
    },
    {
      year: '2023',
      duration: '28:30',
      questionsCount: 5,
      subtitle: 'Calculus-based derivations, vector methods & speed shortcuts',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=800&auto=format&fit=crop',
    },
    {
      year: '2022',
      duration: '22:45',
      questionsCount: 4,
      subtitle: 'Graphical analysis, boundary value proofs & exam patterns',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1518152006812-edab29b069ac?q=80&w=800&auto=format&fit=crop',
    },
    {
      year: '2021',
      duration: '31:20',
      questionsCount: 6,
      subtitle: 'High-frequency question drills & step-by-step paper review',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
    },
    {
      year: '2020',
      duration: '25:10',
      questionsCount: 5,
      subtitle: 'Standard approximations, error bounds & analytical methods',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800&auto=format&fit=crop',
    },
    {
      year: '2019',
      duration: '19:40',
      questionsCount: 4,
      subtitle: 'Free body balance, conservation laws & calculation tricks',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=800&auto=format&fit=crop',
    },
    {
      year: '2018',
      duration: '27:50',
      questionsCount: 5,
      subtitle: 'Past paper walkthrough with rigorous theoretical explanations',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?q=80&w=800&auto=format&fit=crop',
    },
    {
      year: '2017',
      duration: '23:15',
      questionsCount: 4,
      subtitle: 'Historical pattern questions & fundamental theorem applications',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?q=80&w=800&auto=format&fit=crop',
    },
  ];

  return yearsData.map((item, idx) => ({
    id: `yr-${chapterNumber}-${item.year}`,
    year: item.year,
    title: `${item.year} Solutions • Ch ${chapterNumber}`,
    subtitle: item.subtitle,
    duration: item.duration,
    thumbnailUrl: item.thumbnailUrl,
    questionsCount: item.questionsCount,
    questionText: `Q${idx + 1}. In the context of ${chapterTitle}, analyze the given setup from WBJEE / NEET ${item.year} and find the exact value or proof.`,
    answerText: `Detailed step-by-step derivation for ${chapterTitle} (${item.year}): Apply first principles, substitute boundary constraints, and simplify to obtain the result.`,
  }));
}
