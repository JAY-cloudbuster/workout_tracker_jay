import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Exercise from '../models/Exercise';
import User from '../models/User';
import {
  MovementPattern,
  MuscleGroup,
  Equipment,
  Difficulty,
  Mechanics,
  ForceType,
  PlaneOfMotion,
  GripType,
  UserRole,
} from '../types';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const exercises = [
  // Chest
  {
    name: 'Barbell Bench Press',
    movementPattern: MovementPattern.HORIZONTAL_PUSH,
    primaryMuscles: [MuscleGroup.CHEST],
    secondaryMuscles: [MuscleGroup.TRICEPS, MuscleGroup.FRONT_DELTS],
    stabilizers: [MuscleGroup.ABS],
    equipment: Equipment.BARBELL,
    difficulty: Difficulty.INTERMEDIATE,
    mechanics: Mechanics.COMPOUND,
    forceType: ForceType.PUSH,
    planeOfMotion: PlaneOfMotion.SAGITTAL,
    grip: GripType.OVERHAND,
    instructions: [
      'Lie on a flat bench with feet flat on the floor',
      'Grip the bar slightly wider than shoulder width',
      'Unrack the bar and lower it to mid-chest',
      'Press the bar back up to lockout',
      'Keep your back slightly arched and shoulder blades retracted',
    ],
    commonMistakes: [
      'Bouncing the bar off the chest',
      'Flaring elbows too wide',
      'Lifting hips off the bench',
      'Not using a full range of motion',
    ],
    tags: ['chest', 'compound', 'strength', 'barbell', 'bench'],
  },
  {
    name: 'Incline Dumbbell Press',
    movementPattern: MovementPattern.HORIZONTAL_PUSH,
    primaryMuscles: [MuscleGroup.CHEST, MuscleGroup.FRONT_DELTS],
    secondaryMuscles: [MuscleGroup.TRICEPS],
    stabilizers: [MuscleGroup.ABS],
    equipment: Equipment.DUMBBELL,
    difficulty: Difficulty.INTERMEDIATE,
    mechanics: Mechanics.COMPOUND,
    forceType: ForceType.PUSH,
    planeOfMotion: PlaneOfMotion.SAGITTAL,
    grip: GripType.NEUTRAL,
    instructions: [
      'Set the bench to a 30-45 degree incline',
      'Sit back with a dumbbell in each hand at shoulder level',
      'Press the dumbbells up and slightly together',
      'Lower with control back to the starting position',
    ],
    commonMistakes: ['Setting the incline too steep', 'Not controlling the negative'],
    tags: ['chest', 'upper chest', 'dumbbell', 'incline'],
  },
  {
    name: 'Cable Flyes',
    movementPattern: MovementPattern.HORIZONTAL_PUSH,
    primaryMuscles: [MuscleGroup.CHEST],
    secondaryMuscles: [MuscleGroup.FRONT_DELTS],
    stabilizers: [MuscleGroup.BICEPS],
    equipment: Equipment.CABLE,
    difficulty: Difficulty.BEGINNER,
    mechanics: Mechanics.ISOLATION,
    forceType: ForceType.PUSH,
    planeOfMotion: PlaneOfMotion.TRANSVERSE,
    instructions: [
      'Set cables at shoulder height',
      'Step forward and bring handles together in front of chest',
      'Squeeze chest at the peak contraction',
      'Return slowly to starting position with a stretch',
    ],
    commonMistakes: ['Using too much weight', 'Bending arms too much'],
    tags: ['chest', 'isolation', 'cable', 'flyes'],
  },
  // Back
  {
    name: 'Barbell Deadlift',
    movementPattern: MovementPattern.HIP_HINGE,
    primaryMuscles: [MuscleGroup.BACK, MuscleGroup.HAMSTRINGS, MuscleGroup.GLUTES],
    secondaryMuscles: [MuscleGroup.TRAPS, MuscleGroup.FOREARMS, MuscleGroup.LOWER_BACK],
    stabilizers: [MuscleGroup.ABS, MuscleGroup.QUADS],
    equipment: Equipment.BARBELL,
    difficulty: Difficulty.ADVANCED,
    mechanics: Mechanics.COMPOUND,
    forceType: ForceType.PULL,
    planeOfMotion: PlaneOfMotion.SAGITTAL,
    grip: GripType.OVERHAND,
    instructions: [
      'Stand with feet hip-width apart, bar over mid-foot',
      'Hinge at the hips and grip the bar just outside your knees',
      'Brace your core, flatten your back',
      'Drive through the floor and extend hips and knees simultaneously',
      'Lock out at the top with hips fully extended',
    ],
    commonMistakes: [
      'Rounding the lower back',
      'Bar drifting away from the body',
      'Lifting with the back instead of the legs',
      'Hyperextending at the top',
    ],
    tags: ['back', 'compound', 'strength', 'barbell', 'deadlift', 'posterior chain'],
  },
  {
    name: 'Pull-Up',
    movementPattern: MovementPattern.VERTICAL_PULL,
    primaryMuscles: [MuscleGroup.LATS, MuscleGroup.BACK],
    secondaryMuscles: [MuscleGroup.BICEPS, MuscleGroup.REAR_DELTS],
    stabilizers: [MuscleGroup.ABS, MuscleGroup.FOREARMS],
    equipment: Equipment.BODYWEIGHT,
    difficulty: Difficulty.INTERMEDIATE,
    mechanics: Mechanics.COMPOUND,
    forceType: ForceType.PULL,
    planeOfMotion: PlaneOfMotion.SAGITTAL,
    grip: GripType.OVERHAND,
    instructions: [
      'Hang from a pull-up bar with an overhand grip, slightly wider than shoulder width',
      'Engage your lats and pull yourself up until your chin is over the bar',
      'Lower yourself with control back to a dead hang',
    ],
    commonMistakes: ['Kipping or swinging', 'Not using full range of motion', 'Shrugging shoulders'],
    tags: ['back', 'lats', 'bodyweight', 'compound', 'pull-up'],
  },
  {
    name: 'Barbell Row',
    movementPattern: MovementPattern.HORIZONTAL_PULL,
    primaryMuscles: [MuscleGroup.BACK, MuscleGroup.LATS],
    secondaryMuscles: [MuscleGroup.BICEPS, MuscleGroup.REAR_DELTS, MuscleGroup.TRAPS],
    stabilizers: [MuscleGroup.LOWER_BACK, MuscleGroup.ABS],
    equipment: Equipment.BARBELL,
    difficulty: Difficulty.INTERMEDIATE,
    mechanics: Mechanics.COMPOUND,
    forceType: ForceType.PULL,
    planeOfMotion: PlaneOfMotion.SAGITTAL,
    grip: GripType.OVERHAND,
    instructions: [
      'Hinge forward at the hips to about 45 degrees',
      'Grip the bar shoulder-width apart',
      'Pull the bar to your lower chest/upper abdomen',
      'Squeeze your shoulder blades together at the top',
      'Lower with control',
    ],
    commonMistakes: ['Using momentum', 'Standing too upright', 'Rounding the back'],
    tags: ['back', 'compound', 'barbell', 'row'],
  },
  {
    name: 'Lat Pulldown',
    movementPattern: MovementPattern.VERTICAL_PULL,
    primaryMuscles: [MuscleGroup.LATS],
    secondaryMuscles: [MuscleGroup.BICEPS, MuscleGroup.REAR_DELTS],
    stabilizers: [MuscleGroup.ABS],
    equipment: Equipment.CABLE,
    difficulty: Difficulty.BEGINNER,
    mechanics: Mechanics.COMPOUND,
    forceType: ForceType.PULL,
    planeOfMotion: PlaneOfMotion.SAGITTAL,
    grip: GripType.WIDE,
    instructions: [
      'Sit at the lat pulldown station with thighs secured under the pads',
      'Grip the bar wider than shoulder width',
      'Pull the bar down to upper chest level',
      'Squeeze your lats at the bottom, then release slowly',
    ],
    commonMistakes: ['Leaning too far back', 'Pulling behind the neck', 'Using arm strength instead of lats'],
    tags: ['back', 'lats', 'cable', 'machine', 'pulldown'],
  },
  // Shoulders
  {
    name: 'Overhead Press',
    movementPattern: MovementPattern.VERTICAL_PUSH,
    primaryMuscles: [MuscleGroup.SHOULDERS, MuscleGroup.FRONT_DELTS],
    secondaryMuscles: [MuscleGroup.TRICEPS, MuscleGroup.TRAPS],
    stabilizers: [MuscleGroup.ABS, MuscleGroup.LOWER_BACK],
    equipment: Equipment.BARBELL,
    difficulty: Difficulty.INTERMEDIATE,
    mechanics: Mechanics.COMPOUND,
    forceType: ForceType.PUSH,
    planeOfMotion: PlaneOfMotion.SAGITTAL,
    grip: GripType.OVERHAND,
    instructions: [
      'Stand with feet shoulder-width apart',
      'Hold the bar at shoulder level with hands just outside shoulder width',
      'Press the bar overhead to full lockout',
      'Lower under control back to shoulders',
    ],
    commonMistakes: ['Excessive back arch', 'Pressing in front of the body', 'Not locking out'],
    tags: ['shoulders', 'compound', 'barbell', 'overhead', 'press'],
  },
  {
    name: 'Lateral Raise',
    movementPattern: MovementPattern.ISOLATION,
    primaryMuscles: [MuscleGroup.SIDE_DELTS],
    secondaryMuscles: [MuscleGroup.TRAPS],
    stabilizers: [MuscleGroup.FOREARMS],
    equipment: Equipment.DUMBBELL,
    difficulty: Difficulty.BEGINNER,
    mechanics: Mechanics.ISOLATION,
    forceType: ForceType.PUSH,
    planeOfMotion: PlaneOfMotion.FRONTAL,
    instructions: [
      'Stand with dumbbells at your sides',
      'Raise arms out to the sides until parallel with the floor',
      'Keep a slight bend in the elbows',
      'Lower with control',
    ],
    commonMistakes: ['Using too much weight', 'Swinging the weights', 'Shrugging shoulders'],
    tags: ['shoulders', 'side delts', 'isolation', 'dumbbell', 'lateral'],
  },
  {
    name: 'Face Pull',
    movementPattern: MovementPattern.HORIZONTAL_PULL,
    primaryMuscles: [MuscleGroup.REAR_DELTS],
    secondaryMuscles: [MuscleGroup.TRAPS, MuscleGroup.SIDE_DELTS],
    stabilizers: [MuscleGroup.ABS],
    equipment: Equipment.CABLE,
    difficulty: Difficulty.BEGINNER,
    mechanics: Mechanics.ISOLATION,
    forceType: ForceType.PULL,
    planeOfMotion: PlaneOfMotion.TRANSVERSE,
    instructions: [
      'Set the cable at face height with a rope attachment',
      'Pull the rope toward your face, separating the ends',
      'Externally rotate your shoulders at the end',
      'Squeeze rear delts and return slowly',
    ],
    commonMistakes: ['Using too much weight', 'Not pulling to face level'],
    tags: ['shoulders', 'rear delts', 'cable', 'face pull', 'posture'],
  },
  // Legs
  {
    name: 'Barbell Back Squat',
    movementPattern: MovementPattern.SQUAT,
    primaryMuscles: [MuscleGroup.QUADS, MuscleGroup.GLUTES],
    secondaryMuscles: [MuscleGroup.HAMSTRINGS, MuscleGroup.LOWER_BACK],
    stabilizers: [MuscleGroup.ABS, MuscleGroup.CALVES],
    equipment: Equipment.BARBELL,
    difficulty: Difficulty.INTERMEDIATE,
    mechanics: Mechanics.COMPOUND,
    forceType: ForceType.PUSH,
    planeOfMotion: PlaneOfMotion.SAGITTAL,
    instructions: [
      'Place the bar on your upper traps',
      'Stand with feet shoulder-width apart, toes slightly turned out',
      'Brace your core and squat down until thighs are at least parallel',
      'Drive through your feet to stand back up',
    ],
    commonMistakes: [
      'Knees caving inward',
      'Coming up on toes',
      'Not hitting depth',
      'Rounding the back',
    ],
    tags: ['legs', 'quads', 'glutes', 'compound', 'barbell', 'squat'],
  },
  {
    name: 'Romanian Deadlift',
    movementPattern: MovementPattern.HIP_HINGE,
    primaryMuscles: [MuscleGroup.HAMSTRINGS, MuscleGroup.GLUTES],
    secondaryMuscles: [MuscleGroup.LOWER_BACK],
    stabilizers: [MuscleGroup.ABS, MuscleGroup.FOREARMS],
    equipment: Equipment.BARBELL,
    difficulty: Difficulty.INTERMEDIATE,
    mechanics: Mechanics.COMPOUND,
    forceType: ForceType.PULL,
    planeOfMotion: PlaneOfMotion.SAGITTAL,
    instructions: [
      'Hold the bar at hip level with an overhand grip',
      'Push your hips back, keeping knees slightly bent',
      'Lower the bar along your legs until you feel a deep hamstring stretch',
      'Drive your hips forward to return to standing',
    ],
    commonMistakes: ['Rounding the back', 'Bending the knees too much', 'Not pushing hips back enough'],
    tags: ['legs', 'hamstrings', 'glutes', 'barbell', 'rdl', 'posterior chain'],
  },
  {
    name: 'Leg Press',
    movementPattern: MovementPattern.SQUAT,
    primaryMuscles: [MuscleGroup.QUADS, MuscleGroup.GLUTES],
    secondaryMuscles: [MuscleGroup.HAMSTRINGS],
    stabilizers: [MuscleGroup.CALVES],
    equipment: Equipment.MACHINE,
    difficulty: Difficulty.BEGINNER,
    mechanics: Mechanics.COMPOUND,
    forceType: ForceType.PUSH,
    planeOfMotion: PlaneOfMotion.SAGITTAL,
    instructions: [
      'Sit in the leg press machine with back flat against the pad',
      'Place feet shoulder-width apart on the platform',
      'Lower the platform until knees are at 90 degrees',
      'Press through your feet to extend your legs',
    ],
    commonMistakes: ['Locking out knees', 'Lifting hips off the pad', 'Too narrow stance'],
    tags: ['legs', 'quads', 'machine', 'compound', 'leg press'],
  },
  {
    name: 'Leg Extension',
    movementPattern: MovementPattern.ISOLATION,
    primaryMuscles: [MuscleGroup.QUADS],
    secondaryMuscles: [],
    stabilizers: [],
    equipment: Equipment.MACHINE,
    difficulty: Difficulty.BEGINNER,
    mechanics: Mechanics.ISOLATION,
    forceType: ForceType.PUSH,
    planeOfMotion: PlaneOfMotion.SAGITTAL,
    instructions: [
      'Sit on the leg extension machine with the pad on your lower shins',
      'Extend your legs fully, squeezing at the top',
      'Lower with control back to the starting position',
    ],
    commonMistakes: ['Using momentum', 'Not achieving full extension'],
    tags: ['legs', 'quads', 'isolation', 'machine'],
  },
  {
    name: 'Leg Curl',
    movementPattern: MovementPattern.ISOLATION,
    primaryMuscles: [MuscleGroup.HAMSTRINGS],
    secondaryMuscles: [MuscleGroup.CALVES],
    stabilizers: [],
    equipment: Equipment.MACHINE,
    difficulty: Difficulty.BEGINNER,
    mechanics: Mechanics.ISOLATION,
    forceType: ForceType.PULL,
    planeOfMotion: PlaneOfMotion.SAGITTAL,
    instructions: [
      'Lie face down on the leg curl machine',
      'Place the pad just above your heels',
      'Curl your legs up toward your glutes',
      'Lower with control',
    ],
    commonMistakes: ['Lifting hips off the pad', 'Using momentum'],
    tags: ['legs', 'hamstrings', 'isolation', 'machine', 'curl'],
  },
  {
    name: 'Calf Raise',
    movementPattern: MovementPattern.ISOLATION,
    primaryMuscles: [MuscleGroup.CALVES],
    secondaryMuscles: [],
    stabilizers: [],
    equipment: Equipment.MACHINE,
    difficulty: Difficulty.BEGINNER,
    mechanics: Mechanics.ISOLATION,
    forceType: ForceType.PUSH,
    planeOfMotion: PlaneOfMotion.SAGITTAL,
    instructions: [
      'Stand on the platform with the balls of your feet on the edge',
      'Rise up on your toes as high as possible',
      'Hold for a moment at the top',
      'Lower slowly until you feel a stretch in your calves',
    ],
    commonMistakes: ['Bouncing at the bottom', 'Not using full range of motion'],
    tags: ['legs', 'calves', 'isolation', 'machine'],
  },
  // Arms
  {
    name: 'Barbell Curl',
    movementPattern: MovementPattern.ISOLATION,
    primaryMuscles: [MuscleGroup.BICEPS],
    secondaryMuscles: [MuscleGroup.FOREARMS],
    stabilizers: [MuscleGroup.ABS],
    equipment: Equipment.BARBELL,
    difficulty: Difficulty.BEGINNER,
    mechanics: Mechanics.ISOLATION,
    forceType: ForceType.PULL,
    planeOfMotion: PlaneOfMotion.SAGITTAL,
    grip: GripType.UNDERHAND,
    instructions: [
      'Stand with feet shoulder-width apart, holding the bar with an underhand grip',
      'Keep elbows close to your sides',
      'Curl the bar up to shoulder level',
      'Lower with control',
    ],
    commonMistakes: ['Swinging the body', 'Moving elbows forward', 'Using too much weight'],
    tags: ['arms', 'biceps', 'isolation', 'barbell', 'curl'],
  },
  {
    name: 'Tricep Pushdown',
    movementPattern: MovementPattern.ISOLATION,
    primaryMuscles: [MuscleGroup.TRICEPS],
    secondaryMuscles: [],
    stabilizers: [MuscleGroup.ABS],
    equipment: Equipment.CABLE,
    difficulty: Difficulty.BEGINNER,
    mechanics: Mechanics.ISOLATION,
    forceType: ForceType.PUSH,
    planeOfMotion: PlaneOfMotion.SAGITTAL,
    instructions: [
      'Stand in front of a cable machine with a straight bar or rope attachment',
      'Keep elbows tucked to your sides',
      'Push the weight down until arms are fully extended',
      'Return slowly to starting position',
    ],
    commonMistakes: ['Moving elbows away from body', 'Leaning too far forward', 'Using momentum'],
    tags: ['arms', 'triceps', 'isolation', 'cable', 'pushdown'],
  },
  {
    name: 'Dumbbell Hammer Curl',
    movementPattern: MovementPattern.ISOLATION,
    primaryMuscles: [MuscleGroup.BICEPS],
    secondaryMuscles: [MuscleGroup.FOREARMS],
    stabilizers: [],
    equipment: Equipment.DUMBBELL,
    difficulty: Difficulty.BEGINNER,
    mechanics: Mechanics.ISOLATION,
    forceType: ForceType.PULL,
    planeOfMotion: PlaneOfMotion.SAGITTAL,
    grip: GripType.NEUTRAL,
    instructions: [
      'Stand with dumbbells at your sides, palms facing each other',
      'Curl the dumbbells up keeping the neutral grip',
      'Squeeze at the top, then lower with control',
    ],
    commonMistakes: ['Swinging the weights', 'Not keeping neutral grip'],
    tags: ['arms', 'biceps', 'forearms', 'dumbbell', 'hammer', 'curl'],
  },
  {
    name: 'Skull Crusher',
    movementPattern: MovementPattern.ISOLATION,
    primaryMuscles: [MuscleGroup.TRICEPS],
    secondaryMuscles: [],
    stabilizers: [MuscleGroup.CHEST, MuscleGroup.FRONT_DELTS],
    equipment: Equipment.EZ_BAR,
    difficulty: Difficulty.INTERMEDIATE,
    mechanics: Mechanics.ISOLATION,
    forceType: ForceType.PUSH,
    planeOfMotion: PlaneOfMotion.SAGITTAL,
    instructions: [
      'Lie on a flat bench holding an EZ bar with arms extended above chest',
      'Lower the bar toward your forehead by bending at the elbows',
      'Keep upper arms stationary',
      'Press back up to full extension',
    ],
    commonMistakes: ['Moving the upper arms', 'Going too heavy', 'Not using full ROM'],
    tags: ['arms', 'triceps', 'isolation', 'ez bar', 'skull crusher'],
  },
  // Core
  {
    name: 'Plank',
    movementPattern: MovementPattern.ISOLATION,
    primaryMuscles: [MuscleGroup.ABS],
    secondaryMuscles: [MuscleGroup.OBLIQUES, MuscleGroup.LOWER_BACK],
    stabilizers: [MuscleGroup.SHOULDERS, MuscleGroup.GLUTES],
    equipment: Equipment.BODYWEIGHT,
    difficulty: Difficulty.BEGINNER,
    mechanics: Mechanics.ISOLATION,
    forceType: ForceType.STATIC,
    planeOfMotion: PlaneOfMotion.SAGITTAL,
    instructions: [
      'Start in a forearm plank position',
      'Keep your body in a straight line from head to heels',
      'Engage your core and hold the position',
      'Breathe steadily throughout',
    ],
    commonMistakes: ['Hips too high or too low', 'Holding breath', 'Looking up'],
    tags: ['core', 'abs', 'bodyweight', 'isometric', 'plank'],
  },
  {
    name: 'Cable Woodchop',
    movementPattern: MovementPattern.ROTATION,
    primaryMuscles: [MuscleGroup.OBLIQUES, MuscleGroup.ABS],
    secondaryMuscles: [MuscleGroup.SHOULDERS],
    stabilizers: [MuscleGroup.GLUTES, MuscleGroup.LOWER_BACK],
    equipment: Equipment.CABLE,
    difficulty: Difficulty.INTERMEDIATE,
    mechanics: Mechanics.COMPOUND,
    forceType: ForceType.PULL,
    planeOfMotion: PlaneOfMotion.TRANSVERSE,
    instructions: [
      'Set the cable to high position',
      'Stand sideways to the machine',
      'Pull the handle diagonally across your body to the opposite hip',
      'Rotate through your core, keeping arms relatively straight',
      'Return with control',
    ],
    commonMistakes: ['Using too much arm strength', 'Not rotating through the core'],
    tags: ['core', 'obliques', 'cable', 'rotation', 'functional'],
  },
  // Compound movements
  {
    name: 'Dip',
    movementPattern: MovementPattern.VERTICAL_PUSH,
    primaryMuscles: [MuscleGroup.CHEST, MuscleGroup.TRICEPS],
    secondaryMuscles: [MuscleGroup.FRONT_DELTS],
    stabilizers: [MuscleGroup.ABS],
    equipment: Equipment.BODYWEIGHT,
    difficulty: Difficulty.INTERMEDIATE,
    mechanics: Mechanics.COMPOUND,
    forceType: ForceType.PUSH,
    planeOfMotion: PlaneOfMotion.SAGITTAL,
    instructions: [
      'Grip the parallel bars and lift yourself to the top position',
      'Lower yourself until your shoulders are slightly below your elbows',
      'Press back up to full lockout',
      'Lean forward slightly for more chest engagement',
    ],
    commonMistakes: ['Not going deep enough', 'Swinging the body', 'Flaring elbows'],
    tags: ['chest', 'triceps', 'compound', 'bodyweight', 'dip'],
  },
  {
    name: 'Bulgarian Split Squat',
    movementPattern: MovementPattern.LUNGE,
    primaryMuscles: [MuscleGroup.QUADS, MuscleGroup.GLUTES],
    secondaryMuscles: [MuscleGroup.HAMSTRINGS],
    stabilizers: [MuscleGroup.ABS, MuscleGroup.CALVES],
    equipment: Equipment.DUMBBELL,
    difficulty: Difficulty.INTERMEDIATE,
    mechanics: Mechanics.COMPOUND,
    forceType: ForceType.PUSH,
    planeOfMotion: PlaneOfMotion.SAGITTAL,
    instructions: [
      'Stand about 2 feet in front of a bench',
      'Place one foot behind you on the bench',
      'Lower your body until your front thigh is parallel to the floor',
      'Push through your front foot to return to standing',
    ],
    commonMistakes: ['Standing too close to the bench', 'Leaning too far forward', 'Knee caving'],
    tags: ['legs', 'quads', 'glutes', 'unilateral', 'split squat'],
  },
  {
    name: 'Farmer\'s Walk',
    movementPattern: MovementPattern.CARRY,
    primaryMuscles: [MuscleGroup.FOREARMS, MuscleGroup.TRAPS],
    secondaryMuscles: [MuscleGroup.ABS, MuscleGroup.SHOULDERS],
    stabilizers: [MuscleGroup.LOWER_BACK, MuscleGroup.GLUTES, MuscleGroup.QUADS],
    equipment: Equipment.DUMBBELL,
    difficulty: Difficulty.BEGINNER,
    mechanics: Mechanics.COMPOUND,
    forceType: ForceType.STATIC,
    planeOfMotion: PlaneOfMotion.SAGITTAL,
    instructions: [
      'Pick up heavy dumbbells or farmer walk handles',
      'Stand tall with shoulders back and core braced',
      'Walk forward with controlled steps',
      'Maintain an upright posture throughout',
    ],
    commonMistakes: ['Leaning to one side', 'Taking too long strides', 'Letting shoulders round'],
    tags: ['grip', 'functional', 'carry', 'core', 'traps'],
  },
];

