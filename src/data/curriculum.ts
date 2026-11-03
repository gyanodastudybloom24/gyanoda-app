import type { FilterOption, StudyResource, SyllabusModule, TestItem } from '@/types';

export const filterSubjects: FilterOption[] = [
  { id: 'all', label: 'All Subjects' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'planning', label: 'Planning & Design' },
  { id: 'structures', label: 'Structural Systems' },
  { id: 'technology', label: 'Building Technology' },
  { id: 'environmental', label: 'Environmental Studies' },
];

export const filterChapters: FilterOption[] = [
  { id: 'all', label: 'All Chapters' },
  { id: 'housing_design', label: 'Housing Design' },
  { id: 'spatial_aptitude', label: 'Spatial Aptitude' },
  { id: 'building_materials', label: 'Building Materials' },
  { id: 'urban_planning', label: 'Urban Planning' },
  { id: 'history_arch', label: 'History of Architecture' },
];

export const filterYears: FilterOption[] = [
  { id: 'all', label: 'All Years' },
  { id: '2024', label: '2024' },
  { id: '2023', label: '2023' },
  { id: '2022', label: '2022' },
  { id: '2021', label: '2021' },
];

export const initialSyllabusModules: SyllabusModule[] = [
  {
    id: 'mod-1',
    title: 'Spatial Aptitude',
    subtitle: '3D Projections, Isometric Perspective & Mental Rotations',
    subject: 'Architecture',
    chapter: 'Spatial Aptitude',
    year: '2024',
    lessonsCount: 14,
    duration: '6 hrs',
    progress: 45,
    backgroundColor: '#d8d2f6',
    textColor: '#2d274e',
  },
  {
    id: 'mod-2',
    title: 'Housing Design',
    subtitle: 'Residential Layouts, Density & Neighborhood Clustering',
    subject: 'Architecture',
    chapter: 'Housing Design',
    year: '2024',
    lessonsCount: 18,
    duration: '8.5 hrs',
    progress: 70,
    backgroundColor: '#d0e8f2',
    textColor: '#1f3c4d',
  },
  {
    id: 'mod-3',
    title: 'Building Construction',
    subtitle: 'Load Bearing Masonry, Foundation Types & Framing',
    subject: 'Architecture',
    chapter: 'Building Materials',
    year: '2024',
    lessonsCount: 22,
    duration: '11 hrs',
    progress: 20,
    backgroundColor: '#faeed6',
    textColor: '#4a371e',
  },
  {
    id: 'mod-4',
    title: 'Structural Systems',
    subtitle: 'Trusses, Tensile Membranes & Seismic Lateral Resisting',
    subject: 'Structural Systems',
    chapter: 'Spatial Aptitude',
    year: '2023',
    lessonsCount: 16,
    duration: '7.5 hrs',
    progress: 0,
    backgroundColor: '#e2f0d9',
    textColor: '#29431e',
  },
];

export const STUDY_RESOURCES: StudyResource[] = [
  {
    id: 'res-1',
    title: 'Formula & Equation Handbook',
    description: 'Quick-reference equations for Physics & Physical Chemistry',
    type: 'Handbook',
    icon: 'NotebookBookmark',
  },
  {
    id: 'res-2',
    title: 'High-Yield Revision Flashcards',
    description: 'Definitions, laws, and key constants for quick review',
    type: 'Flashcards',
    icon: 'CardSearch',
  },
  {
    id: 'res-3',
    title: 'Solved Exemplar Problems',
    description: 'Step-by-step verified solutions for advanced conceptual problems',
    type: 'Solutions',
    icon: 'CheckSquare',
  },
  {
    id: 'res-4',
    title: 'Previous Years Analysis Report',
    description: 'Weightage trends and high-frequency topics from 2015-2024',
    type: 'Analysis',
    icon: 'Chart2',
  },
];

export const TESTS: TestItem[] = [
  {
    id: 'test-1',
    title: 'Mechanics & Laws of Motion Quiz',
    subject: 'Physics',
    questions: 25,
    durationMins: 45,
    status: 'Available',
  },
  {
    id: 'test-2',
    title: 'Organic Chemistry Mock Exam 1',
    subject: 'Chemistry',
    questions: 30,
    durationMins: 60,
    status: 'Available',
  },
  {
    id: 'test-3',
    title: 'Calculus & Integration Full Test',
    subject: 'Mathematics',
    questions: 30,
    durationMins: 60,
    status: 'Available',
  },
  {
    id: 'test-4',
    title: 'WBJEE Full Syllabus Mock 2024',
    subject: 'All Subjects',
    questions: 100,
    durationMins: 180,
    status: 'Upcoming',
  },
];

