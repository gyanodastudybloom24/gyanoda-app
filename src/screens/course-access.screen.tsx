import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SolarIcon } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { customAlert } from '@/components/ui';
import { Fonts, MaxContentWidth, Palette, Rounded, Spacing } from '@/constants/theme';
import { useEnrolledCourses } from '@/hooks/use-enrolled-courses';
import { useSubscription } from '@/hooks/use-subscription';
import { useTheme } from '@/hooks/use-theme';
import type { RootStackScreenProps } from '@/types/navigation';
import { triggerHaptic } from '@/utils';

export type CourseAccessScreenProps = RootStackScreenProps<'CourseAccess'>;

export interface YearWiseItem {
  id: string;
  year: string;
  title: string;
  description: string;
  duration: string;
  questionsCount: number;
  thumbnailUrl?: string;
}

export interface ChapterWiseItem {
  id: string;
  chapterNumber: string;
  title: string;
  subtitle: string;
  duration: string;
  lessonsCount: number;
}

export interface SubjectAccessData {
  title: string;
  description: string;
  imageUrl: string;
  years: YearWiseItem[];
  chapters: ChapterWiseItem[];
}

const subjectDetailsMap: Record<string, SubjectAccessData> = {
  physics: {
    title: 'Physics',
    description:
      'Comprehensive previous year question walkthroughs, key formulas & core theoretical concepts.',
    imageUrl:
      'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1200&auto=format&fit=crop',
    years: [
      {
        id: 'phy-2024',
        year: '2024',
        title: '2024 PYQ Solutions',
        description: 'Complete paper breakdown with step-by-step derivations',
        duration: '2.8 hrs',
        questionsCount: 30,
        thumbnailUrl:
          'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1200&auto=format&fit=crop',
      },
      {
        id: 'phy-2023',
        year: '2023',
        title: '2023 PYQ Solutions',
        description: 'Detailed numerical derivations and concept analysis',
        duration: '3.1 hrs',
        questionsCount: 30,
        thumbnailUrl:
          'https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=1200&auto=format&fit=crop',
      },
      {
        id: 'phy-2022',
        year: '2022',
        title: '2022 PYQ Solutions',
        description: 'Past paper questions with speed solving techniques',
        duration: '2.5 hrs',
        questionsCount: 30,
        thumbnailUrl:
          'https://images.unsplash.com/photo-1518152006812-edab29b069ac?q=80&w=1200&auto=format&fit=crop',
      },
      {
        id: 'phy-2021',
        year: '2021',
        title: '2021 PYQ Solutions',
        description: 'Exam pattern drills & high-frequency formulas',
        duration: '2.9 hrs',
        questionsCount: 30,
        thumbnailUrl:
          'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
      },
      {
        id: 'phy-2020',
        year: '2020',
        title: '2020 PYQ Solutions',
        description: 'In-depth video analysis and conceptual drills',
        duration: '2.4 hrs',
        questionsCount: 30,
        thumbnailUrl:
          'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1200&auto=format&fit=crop',
      },
      {
        id: 'phy-2019',
        year: '2019',
        title: '2019 PYQ Solutions',
        description: 'Previous year question paper walkthrough',
        duration: '2.7 hrs',
        questionsCount: 30,
        thumbnailUrl:
          'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1200&auto=format&fit=crop',
      },
    ],
    chapters: [
      {
        id: 'phy-ch-1',
        chapterNumber: '01',
        title: 'Units, Dimensions & Errors',
        subtitle: 'Dimensional analysis, significant figures & vernier calipers',
        duration: '1.5 hrs',
        lessonsCount: 4,
      },
      {
        id: 'phy-ch-2',
        chapterNumber: '02',
        title: 'Kinematics & 2D Motion',
        subtitle: '1D motion, projectile motion & relative velocity vectors',
        duration: '2.8 hrs',
        lessonsCount: 6,
      },
      {
        id: 'phy-ch-3',
        chapterNumber: '03',
        title: 'Laws of Motion & Friction',
        subtitle: 'Newton laws, free body diagrams, friction & tension',
        duration: '3.4 hrs',
        lessonsCount: 8,
      },
      {
        id: 'phy-ch-4',
        chapterNumber: '04',
        title: 'Work, Energy & Power',
        subtitle: 'Work-energy theorem, conservative forces & power',
        duration: '2.2 hrs',
        lessonsCount: 5,
      },
      {
        id: 'phy-ch-5',
        chapterNumber: '05',
        title: 'Rotational Dynamics & Inertia',
        subtitle: 'Moment of inertia, torque, rolling motion & angular momentum',
        duration: '4.1 hrs',
        lessonsCount: 9,
      },
      {
        id: 'phy-ch-6',
        chapterNumber: '06',
        title: 'Gravitation & Kepler Laws',
        subtitle: 'Gravitational potential, escape velocity & orbital motion',
        duration: '1.8 hrs',
        lessonsCount: 4,
      },
      {
        id: 'phy-ch-7',
        chapterNumber: '07',
        title: 'Thermodynamics & Heat',
        subtitle: 'First & second laws, heat engines & Carnot cycle',
        duration: '3.2 hrs',
        lessonsCount: 7,
      },
      {
        id: 'phy-ch-8',
        chapterNumber: '08',
        title: 'Electrostatics & Capacitors',
        subtitle: 'Coulomb law, Gauss theorem, electric field & capacitors',
        duration: '4.5 hrs',
        lessonsCount: 10,
      },
      {
        id: 'phy-ch-9',
        chapterNumber: '09',
        title: 'Current Electricity',
        subtitle: 'Kirchhoff laws, Wheatstone bridge & potentiometer circuits',
        duration: '3.6 hrs',
        lessonsCount: 8,
      },
      {
        id: 'phy-ch-10',
        chapterNumber: '10',
        title: 'Wave Optics & Interference',
        subtitle: 'Huygens principle, Young double slit & diffraction patterns',
        duration: '3.0 hrs',
        lessonsCount: 7,
      },
    ],
  },
  chemistry: {
    title: 'Chemistry',
    description:
      'In-depth reaction mechanisms, periodic trends & past paper analytical problem drills.',
    imageUrl:
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1200&auto=format&fit=crop',
    years: [
      {
        id: 'chem-2024',
        year: '2024',
        title: '2024 PYQ Solutions',
        description: 'Complete examination walkthrough and reaction mechanisms',
        duration: '2.6 hrs',
        questionsCount: 30,
        thumbnailUrl:
          'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1200&auto=format&fit=crop',
      },
      {
        id: 'chem-2023',
        year: '2023',
        title: '2023 PYQ Solutions',
        description: 'Physical & inorganic high-yield question analysis',
        duration: '2.9 hrs',
        questionsCount: 30,
        thumbnailUrl:
          'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?q=80&w=1200&auto=format&fit=crop',
      },
      {
        id: 'chem-2022',
        year: '2022',
        title: '2022 PYQ Solutions',
        description: 'Organic reaction pathways and reagent trends',
        duration: '2.4 hrs',
        questionsCount: 30,
        thumbnailUrl:
          'https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1200&auto=format&fit=crop',
      },
      {
        id: 'chem-2021',
        year: '2021',
        title: '2021 PYQ Solutions',
        description: 'Stoichiometry & equilibrium question problem sets',
        duration: '2.7 hrs',
        questionsCount: 30,
        thumbnailUrl:
          'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?q=80&w=1200&auto=format&fit=crop',
      },
      {
        id: 'chem-2020',
        year: '2020',
        title: '2020 PYQ Solutions',
        description: 'Thermodynamics & kinetics problem sets solved',
        duration: '2.3 hrs',
        questionsCount: 30,
        thumbnailUrl:
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop',
      },
    ],
    chapters: [
      {
        id: 'chem-ch-1',
        chapterNumber: '01',
        title: 'Basic Concepts of Chemistry',
        subtitle: 'Mole concept, stoichiometry & concentration units',
        duration: '2.0 hrs',
        lessonsCount: 5,
      },
      {
        id: 'chem-ch-2',
        chapterNumber: '02',
        title: 'Atomic Structure & Orbitals',
        subtitle: 'Bohr model, quantum numbers & electronic configuration',
        duration: '2.5 hrs',
        lessonsCount: 6,
      },
      {
        id: 'chem-ch-3',
        chapterNumber: '03',
        title: 'Chemical Bonding & VSEPR',
        subtitle: 'Hybridization, molecular orbital theory & bond polarity',
        duration: '3.2 hrs',
        lessonsCount: 8,
      },
      {
        id: 'chem-ch-4',
        chapterNumber: '04',
        title: 'Chemical Thermodynamics',
        subtitle: 'First law, enthalpy, entropy & Gibbs free energy',
        duration: '3.0 hrs',
        lessonsCount: 7,
      },
      {
        id: 'chem-ch-5',
        chapterNumber: '05',
        title: 'Equilibrium & pH Calculations',
        subtitle: 'Le Chatelier principle, ionic equilibrium & buffer systems',
        duration: '3.5 hrs',
        lessonsCount: 9,
      },
      {
        id: 'chem-ch-6',
        chapterNumber: '06',
        title: 'Coordination Chemistry',
        subtitle: 'IUPAC naming, crystal field theory & isomerism',
        duration: '2.8 hrs',
        lessonsCount: 7,
      },
      {
        id: 'chem-ch-7',
        chapterNumber: '07',
        title: 'Reaction Mechanisms (SN1/SN2)',
        subtitle: 'Nucleophilic substitution, elimination & stereochemistry',
        duration: '3.8 hrs',
        lessonsCount: 10,
      },
      {
        id: 'chem-ch-8',
        chapterNumber: '08',
        title: 'Aldehydes, Ketones & Acids',
        subtitle: 'Nucleophilic addition, Aldol & Cannizzaro reactions',
        duration: '4.0 hrs',
        lessonsCount: 11,
      },
    ],
  },
  maths: {
    title: 'Maths',
    description:
      'Step-by-step calculus, algebra proofs, formula shortcuts & high-yield previous year questions.',
    imageUrl:
      'https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=1200&auto=format&fit=crop',
    years: [
      {
        id: 'math-2024',
        year: '2024',
        title: '2024 PYQ Solutions',
        description: 'Complete paper problem-solving with speed tricks',
        duration: '3.2 hrs',
        questionsCount: 30,
        thumbnailUrl:
          'https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=1200&auto=format&fit=crop',
      },
      {
        id: 'math-2023',
        year: '2023',
        title: '2023 PYQ Solutions',
        description: 'Calculus & vector 3D intensive analytical drills',
        duration: '3.4 hrs',
        questionsCount: 30,
        thumbnailUrl:
          'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?q=80&w=1200&auto=format&fit=crop',
      },
      {
        id: 'math-2022',
        year: '2022',
        title: '2022 PYQ Solutions',
        description: 'Coordinate geometry & algebra past paper breakdown',
        duration: '2.8 hrs',
        questionsCount: 30,
        thumbnailUrl:
          'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1200&auto=format&fit=crop',
      },
      {
        id: 'math-2021',
        year: '2021',
        title: '2021 PYQ Solutions',
        description: 'Integration methods & matrix determinant drills',
        duration: '3.0 hrs',
        questionsCount: 30,
        thumbnailUrl:
          'https://images.unsplash.com/photo-1518152006812-edab29b069ac?q=80&w=1200&auto=format&fit=crop',
      },
      {
        id: 'math-2020',
        year: '2020',
        title: '2020 PYQ Solutions',
        description: 'Differential equations & probability solved papers',
        duration: '2.6 hrs',
        questionsCount: 30,
        thumbnailUrl:
          'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
      },
    ],
    chapters: [
      {
        id: 'math-ch-1',
        chapterNumber: '01',
        title: 'Sets, Relations & Functions',
        subtitle: 'Types of relations, domain, range & composite functions',
        duration: '2.2 hrs',
        lessonsCount: 5,
      },
      {
        id: 'math-ch-2',
        chapterNumber: '02',
        title: 'Complex Numbers & Quadratics',
        subtitle: 'Argand plane, Euler form & roots of quadratic equations',
        duration: '2.8 hrs',
        lessonsCount: 7,
      },
      {
        id: 'math-ch-3',
        chapterNumber: '03',
        title: 'Matrices & Determinants',
        subtitle: 'Properties of determinants, adjoint & matrix inversion',
        duration: '2.5 hrs',
        lessonsCount: 6,
      },
      {
        id: 'math-ch-4',
        chapterNumber: '04',
        title: 'Limits & Continuity',
        subtitle: 'L’Hôpital rule, standard limits & differentiability criteria',
        duration: '3.0 hrs',
        lessonsCount: 8,
      },
      {
        id: 'math-ch-5',
        chapterNumber: '05',
        title: 'Application of Derivatives',
        subtitle: 'Monotonicity, maxima-minima & tangent-normal equations',
        duration: '3.5 hrs',
        lessonsCount: 9,
      },
      {
        id: 'math-ch-6',
        chapterNumber: '06',
        title: 'Definite Integrals & Areas',
        subtitle: 'Properties of definite integrals & bounded curve areas',
        duration: '4.2 hrs',
        lessonsCount: 11,
      },
      {
        id: 'math-ch-7',
        chapterNumber: '07',
        title: 'Differential Equations',
        subtitle: 'Order, degree, variable separable & integrating factor',
        duration: '2.6 hrs',
        lessonsCount: 6,
      },
      {
        id: 'math-ch-8',
        chapterNumber: '08',
        title: 'Vectors & 3D Geometry',
        subtitle: 'Dot & cross product, line equations & coplanar planes',
        duration: '4.0 hrs',
        lessonsCount: 10,
      },
    ],
  },
  all: {
    title: 'All Subjects',
    description:
      'Complete access across all subjects, chapter-wise lectures & 15+ years solved question banks.',
    imageUrl:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop',
    years: [
      {
        id: 'all-2024',
        year: '2024',
        title: '2024 All-Subject PYQs',
        description: 'Complete mock walkthrough across Physics, Chem & Maths',
        duration: '8.4 hrs',
        questionsCount: 90,
        thumbnailUrl:
          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop',
      },
      {
        id: 'all-2023',
        year: '2023',
        title: '2023 All-Subject PYQs',
        description: 'Integrated multi-subject paper analysis & tests',
        duration: '8.8 hrs',
        questionsCount: 90,
        thumbnailUrl:
          'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1200&auto=format&fit=crop',
      },
      {
        id: 'all-2022',
        year: '2022',
        title: '2022 All-Subject PYQs',
        description: 'Previous year question paper complete solutions',
        duration: '7.9 hrs',
        questionsCount: 90,
        thumbnailUrl:
          'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1200&auto=format&fit=crop',
      },
    ],
    chapters: [
      {
        id: 'all-ch-1',
        chapterNumber: '01',
        title: 'Physics Core Fundamentals',
        subtitle: 'Mechanics, Electrodynamics & Optics Master Modules',
        duration: '24 hrs',
        lessonsCount: 60,
      },
      {
        id: 'all-ch-2',
        chapterNumber: '02',
        title: 'Chemistry Complete Curriculum',
        subtitle: 'Physical, Organic & Inorganic High-Yield Concepts',
        duration: '18 hrs',
        lessonsCount: 45,
      },
      {
        id: 'all-ch-3',
        chapterNumber: '03',
        title: 'Mathematics Advanced Problem Sets',
        subtitle: 'Calculus, Algebra, 3D Vectors & Speed Shortcuts',
        duration: '32 hrs',
        lessonsCount: 75,
      },
    ],
  },
  biology: {
    title: 'Biology',
    description:
      'Detailed anatomical diagrams, human physiology explanations, and botanical classification modules.',
    imageUrl:
      'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?q=80&w=1200&auto=format&fit=crop',
    years: [
      {
        id: 'bio-2024',
        year: '2024',
        title: '2024 PYQ Solutions',
        description: 'NCERT diagram breakdowns and genetics problem sets',
        duration: '2.5 hrs',
        questionsCount: 45,
        thumbnailUrl:
          'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?q=80&w=1200&auto=format&fit=crop',
      },
      {
        id: 'bio-2023',
        year: '2023',
        title: '2023 PYQ Solutions',
        description: 'Human physiology & ecology previous year questions',
        duration: '2.8 hrs',
        questionsCount: 45,
        thumbnailUrl:
          'https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=1200&auto=format&fit=crop',
      },
      {
        id: 'bio-2022',
        year: '2022',
        title: '2022 PYQ Solutions',
        description: 'Cell biology & plant anatomy solved papers',
        duration: '2.4 hrs',
        questionsCount: 45,
        thumbnailUrl:
          'https://images.unsplash.com/photo-1518152006812-edab29b069ac?q=80&w=1200&auto=format&fit=crop',
      },
    ],
    chapters: [
      {
        id: 'bio-ch-1',
        chapterNumber: '01',
        title: 'The Living World & Classification',
        subtitle: 'Taxonomy, binomial nomenclature & five kingdom system',
        duration: '1.8 hrs',
        lessonsCount: 4,
      },
      {
        id: 'bio-ch-2',
        chapterNumber: '02',
        title: 'Cell: The Unit of Life',
        subtitle: 'Organelles, membrane structure, mitosis & meiosis',
        duration: '2.6 hrs',
        lessonsCount: 7,
      },
      {
        id: 'bio-ch-3',
        chapterNumber: '03',
        title: 'Human Physiology: Digestion & Respiration',
        subtitle: 'Enzyme actions, respiratory volumes & transport of gases',
        duration: '3.2 hrs',
        lessonsCount: 9,
      },
      {
        id: 'bio-ch-4',
        chapterNumber: '04',
        title: 'Genetics & Molecular Basis of Inheritance',
        subtitle: 'Mendel laws, DNA replication & transcription mechanisms',
        duration: '4.0 hrs',
        lessonsCount: 10,
      },
    ],
  },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
export const YEAR_CARD_WIDTH = 260;
const BUTTON_SIZE = 46;

interface YearWiseCardProps {
  item: YearWiseItem;
  fallbackImage: string;
  onPress: (item: YearWiseItem) => void;
}

function YearWiseCard({ item, fallbackImage, onPress }: YearWiseCardProps) {
  const theme = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={`Year ${item.year}: ${item.description}, Duration ${item.duration}`}
      onPress={() => onPress(item)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.yearContainer, animatedStyle]}>
      {/* 16:9 Ratio Compact Card matching Recently Watched Card */}
      <View
        style={[
          styles.yearCard,
          {
            borderColor: theme.border,
            backgroundColor: theme.backgroundElement,
          },
        ]}>
        {/* 16:9 Online Image Thumbnail */}
        <Image
          source={{ uri: item.thumbnailUrl ?? fallbackImage }}
          style={styles.yearThumbnail}
          contentFit="cover"
          transition={300}
        />

        {/* Gradient Scrim for text readability over thumbnail */}
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.35)', 'rgba(0, 0, 0, 0.45)', 'rgba(0, 0, 0, 0.85)']}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {/* Card Content as before: Year + Calendar badge, Description, and Duration */}
        <View style={styles.yearCardContent}>
          <View style={styles.yearCardTop}>
            <Text style={styles.yearCardYear}>{item.year}</Text>
            <View style={styles.yearBadge}>
              <SolarIcon
                name="Calendar"
                type="bold"
                size={13}
                color="#ffffff"
              />
            </View>
          </View>

          <Text style={styles.yearCardDesc} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.yearCardBottom}>
            <View style={styles.yearMetaRow}>
              <SolarIcon
                name="ClockCircle"
                type="linear"
                size={13}
                color="#ffffff"
              />
              <Text style={styles.yearDurationText}>{item.duration}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Play Button: Circular, black constant background, solid white border, positioned at bottom-right, NO progress indicator */}
      <View style={styles.yearPlayButton}>
        <SolarIcon
          name="Play"
          type="bold"
          size={18}
          color="#ffffff"
          style={styles.yearPlayIcon}
        />
      </View>
    </AnimatedPressable>
  );
}