const seedDatabase = async (): Promise<void> => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gymtracker_pro';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB for seeding');

    // Clear existing data
    await Exercise.deleteMany({});
    console.log('🗑️ Cleared existing exercises');

    // Seed exercises (use create to trigger pre-save hooks for slug generation)
    // Also drop the slug index first to avoid stale index issues
    try {
      await mongoose.connection.collection('exercises').dropIndex('slug_1');
    } catch {
      // Index might not exist, ignore
    }

    let seededCount = 0;
    for (const exerciseData of exercises) {
      try {
        await Exercise.create(exerciseData);
        seededCount++;
      } catch (err: any) {
        if (err.code === 11000) {
          console.log(`⚠️ Skipped duplicate: ${exerciseData.name}`);
        } else {
          console.error(`❌ Failed to seed ${exerciseData.name}:`, err.message);
        }
      }
    }
    console.log(`💪 Seeded ${seededCount} exercises`);

    // Create demo admin user
    const existingAdmin = await User.findOne({ email: 'admin@gymtrackerpro.com' });
    if (!existingAdmin) {
      await User.create({
        name: 'Admin User',
        username: 'admin',
        email: 'admin@gymtrackerpro.com',
        password: 'Admin123!',
        role: UserRole.ADMIN,
        isEmailVerified: true,
      });
      console.log('👤 Created admin user (admin@gymtrackerpro.com / Admin123!)');
    }

    // Create demo regular user
    const existingUser = await User.findOne({ email: 'demo@gymtrackerpro.com' });
    if (!existingUser) {
      await User.create({
        name: 'Demo User',
        username: 'demo_user',
        email: 'demo@gymtrackerpro.com',
        password: 'Demo123!',
        role: UserRole.USER,
        isEmailVerified: true,
        age: 28,
        gender: 'male',
        height: 180,
        weight: 82,
        experienceLevel: 'intermediate',
        primaryGoal: 'gain_muscle',
        trainingStyle: 'hypertrophy',
        preferredSplit: 'push_pull_legs',
        activityLevel: 'very_active',
      });
      console.log('👤 Created demo user (demo@gymtrackerpro.com / Demo123!)');
    }

    console.log('\n✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seedDatabase();