export function CourseAccessScreen({
  route,
  navigation,
}: CourseAccessScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const subjectId = (route.params?.subjectId ?? 'physics').toLowerCase();

  const currentSubject = useMemo(() => {
    return subjectDetailsMap[subjectId] ?? subjectDetailsMap.physics;
  }, [subjectId]);

  const displayTitle = route.params?.title ?? currentSubject.title ?? 'Physics';

  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuAnim = useSharedValue(0);

  const { tier } = useSubscription();
  const enrolledCourses = useEnrolledCourses();

  // Find enrolled courses matching this subject (or all-subjects master bundle)
  const subjectEnrolledCourses = useMemo(() => {
    return enrolledCourses.filter((course) => {
      if (subjectId === 'all') return true;
      return (
        course.subjectId === subjectId ||
        course.id === subjectId ||
        course.id === `course-${subjectId}` ||
        course.id.includes(subjectId)
      );
    });
  }, [enrolledCourses, subjectId]);

  // If user upgraded to Pro/Plus, or enrolled in a Complete Course / Master Bundle, they have full access!
  const hasFullAccess = useMemo(() => {
    if (tier === 'pro' || tier === 'plus') return true;
    return subjectEnrolledCourses.some(
      (c) => c.category === 'Full Course' || c.category === 'Master Bundle'
    );
  }, [tier, subjectEnrolledCourses]);

  // Primary active enrolled course for this subject (if any)
  const activeEnrolledCourse = useMemo(() => {
    return subjectEnrolledCourses[0] ?? null;
  }, [subjectEnrolledCourses]);

  // Check if content is currently scoped to a Starter Pack or Chapter Pack
  const isStarterScoped = useMemo(() => {
    if (hasFullAccess) return false;
    if (activeEnrolledCourse) {
      return (activeEnrolledCourse.chaptersCount ?? 0) < currentSubject.chapters.length;
    }
    return false;
  }, [hasFullAccess, activeEnrolledCourse, currentSubject.chapters.length]);

  // Dynamic Scoped Years:
  // - If Pro/Plus (Full Access): all years for this subject
  // - If Starter Pack / Chapter Pack: strictly the enrolled years count (e.g. 2 years for starter pack)
  // - If not enrolled & on free tier: preview 1st year (2024)
  const scopedYears = useMemo(() => {
    if (hasFullAccess) return currentSubject.years;
    if (activeEnrolledCourse) {
      const count = activeEnrolledCourse.yearsCount ?? 2;
      return currentSubject.years.slice(0, Math.min(count, currentSubject.years.length));
    }
    return currentSubject.years;
  }, [hasFullAccess, activeEnrolledCourse, currentSubject.years]);

  // Dynamic Scoped Chapters:
  // - If Pro/Plus (Full Access): all chapters for this subject
  // - If Starter Pack / Chapter Pack: strictly the enrolled chapters count (e.g. 2 chapters for starter pack)
  // - If not enrolled & on free tier: preview 1st chapter (01)
  const scopedChapters = useMemo(() => {
    if (hasFullAccess) return currentSubject.chapters;
    if (activeEnrolledCourse) {
      const count = activeEnrolledCourse.chaptersCount ?? 2;
      return currentSubject.chapters.slice(0, Math.min(count, currentSubject.chapters.length));
    }
    return currentSubject.chapters;
  }, [hasFullAccess, activeEnrolledCourse, currentSubject.chapters]);

  // Header description scoped to active enrolled course
  const displayDescription = useMemo(() => {
    if (isStarterScoped && activeEnrolledCourse) {
      return `${activeEnrolledCourse.title}: ${scopedChapters.length} Chapters • ${scopedYears.length} Years (${activeEnrolledCourse.videosCount ?? 15} Videos)`;
    }
    return currentSubject.description;
  }, [isStarterScoped, activeEnrolledCourse, scopedChapters.length, scopedYears.length, currentSubject.description]);

  const filteredYears = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return scopedYears;
    return scopedYears.filter(
      (y) =>
        y.year.toLowerCase().includes(q) ||
        y.title.toLowerCase().includes(q) ||
        y.description.toLowerCase().includes(q)
    );
  }, [scopedYears, searchQuery]);

  const filteredChapters = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return scopedChapters;
    return scopedChapters.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.subtitle.toLowerCase().includes(q) ||
        c.chapterNumber.toLowerCase().includes(q)
    );
  }, [scopedChapters, searchQuery]);

  const handleYearPress = (item: YearWiseItem) => {
    // Check if unlocked
    const isUnlocked = hasFullAccess || scopedYears.some((y) => y.id === item.id);
    if (!isUnlocked) {
      triggerHaptic(20);
      customAlert.show({
        title: 'Gyanoda Pro Required',
        message: `${displayTitle} ${item.year} previous year question solutions are exclusive to Gyanoda Pro & Plus members. Upgrade your plan to unlock all years.`,
        type: 'confirm',
        buttons: [
          {
            text: 'Upgrade Plan',
            style: 'primary',
            onPress: () => {
              triggerHaptic(20);
              navigation.navigate('UpgradePlan');
            },
          },
        ],
      });
      return;
    }

    navigation.navigate('YearPlaylist', {
      yearId: item.id,
      year: item.year,
      subjectId,
      title: `${displayTitle} ${item.year} Solutions`,
      description: item.description,
      imageUrl: item.thumbnailUrl ?? currentSubject.imageUrl,
    });
  };

  const handleChapterPress = (item: ChapterWiseItem) => {
    // Check if unlocked
    const isUnlocked = hasFullAccess || scopedChapters.some((c) => c.id === item.id);
    if (!isUnlocked) {
      triggerHaptic(20);
      customAlert.show({
        title: 'Gyanoda Pro Required',
        message: `${displayTitle} Chapter ${item.chapterNumber} is part of the Gyanoda Pro curriculum. Upgrade your plan to unlock all chapter solutions.`,
        type: 'confirm',
        buttons: [
          {
            text: 'Upgrade Plan',
            style: 'primary',
            onPress: () => {
              triggerHaptic(20);
              navigation.navigate('UpgradePlan');
            },
          },
        ],
      });
      return;
    }

    navigation.navigate('ChapterPlaylist', {
      chapterId: item.id,
      chapterNumber: item.chapterNumber,
      subjectId,
      title: item.title,
      subtitle: item.subtitle,
      description: `Comprehensive year-wise previous year question walkthroughs for Chapter ${item.chapterNumber}: ${item.title}.`,
      imageUrl: currentSubject.imageUrl,
    });
  };

  const animatedMenuStyle = useAnimatedStyle(() => ({
    opacity: menuAnim.value,
    transform: [
      { translateY: (1 - menuAnim.value) * -8 },
      { scale: 0.88 + menuAnim.value * 0.12 },
    ],
  }));

  const toggleMenu = () => {
    if (isMenuOpen) {
      menuAnim.value = 0;
      setIsMenuOpen(false);
    } else {
      setIsMenuOpen(true);
      menuAnim.value = withSpring(1, { damping: 16, stiffness: 220 });
    }
  };

  const handleSharePress = async () => {
    try {
      await Share.share({
        title: currentSubject.title,
        message: `Check out ${currentSubject.title} on Gyanoda!`,
      });
    } catch {
      customAlert.show({
        title: 'Share Subject',
        message: `Link for ${currentSubject.title} is ready to share.`,
        type: 'info',
      });
    }
  };

  const handleSupportPress = () => {
    setIsMenuOpen(false);
    customAlert.show({
      title: 'Support',
      message: 'Need help? Contact support@gyanoda.edu.',
      type: 'info',
    });
  };

  const handleReportPress = () => {
    setIsMenuOpen(false);
    customAlert.show({
      title: 'Report Content',
      message: 'Would you like to report an issue with this content?',
      type: 'confirm',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit Report',
          style: 'primary',
          onPress: () => {
            customAlert.show({
              title: 'Report Submitted',
              message: 'Thank you for your report.',
              type: 'success',
            });
          },
        },
      ],
    });
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.six },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* 16:12 Media Thumbnail Container matching Course Details */}
        <View style={styles.mediaWrapper}>
          <View style={styles.mediaContainer}>
            <Image
              source={{ uri: currentSubject.imageUrl }}
              style={styles.mediaImage}
              contentFit="cover"
              transition={300}
            />

            {/* White gradient overlay: covered from the bottom, very little visible at the top, slightly diagonal */}
            <LinearGradient
              colors={[
                'rgba(255, 255, 255, 0)',
                'rgba(255, 255, 255, 0.40)',
                'rgba(255, 255, 255, 0.85)',
                'rgba(255, 255, 255, 0.98)',
                '#ffffff',
              ]}
              locations={[0, 0.10, 0.35, 0.58, 0.82]}
              start={{ x: 0.25, y: 0.0 }}
              end={{ x: 0.05, y: 0.95 }}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />

            {/* Subject title & description on the thumbnail moved bit upwards */}
            <View style={styles.thumbnailTitleContainer}>
              <Text style={styles.thumbnailTitle}>{displayTitle}</Text>
              <Text style={styles.thumbnailDescription} numberOfLines={2}>
                {displayDescription}
              </Text>
            </View>
          </View>

          {/* Top Control Bar: Back button on left, Share & 3-dot Menu on right */}
          <View style={styles.topControlBar}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [
                styles.headerButton,
                { backgroundColor: theme.backgroundElement },
                pressed && styles.pressed,
              ]}>
              <SolarIcon
                name="ArrowLeft"
                type="linear"
                size={22}
                color={theme.text}
              />
            </Pressable>

            <View style={styles.rightButtonsRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Share"
                onPress={handleSharePress}
                style={({ pressed }) => [
                  styles.headerButton,
                  { backgroundColor: theme.backgroundElement },
                  pressed && styles.pressed,
                ]}>
                <SolarIcon
                  name="Share"
                  type="linear"
                  size={20}
                  color={theme.text}
                />
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="More options"
                onPress={toggleMenu}
                style={({ pressed }) => [
                  styles.headerButton,
                  { backgroundColor: theme.backgroundElement },
                  pressed && styles.pressed,
                ]}>
                <SolarIcon
                  name="MenuDots"
                  type="bold"
                  size={20}
                  color={theme.text}
                />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Main Content Area */}
        <View style={styles.bodyContent}>
          {/* Unregistered Subject: user hasn't enrolled in any course for this subject */}
          {subjectEnrolledCourses.length === 0 && !hasFullAccess && (
            <View
              style={[
                styles.unregisteredSubjectCard,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.border,
                },
              ]}>
              <SolarIcon name="BookBookmark" type="linear" size={32} color={Palette.brand.primary} />
              <ThemedText style={styles.unregisteredTitle}>
                {`No ${displayTitle} Course Enrolled`}
              </ThemedText>
              <ThemedText
                themeColor="textSecondary"
                style={styles.unregisteredSubtitle}>
                {`Enroll in a free starter pack or complete ${displayTitle} course to unlock all chapters and past year papers.`}
              </ThemedText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Explore courses"
                onPress={() => navigation.navigate('Main', { screen: 'Courses' })}
                style={styles.unregisteredBtn}>
                <Text style={styles.unregisteredBtnText}>Explore Courses</Text>
              </Pressable>
            </View>
          )}

          {/* Starter Pack Active Scope Banner */}
          {isStarterScoped && (
            <View
              style={[
                styles.starterBanner,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.border,
                },
              ]}>
              <View style={styles.starterBannerLeft}>
                <View
                  style={[
                    styles.starterIconWrapper,
                    { backgroundColor: 'rgba(252, 128, 25, 0.12)' },
                  ]}>
                  <SolarIcon name="StarFall2" type="bold" size={20} color={Palette.accent} />
                </View>
                <View style={styles.starterTextWrapper}>
                  <ThemedText style={styles.starterBannerTitle}>
                    {`${activeEnrolledCourse?.title ?? 'Starter Pack'} Active`}
                  </ThemedText>
                  <ThemedText
                    themeColor="textSecondary"
                    style={styles.starterBannerSubtitle}>
                    {`Showing ${scopedChapters.length} Chapters • ${scopedYears.length} Years (${activeEnrolledCourse?.videosCount ?? 15} Videos). Upgrade plan to unlock full syllabus.`}
                  </ThemedText>
                </View>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Upgrade plan"
                onPress={() => navigation.navigate('UpgradePlan')}
                style={styles.starterUpgradeBtn}>
                <Text style={styles.starterUpgradeBtnText}>Upgrade</Text>
              </Pressable>
            </View>
          )}

          {/* Search Bar */}
          <View style={styles.searchRow}>
            <View
              style={[
                styles.searchBar,
                { backgroundColor: theme.backgroundElement },
              ]}>
              <SolarIcon
                name="Magnifer"
                type="linear"
                size={18}
                color={theme.textSecondary}
              />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search years, chapters..."
                placeholderTextColor={theme.textSecondary}
                style={[styles.searchInput, { color: theme.text }]}
                returnKeyType="search"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Clear search"
                  onPress={() => setSearchQuery('')}
                  hitSlop={8}>
                  <SolarIcon
                    name="CloseCircle"
                    type="bold"
                    size={16}
                    color={theme.textSecondary}
                  />
                </Pressable>
              )}
            </View>
          </View>

          {/* Empty search state */}
          {filteredYears.length === 0 && filteredChapters.length === 0 && (
            <View style={styles.emptyContainer}>
              <SolarIcon name="Book2" type="linear" size={44} themeColor="muted" />
              <ThemedText style={styles.emptyTitle}>No Matches Found</ThemedText>
              <ThemedText
                themeColor="textSecondary"
                style={styles.emptySubtitle}>
                {`No years or chapters match "${searchQuery.trim()}". Try another search term.`}
              </ThemedText>
            </View>
          )}

          {/* Section 1: Year Wise */}
          {filteredYears.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <ThemedText style={styles.sectionTitle}>Year Wise</ThemedText>
                <View
                  style={[
                    styles.countBadge,
                    { backgroundColor: theme.backgroundElement },
                  ]}>
                  <Text
                    style={[
                      styles.countBadgeText,
                      { color: theme.textSecondary },
                    ]}>
                    {`${filteredYears.length} Years`}
                  </Text>
                </View>
              </View>

              {/* Horizontal Scroll of Year Cards matching Recently Watched Card without progress */}
              <FlatList
                horizontal
                data={filteredYears}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                style={styles.yearList}
                contentContainerStyle={styles.yearListContent}
                renderItem={({ item }) => (
                  <YearWiseCard
                    item={item}
                    fallbackImage={currentSubject.imageUrl}
                    onPress={handleYearPress}
                  />
                )}
              />
            </View>
          )}

          {/* Section 2: Chapter Wise */}
          {filteredChapters.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <ThemedText style={styles.sectionTitle}>Chapter Wise</ThemedText>
                <View
                  style={[
                    styles.countBadge,
                    { backgroundColor: theme.backgroundElement },
                  ]}>
                  <Text
                    style={[
                      styles.countBadgeText,
                      { color: theme.textSecondary },
                    ]}>
                    {`${filteredChapters.length} Chapters`}
                  </Text>
                </View>
              </View>

              {/* List of Chapter Cards */}
              <View style={styles.chapterList}>
                {filteredChapters.map((item) => (
                  <Pressable
                    key={item.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Chapter ${item.chapterNumber}: ${item.title}`}
                    onPress={() => handleChapterPress(item)}
                    style={({ pressed }) => [
                      styles.chapterCard,
                      {
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                      },
                      pressed && styles.pressed,
                    ]}>
                    <View
                      style={[
                        styles.chapterIndexPill,
                        { backgroundColor: 'rgba(56, 128, 255, 0.08)' },
                      ]}>
                      <Text
                        style={[
                          styles.chapterIndexText,
                          { color: Palette.brand.primary },
                        ]}>
                        {item.chapterNumber}
                      </Text>
                    </View>

                    <View style={styles.chapterInfo}>
                      <ThemedText style={styles.chapterTitle} numberOfLines={1}>
                        {item.title}
                      </ThemedText>
                      <ThemedText
                        themeColor="textSecondary"
                        style={styles.chapterSubtitle}
                        numberOfLines={1}>
                        {item.subtitle}
                      </ThemedText>
                      <View style={styles.chapterMetaRow}>
                        <ThemedText
                          themeColor="textSecondary"
                          style={styles.chapterMetaText}>
                          {`${item.lessonsCount} Lessons`}
                        </ThemedText>
                        <Text style={styles.metaDot}>•</Text>
                        <ThemedText
                          themeColor="textSecondary"
                          style={styles.chapterMetaText}>
                          {item.duration}
                        </ThemedText>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.chapterActionBtn,
                        { backgroundColor: theme.backgroundElement },
                      ]}>
                      <SolarIcon
                        name="ArrowRightUp"
                        type="linear"
                        size={17}
                        color={theme.text}
                      />
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Backdrop overlay when popup menu is open */}
      {isMenuOpen && (
        <Pressable
          accessibilityLabel="Dismiss menu"
          onPress={() => setIsMenuOpen(false)}
          style={styles.menuBackdrop}
        />
      )}

      {/* Tiny Popup Window with smooth spring animation */}
      {isMenuOpen && (
        <Animated.View
          style={[
            styles.menuPopup,
            {
              backgroundColor: theme.backgroundElement,
              borderColor: theme.border,
              top: insets.top + 60,
            },
            animatedMenuStyle,
          ]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Support"
            onPress={handleSupportPress}
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.pressed,
            ]}>
            <SolarIcon name="Help" type="linear" size={18} color={theme.text} />
            <ThemedText style={styles.menuItemText}>Support</ThemedText>
          </Pressable>

          <View style={[styles.menuDivider, { backgroundColor: theme.border }]} />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Report"
            onPress={handleReportPress}
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.pressed,
            ]}>
            <SolarIcon
              name="DangerTriangle"
              type="linear"
              size={18}
              color={Palette.pinkishRed}
            />
            <ThemedText
              style={[styles.menuItemText, { color: Palette.pinkishRed }]}>
              Report
            </ThemedText>
          </Pressable>
        </Animated.View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  mediaWrapper: {
    width: '100%',
    position: 'relative',
  },
  mediaContainer: {
    width: '100%',
    aspectRatio: 16 / 12, // Strictly matching Course Details 16:12 ratio
    overflow: 'hidden',
    backgroundColor: '#0a0a0a',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailTitleContainer: {
    position: 'absolute',
    bottom: 24, // moved bit upwards
    left: Spacing.four,
    right: Spacing.four,
    alignItems: 'flex-start',
    zIndex: 5,
    gap: 4,
  },
  thumbnailTitle: {
    fontFamily: Fonts?.sans,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    color: '#1a1d29',
    letterSpacing: -0.6,
    textAlign: 'left',
  },
  thumbnailDescription: {
    fontFamily: Fonts?.sans,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: '#4b5563',
    textAlign: 'left',
    maxWidth: '92%',
  },
  topControlBar: {
    position: 'absolute',
    top: Spacing.three,
    left: Spacing.four,
    right: Spacing.four,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  rightButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: Rounded.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  pressed: {
    opacity: 0.75,
  },
  bodyContent: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  starterBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
    borderRadius: Rounded.card,
    borderWidth: 1,
    marginBottom: Spacing.four,
    gap: Spacing.two,
  },
  starterBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + 2,
    flex: 1,
  },
  starterIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: Rounded.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starterTextWrapper: {
    flex: 1,
  },
  starterBannerTitle: {
    fontFamily: Fonts?.sans,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  starterBannerSubtitle: {
    fontFamily: Fonts?.sans,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  starterUpgradeBtn: {
    backgroundColor: Palette.accent,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Rounded.full,
  },
  starterUpgradeBtnText: {
    color: '#ffffff',
    fontFamily: Fonts?.sans,
    fontSize: 12,
    fontWeight: '700',
  },
  unregisteredSubjectCard: {
    padding: Spacing.four,
    borderRadius: Rounded.card,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.four,
    gap: Spacing.two,
  },
  unregisteredTitle: {
    fontFamily: Fonts?.sans,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  unregisteredSubtitle: {
    fontFamily: Fonts?.sans,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    maxWidth: 280,
  },
  unregisteredBtn: {
    backgroundColor: Palette.brand.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: Rounded.full,
    marginTop: Spacing.one,
  },
  unregisteredBtnText: {
    color: '#ffffff',
    fontFamily: Fonts?.sans,
    fontSize: 13,
    fontWeight: '700',
  },
  searchRow: {
    marginBottom: Spacing.four,
  },
  searchBar: {
    height: 46,
    borderRadius: Rounded.full,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontFamily: Fonts?.sans,
    fontSize: 14,
    paddingVertical: 0,
  },
  sectionContainer: {
    marginBottom: Spacing.five,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  sectionTitle: {
    fontFamily: Fonts?.sans,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Rounded.full,
  },
  countBadgeText: {
    fontFamily: Fonts?.sans,
    fontSize: 12,
    fontWeight: '600',
  },
  yearList: {
    marginHorizontal: -Spacing.four,
  },
  yearListContent: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    paddingBottom: Spacing.three + 6,
  },
  yearContainer: {
    width: YEAR_CARD_WIDTH,
    position: 'relative',
  },
  yearCard: {
    width: YEAR_CARD_WIDTH,
    aspectRatio: 16 / 9, // Strictly 16:9 ratio
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  yearThumbnail: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  yearCardContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: Spacing.three,
    justifyContent: 'space-between',
    zIndex: 2,
  },
  yearCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  yearCardYear: {
    fontFamily: Fonts?.sans,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  yearBadge: {
    width: 26,
    height: 26,
    borderRadius: Rounded.full,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearCardDesc: {
    fontFamily: Fonts?.sans,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.95)',
    marginRight: 44, // leaves clear space for the play button at bottom-right
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  yearCardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  yearMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  yearDurationText: {
    fontFamily: Fonts?.sans,
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  yearPlayButton: {
    position: 'absolute',
    bottom: -13, // Overhangs bottom edge per sketch
    right: 14,   // Original proportioned position
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: Palette.foreground, // Constant black/charcoal
    borderWidth: 3,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  yearPlayIcon: {
    marginLeft: 2,
  },
  chapterList: {
    gap: 10,
  },
  chapterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  chapterIndexPill: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterIndexText: {
    fontFamily: Fonts?.sans,
    fontSize: 14,
    fontWeight: '800',
  },
  chapterInfo: {
    flex: 1,
    gap: 2,
  },
  chapterTitle: {
    fontFamily: Fonts?.sans,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  chapterSubtitle: {
    fontFamily: Fonts?.sans,
    fontSize: 12,
    lineHeight: 16,
  },
  chapterMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  chapterMetaText: {
    fontFamily: Fonts?.sans,
    fontSize: 11,
    fontWeight: '500',
  },
  metaDot: {
    fontSize: 10,
    color: '#9ca3af',
  },
  chapterActionBtn: {
    width: 36,
    height: 36,
    borderRadius: Rounded.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.six,
    gap: 6,
  },
  emptyTitle: {
    fontFamily: Fonts?.sans,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 6,
  },
  emptySubtitle: {
    fontFamily: Fonts?.sans,
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 260,
  },
  menuBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 100,
  },
  menuPopup: {
    position: 'absolute',
    right: Spacing.four,
    width: 140,
    borderRadius: Rounded.md,
    borderWidth: 1,
    paddingVertical: 6,
    zIndex: 101,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  menuItemText: {
    fontFamily: Fonts?.sans,
    fontSize: 13,
    fontWeight: '600',
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 4,
  },
});
