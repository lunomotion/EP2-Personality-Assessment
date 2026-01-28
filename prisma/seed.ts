import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

import type {
  RiskRewardQuestion,
  FourTypesQuestion,
  TieBreakerConfig,
  ThresholdConfig,
  AnimalKey,
  SurveyQuestionsData,
} from '../src/types/scoring';

import type {
  FormSectionConfig,
  FormResultsConfig,
} from '../src/types/form-config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// --- Risk Questions (from CSV rows 2-11, survey order 2-11) ---
const LIKERT_LABELS: Record<string, string> = {
  '1': 'Not at all like me',
  '2': 'A little like me',
  '3': 'Somewhat like me',
  '4': 'Usually like me',
  '5': 'Exactly like me',
};

const riskQuestions: RiskRewardQuestion[] = [
  {
    order: 1,
    ref: 'risk_q1',
    text: 'A friend dares you to try karaoke in front of a crowd. Do you grab the mic?',
    type: 'binary',
    reversed: false,
    pointMap: { A: 1, B: 5 },
    optionLabels: { A: 'No way', B: 'Hell ya!' },
  },
  {
    order: 2,
    ref: 'risk_q2',
    text: "You're running late and can either take a risky shortcut you don't know well, or take the longer, familiar route. Which do you choose?",
    type: 'binary',
    reversed: false,
    pointMap: { A: 1, B: 5 },
    optionLabels: { A: 'Stick with the familiar route', B: 'Take the shortcut' },
  },
  {
    order: 3,
    ref: 'risk_q3',
    text: "You're at a theme park staring at the tallest roller coaster. Do you get in line or find a calmer ride?",
    type: 'binary',
    reversed: false,
    pointMap: { A: 1, B: 5 },
    optionLabels: { A: 'Find a less scary ride', B: 'Hop in line!' },
  },
  {
    order: 4,
    ref: 'risk_q4',
    text: "You get invited to a networking mixer where you don't know anyone. Do you show up anyway or skip it?",
    type: 'binary',
    reversed: false,
    pointMap: { A: 1, B: 5 },
    optionLabels: { A: 'Enjoy a night in', B: 'Join the party!' },
  },
  {
    order: 5,
    ref: 'risk_q5',
    text: "You're trying out a new restaurant. Do you order something you know you love (like a burger) or try something new (chef's special)?",
    type: 'binary',
    reversed: false,
    pointMap: { A: 1, B: 5 },
    optionLabels: { A: 'Stick with my usual', B: "Let's spice things up" },
  },
  {
    order: 6,
    ref: 'risk_q6',
    text: 'I value financial security more than the chance of a big bonus.',
    type: 'likert',
    reversed: true,
    pointMap: { '1': 5, '2': 4, '3': 3, '4': 2, '5': 1 },
    optionLabels: LIKERT_LABELS,
  },
  {
    order: 7,
    ref: 'risk_q7',
    text: 'I prefer stability over uncertainty.',
    type: 'likert',
    reversed: true,
    pointMap: { '1': 5, '2': 4, '3': 3, '4': 2, '5': 1 },
    optionLabels: LIKERT_LABELS,
  },
  {
    order: 8,
    ref: 'risk_q8',
    text: 'I enjoy pushing myself beyond what feels comfortable.',
    type: 'likert',
    reversed: false,
    pointMap: { '1': 1, '2': 2, '3': 3, '4': 4, '5': 5 },
    optionLabels: LIKERT_LABELS,
  },
  {
    order: 9,
    ref: 'risk_q9',
    text: 'I believe that risk is an essential part of growth and success.',
    type: 'likert',
    reversed: false,
    pointMap: { '1': 1, '2': 2, '3': 3, '4': 4, '5': 5 },
    optionLabels: LIKERT_LABELS,
  },
  {
    order: 10,
    ref: 'risk_q10',
    text: 'I often make impulsive decisions.',
    type: 'likert',
    reversed: false,
    pointMap: { '1': 1, '2': 2, '3': 3, '4': 4, '5': 5 },
    optionLabels: LIKERT_LABELS,
  },
];

// --- Reward Questions (from CSV rows 12-21, survey order 11-20) ---
const rewardQuestions: RiskRewardQuestion[] = [
  {
    order: 1,
    ref: 'reward_q1',
    text: 'A promotion would come with a huge raise, but also 60-hour weeks. Do you take it?',
    type: 'binary',
    reversed: false,
    pointMap: { A: 1, B: 5 },
    optionLabels: { A: 'No, I need balance', B: "Yes, I'd take it!" },
  },
  {
    order: 2,
    ref: 'reward_q2',
    text: 'Your startup could attract investors fast if you pivot away from your original mission. Do you pivot or stay true to your purpose?',
    type: 'binary',
    reversed: false,
    pointMap: { A: 1, B: 5 },
    optionLabels: { A: 'Stay put', B: 'Pivot' },
  },
  {
    order: 3,
    ref: 'reward_q3',
    text: "You've reached your financial goals. Do you keep chasing more success or switch focus to personal interests?",
    type: 'binary',
    reversed: false,
    pointMap: { A: 1, B: 5 },
    optionLabels: { A: 'Switch it up', B: 'Push forward' },
  },
  {
    order: 4,
    ref: 'reward_q4',
    text: 'When I wake up every day, I want to:',
    type: 'binary',
    reversed: false,
    pointMap: { A: 1, B: 5 },
    optionLabels: { A: 'Change the world', B: 'Reach personal financial success' },
  },
  {
    order: 5,
    ref: 'reward_q5',
    text: 'You have two options:\n\n1) Start a business by yourself, keeping all the profits.\n\n2) Bring in co-founders who might double the success but split the reward.',
    type: 'binary',
    reversed: true,
    pointMap: { A: 5, B: 1 },
    optionLabels: { A: '#1 By Yourself', B: '#2 Add Co-Founder' },
  },
  {
    order: 6,
    ref: 'reward_q6',
    text: "I'm always focusing on how to get the best results possible.",
    type: 'likert',
    reversed: false,
    pointMap: { '1': 1, '2': 2, '3': 3, '4': 4, '5': 5 },
    optionLabels: LIKERT_LABELS,
  },
  {
    order: 7,
    ref: 'reward_q7',
    text: "I'd rather split success with others if it means achieving something bigger.",
    type: 'likert',
    reversed: true,
    pointMap: { '1': 5, '2': 4, '3': 3, '4': 2, '5': 1 },
    optionLabels: LIKERT_LABELS,
  },
  {
    order: 8,
    ref: 'reward_q8',
    text: "I'm more motivated by the achievement of the team than by personal prestige.",
    type: 'likert',
    reversed: true,
    pointMap: { '1': 5, '2': 4, '3': 3, '4': 2, '5': 1 },
    optionLabels: LIKERT_LABELS,
  },
  {
    order: 9,
    ref: 'reward_q9',
    text: 'Personal achievement is one of my primary drivers in life.',
    type: 'likert',
    reversed: false,
    pointMap: { '1': 1, '2': 2, '3': 3, '4': 4, '5': 5 },
    optionLabels: LIKERT_LABELS,
  },
  {
    order: 10,
    ref: 'reward_q10',
    text: 'Earning more money drives me to perform better.',
    type: 'likert',
    reversed: false,
    pointMap: { '1': 1, '2': 2, '3': 3, '4': 4, '5': 5 },
    optionLabels: LIKERT_LABELS,
  },
];

// --- Four Types Questions (from CSV rows, survey order 26-35) ---
// Letter orders from CSV: ABCD, DCAB, ADBC, BADC, ABCD, DABC, CDAB, ABDC, ADBC, DCBA
// Animal mapping: A=African Dog, B=Lion, C=Killer Whale, D=Tiger

function makeAnimalMap(letterOrder: string): Record<string, AnimalKey> {
  const animals: AnimalKey[] = ['African Dog', 'Lion', 'Killer Whale', 'Tiger'];
  const map: Record<string, AnimalKey> = {};
  for (let i = 0; i < 4; i++) {
    map[letterOrder[i]] = animals[i];
  }
  return map;
}

const fourTypesQuestions: FourTypesQuestion[] = [
  {
    order: 1,
    ref: 'type_q1',
    text: 'When you picture your ideal business setup, what appeals to you most?',
    optionToAnimal: makeAnimalMap('ABCD'),
    letterOrder: 'ABCD',
    optionLabels: {
      A: 'A small, tight-knit partnership where everyone shares responsibility and profit.',
      B: 'A visible leadership role at the top of a loyal, committed team.',
      C: 'A lean, expert group focused on long-term strategy and efficiency.',
      D: 'Running solo or with minimal support so you keep control and upside.',
    },
  },
  {
    order: 2,
    ref: 'type_q2',
    text: 'When you think about failure in business, what best describes your attitude?',
    optionToAnimal: makeAnimalMap('CDBA'),
    letterOrder: 'CDBA',
    optionLabels: {
      A: 'See failure as battle scars you expect to collect on the way to big wins.',
      B: 'Design strategies so failures are rare, contained, and mostly anticipated.',
      C: 'Avoid big failures by taking smaller, safer steps with others.',
      D: 'Accept some failure as the cost of making progress with the team.',
    },
  },
  {
    order: 3,
    ref: 'type_q3',
    text: 'How do you prefer your business to grow?',
    optionToAnimal: makeAnimalMap('ACDB'),
    letterOrder: 'ACDB',
    optionLabels: {
      A: 'Steady, reliable growth that keeps the group stable and secure.',
      B: 'Fast, aggressive growth, even if it\'s chaotic and demanding.',
      C: 'Consistent growth that stretches the team but doesn\'t overwhelm them.',
      D: 'Slow, deliberate growth that compounds over time through smart positioning.',
    },
  },
  {
    order: 4,
    ref: 'type_q4',
    text: 'How would you like to use your personal energy as an entrepreneur?',
    optionToAnimal: makeAnimalMap('BADC'),
    letterOrder: 'BADC',
    optionLabels: {
      A: 'Share the load, distribute tasks, and avoid burning out alone.',
      B: 'Direct the group\'s energy, motivate people, and lead from the front.',
      C: 'Conserve energy, make calculated moves, and only strike when the odds are strong.',
      D: 'Go all-in, work intensely, and push hard through obstacles.',
    },
  },
  {
    order: 5,
    ref: 'type_q5',
    text: 'When you face an unclear, high-ambiguity situation, what do you tend to do?',
    optionToAnimal: makeAnimalMap('ABCD'),
    letterOrder: 'ABCD',
    optionLabels: {
      A: 'Stay close to collaborators and avoid going too far beyond what\'s known.',
      B: 'Guide others through the uncertainty with structured plans and morale.',
      C: 'Pause, observe, gather intelligence, and wait for the right opening.',
      D: 'Charge ahead, test boundaries, and learn by doing, even if it hurts.',
    },
  },
  {
    order: 6,
    ref: 'type_q6',
    text: 'When you feel strongly about an idea, what do you usually do first?',
    optionToAnimal: makeAnimalMap('BCDA'),
    letterOrder: 'BCDA',
    optionLabels: {
      A: 'Act on it quickly, then figure out the details as you go.',
      B: 'Run it by a few trusted people to see what they think before moving.',
      C: 'Share it confidently with the team and try to get everyone behind it.',
      D: 'Quietly test it in your head or on paper before telling anyone.',
    },
  },
  {
    order: 7,
    ref: 'type_q7',
    text: 'In a dream world, where will you be in 10 years as an entrepreneur?',
    optionToAnimal: makeAnimalMap('CDAB'),
    letterOrder: 'CDAB',
    optionLabels: {
      A: 'Working with a familiar, trusted group in a secure business.',
      B: 'Leading a strong organization with a loyal team around you.',
      C: 'Running a well-positioned, efficient operation that steadily compounds value.',
      D: 'Having taken big swings, either enjoying major success or gearing up for the next big attempt.',
    },
  },
  {
    order: 8,
    ref: 'type_q8',
    text: 'How do you prefer to grow as a business owner?',
    optionToAnimal: makeAnimalMap('ABDC'),
    letterOrder: 'ABDC',
    optionLabels: {
      A: 'Learn from your close circle, mentors, and peer collaboration.',
      B: 'Learn by leading new initiatives and getting feedback from your team.',
      C: 'Learn through research, data, and studying others\' strategies.',
      D: 'Learn by jumping into challenging situations and figuring it out under pressure.',
    },
  },
  {
    order: 9,
    ref: 'type_q9',
    text: 'When you look back at your proudest work moment, what made it satisfying?',
    optionToAnimal: makeAnimalMap('ACDB'),
    letterOrder: 'ACDB',
    optionLabels: {
      A: 'Was a significant contributor to a highly successful win, with a big group of players/team members.',
      B: 'Pulling off a big, risky move that paid off in a noticeable way.',
      C: 'Led a project or team to a major success.',
      D: 'Designed a long term plan or project with a group that was perfectly executed with grand success.',
    },
  },
  {
    order: 10,
    ref: 'type_q10',
    text: 'How have you felt about rules and processes in your past jobs?',
    optionToAnimal: makeAnimalMap('DCBA'),
    letterOrder: 'DCBA',
    optionLabels: {
      A: 'Appreciate clear rules that keep the group coordinated and safe.',
      B: 'Prefer structure that supports the team but allows leadership flexibility.',
      C: 'Value well-designed processes and systems that make work smoother.',
      D: 'Tolerate structure only if it doesn\'t slow you down too much.',
    },
  },
];

const tieBreakerConfig: TieBreakerConfig = {
  ref: 'tiebreaker',
  text: "Running a business is a lot like hunting out in the wild.\n\nBelow, you'll see a table of four different animals' hunting styles. Each one represents a different approach to business.\n\nFor example, in Row #1, the animal hunts alone and has a very low success rate (only 8%). But when the animal catches its prey, it keeps 100% the reward. In business terms, this might mean taking bigger risks and needing 1-2 years to start seeing success in your business.\n\nBased on the table below, which row sounds MOST like your business personality?",
  optionToAnimal: {
    A: 'Tiger',
    B: 'Lion',
    C: 'African Dog',
    D: 'Killer Whale',
  },
  optionLabels: {
    A: 'Tiger',
    B: 'Lion',
    C: 'African Wild Dog',
    D: 'Killer Whale',
  },
};

const riskThresholds: ThresholdConfig = { lowMax: 20, mediumMax: 39 };
const rewardThresholds: ThresholdConfig = { lowMax: 20, mediumMax: 39 };

// --- Content Data ---

const animalContent = [
  {
    key: 'African Dog',
    title: 'The Steady Strategist',
    description:
      'Collaborative, consistent, and dependable, the African Dog thrives in teamwork and structured environments. They prefer steady growth over risky leaps, building trust-based ventures that endure through integrity and discipline.',
    traits: ['calculated', 'control', 'steady', 'shared'],
  },
  {
    key: 'Killer Whale',
    title: 'The Steady Strategist',
    description:
      'Intelligent, patient, and precise, the Killer Whale plays the long game. They succeed through planning, partnerships, and well-timed decisions, turning strategy into lasting success and influence.',
    traits: ['intelligent', 'patient', 'precise', 'strategic'],
  },
  {
    key: 'Lion',
    title: 'The Ambitious Climber',
    description:
      'Confident and courageous, the Lion blends bold action with thoughtful control. They pursue goals with discipline and heart, steadily growing their ventures through persistence and purpose.',
    traits: ['confident', 'courageous', 'disciplined', 'purposeful'],
  },
  {
    key: 'Tiger',
    title: 'The Fearless Pursuer',
    description:
      'Driven, daring, and instinctive, the Tiger thrives on high stakes and fast movement. They chase bold ideas, take decisive risks, and transform ambition into powerful momentum and visible results.',
    traits: ['driven', 'daring', 'instinctive', 'bold'],
  },
];

const riskLevelContent = [
  {
    key: 'Low',
    title: 'Low Risk',
    description:
      'A low level of risk appetite reflects a preference for stability, predictability, and security. Individuals with this mindset make decisions carefully, prioritizing preparation and consistency over rapid change. They excel at building steady, reliable businesses where planning and control minimize uncertainty.',
  },
  {
    key: 'Medium',
    title: 'Medium Risk',
    description:
      "A medium level of risk appetite reflects a balanced approach to decision-making. Individuals with this mindset take calculated risks, weighing potential gains against possible losses before acting. They are confident enough to pursue new opportunities but grounded enough to ensure there's a solid plan behind every move.",
  },
  {
    key: 'High',
    title: 'High Risk',
    description:
      'A high level of risk appetite reflects bold confidence and a strong tolerance for uncertainty. Individuals with this trait are energized by challenges and see potential where others see danger, often viewing setbacks as learning opportunities. They move decisively, willing to bet on their instincts and embrace change as a path to big rewards.',
  },
];

const rewardLevelContent = [
  {
    key: 'Low',
    title: 'Low Reward',
    description:
      "A low level of reward drive reflects a preference for shared success and collective achievement over personal gain. Individuals with this mindset are motivated by teamwork, collaboration, and contributing to a group's long-term stability. They find fulfillment in seeing others grow and succeed alongside them, valuing community wins over individual recognition.",
  },
  {
    key: 'Medium',
    title: 'Medium Reward',
    description:
      "A medium level of reward drive reflects a balanced motivation between personal achievement and shared success. Individuals with this mindset strive for recognition and progress but also value collaboration and collective growth. They enjoy achieving their own goals while contributing to a team's overall accomplishments.",
  },
  {
    key: 'High',
    title: 'High Reward',
    description:
      'A high level of reward drive reflects strong motivation for achievement, recognition, and tangible success. Individuals with this mindset are goal-oriented, ambitious, and inspired by results that demonstrate progress and impact. They measure success through growth, performance, and the rewards that come from winning big.',
  },
];

const driverContent = [
  {
    key: 'Boss',
    title: 'Be My Own Boss',
    description:
      'You are driven by independence and decision-making power as a future entrepreneur. You want to call the shots, set the direction, and build something that reflects your ideas, values, and standards.',
    questions: [
      'Which industries or niches interest you that would let you operate mostly on your own terms (for example, solo consulting, creative services, coaching, or a small product brand)?',
      'Do you picture yourself working mainly one-on-one with clients, selling to many customers online, or leading a small team, and which business types match that picture?',
      'When you imagine being "the boss," what kind of business setting do you see around you: local and in-person, fully online, or a mix of both?',
    ],
  },
  {
    key: 'Control',
    title: 'Control My Time & Schedule',
    description:
      'You are motivated by flexibility and control over your time and routine. You want a business that supports your lifestyle, energy, and responsibilities, not one that traps you in a new version of a 9-to-5.',
    questions: [
      'Which business ideas could realistically be run from anywhere with a laptop, like digital services, online education, or content creation?',
      'Are you more drawn to project-based work (freelancing, consulting) or ongoing income models (memberships, subscriptions, retainers) that give more predictability to your schedule?',
      'Do you want a business that can stay small and flexible, or eventually grow into something bigger with a team, and which ideas match that vision?',
    ],
  },
  {
    key: 'Passion',
    title: 'Turn Passion Into Income',
    description:
      'You are driven by the desire to earn money doing something you genuinely enjoy or care about. You want your business to reflect your interests, talents, or hobbies so your work feels personally meaningful.',
    questions: [
      'Which passions could realistically connect to an existing industry, such as arts and culture, education, health, or digital services?',
      'Do your interests fit better with selling services (teaching, coaching, creating) or selling products (physical goods, digital products, art, or tools)?',
      'When you imagine "doing what you love" as a business, do you see yourself working with people directly, working behind the scenes, or creating things that reach people at scale?',
    ],
  },
  {
    key: 'Money',
    title: 'Earn More Money',
    description:
      'You are strongly motivated by increasing your income and building financial freedom. You want a business that has clear earning potential and room to grow over time.',
    questions: [
      'Which business models in your areas of interest naturally allow for higher income, such as high-ticket services, scalable digital products, or tech and consulting?',
      'Are you more drawn to businesses that sell to individuals (B2C) or organizations (B2B), and which one seems more likely to reach your income goals?',
      'Which industries are growing or in high demand right now that also match your skills or interests, such as technology, education, health, or digital services?',
    ],
  },
  {
    key: 'Solve',
    title: 'Solve a Problem',
    description:
      'You are motivated by fixing something that feels broken or inefficient. You want your business to exist for a clear purpose: to make life easier, faster, cheaper, or better for specific people.',
    questions: [
      'Which problems have you personally experienced in areas like education, health, technology, or everyday life that could be turned into a service or product?',
      'Do you see yourself solving problems for individuals (for example, tutoring, coaching, personal services) or for organizations (for example, consulting, software, training)?',
      'Which business areas seem to have a lot of frustrated people but not many good solutions yet, and could you see yourself stepping into that gap?',
    ],
  },
  {
    key: 'Impact',
    title: 'Have a Positive Social Impact',
    description:
      'You are driven by the desire to create change and help people, communities, or causes. You want your business to line up with your values and make a meaningful difference.',
    questions: [
      'Which issue areas matter most to you, such as environment, youth, justice, health, or community development, and what types of businesses already exist in those spaces?',
      'Does your impact vision fit better with a social enterprise, a mission-driven service (like coaching or education), or an advocacy-focused venture (events, media, campaigns)?',
      'Which kinds of customers or communities do you feel most called to serve, and what kinds of services or products could genuinely help them?',
    ],
  },
  {
    key: 'Legacy',
    title: 'Build a Legacy',
    description:
      'You are motivated by creating something that lasts beyond you. You want a business that can grow, be remembered, or even be passed on to others over time.',
    questions: [
      'Which business ideas could realistically be built into a brand, agency, firm, or organization that continues without you doing every task yourself?',
      'Do you imagine your legacy being tied to a specific community, industry, or cause, and which types of businesses live long in those spaces (for example, schools, firms, product brands, or foundations)?',
      'When you picture your business 10-20 years from now, is it a name people recognize, a system others use, or a place people rely on, and which ideas you have today match that picture?',
    ],
  },
];

const aoiContent = [
  {
    key: 'Arts',
    title: 'Arts & Culture',
    description:
      'You are drawn to creativity, expression, and preserving or elevating culture through your work. You thrive in businesses where aesthetics, storytelling, and community experiences matter.',
    businesses: [
      'Art studio or gallery',
      'Event decor and design service',
      'Vintage or restoration studio (furniture, art, fashion)',
      'Arts and crafts supply store (online or local)',
      'Photography or videography business',
      'Graphic or visual design studio',
      'Cultural event planning company',
      'Custom print shop (posters, merch, art prints)',
      'Museum, tour, or cultural experience business',
      'Creative workshop or retreat facilitator',
    ],
  },
  {
    key: 'Consulting',
    title: 'Consulting',
    description:
      'You like solving problems, offering expert advice, and helping others make better decisions. You thrive in roles where your knowledge, experience, and strategic thinking drive results.',
    businesses: [
      'Business strategy consulting',
      'Accounting or bookkeeping firm',
      'Legal or compliance consulting',
      'HR or people operations consulting',
      'Marketing or brand consulting',
      'Financial planning or wealth advisory',
      'Career or executive coaching',
      'Nonprofit or social impact consulting',
      'Operations or process improvement consulting',
      'IT or digital transformation consulting',
    ],
  },
  {
    key: 'Digital',
    title: 'Digital Services',
    description:
      'You enjoy working online, creating digital assets, and providing services that help others show up better on the internet. You thrive in remote-friendly, scalable businesses.',
    businesses: [
      'Website design and development',
      'Graphic design studio',
      'Social media management agency',
      'Copywriting or content writing services',
      'SEO or digital marketing agency',
      'Video editing or animation services',
      'UX/UI design consultancy',
      'Email marketing or funnel-building services',
      'Virtual assistant or online operations support',
      'Online course or digital product creation services',
    ],
  },
  {
    key: 'Education',
    title: 'Education',
    description:
      'You are motivated by teaching, mentoring, and helping others learn and grow. You thrive in businesses that focus on instruction, guidance, and knowledge-sharing.',
    businesses: [
      'Private tutoring service',
      'Test prep or college counseling business',
      'Online course creation and teaching',
      'Educational consulting (schools, programs, curriculum)',
      'Learning center or micro-school',
      'Coaching in a specialty (career, business, skills)',
      'Homeschool support services',
      'Workshops, webinars, and training programs',
      'Study skills or executive function coaching',
      'Educational content creation (books, videos, lesson plans)',
    ],
  },
  {
    key: 'Hospitality',
    title: 'Food & Hospitality',
    description:
      'You enjoy serving others, creating experiences, and bringing people together around food, travel, or comfort. You thrive in businesses where service, ambiance, and customer experience are central.',
    businesses: [
      'Cafe, bakery, or small restaurant',
      'Food truck or pop-up food concept',
      'Catering or private chef business',
      'Meal prep or subscription food service',
      'Boutique hotel, hostel, or guesthouse',
      'Travel planning or concierge service',
      'Event planning and coordination',
      'Specialty food product brand (sauces, snacks, etc.)',
      'Culinary classes or tasting experiences',
      'Short-term rental or Airbnb management',
    ],
  },
  {
    key: 'Health',
    title: 'Health',
    description:
      'You care about wellbeing, vitality, and helping people feel or live better. You thrive in businesses centered on care, support, and personal transformation.',
    businesses: [
      'Personal training or fitness coaching',
      'Nutrition coaching or meal planning services',
      'Mental health or wellness coaching (within your credentials)',
      'Physical therapy or rehab practice (licensed)',
      'Home caregiving or senior support services',
      'Yoga, Pilates, or movement studio',
      'Holistic health or alternative wellness practice',
      'Health education workshops and programs',
      'Corporate wellness consulting',
      'Online health and wellness content or membership',
    ],
  },
  {
    key: 'Personal',
    title: 'Personal & Home',
    description:
      'You like helping individuals and families improve their daily lives, surroundings, or routines. You thrive in service-based businesses that offer convenience, comfort, or lifestyle upgrades.',
    businesses: [
      'Landscaping or lawn care business',
      'House cleaning or organizing service',
      'Pet care, grooming, or dog walking business',
      'Home repair or handyman services',
      'Interior decorating or home styling',
      'Mobile beauty, hair, or salon services',
      'Personal concierge or errand-running service',
      'Home staging for real estate',
      'Childcare, nanny placement, or babysitting service',
      'Moving, packing, or downsizing support',
    ],
  },
  {
    key: 'Retail',
    title: 'Retail',
    description:
      'You are drawn to products, merchandising, and connecting people with things they love or need. You thrive in businesses that involve curation, branding, and customer experience.',
    businesses: [
      'Online boutique (clothing, accessories, or niche goods)',
      'Ecommerce store using dropshipping or print-on-demand',
      'Brick-and-mortar retail shop',
      'Subscription box business',
      'Reselling or vintage clothing store',
      'Specialty product brand (beauty, candles, stationery, etc.)',
      'Pop-up shop or market-based retail',
      'Niche hobby or gaming store',
      'Digital products shop (templates, printables, resources)',
      'Marketplace seller (Etsy, Amazon, etc.)',
    ],
  },
  {
    key: 'Social',
    title: 'Social',
    description:
      'You are motivated by impact, justice, and improving communities or the world. You thrive in mission-driven ventures that align business with values and change-making.',
    businesses: [
      'Social enterprise selling mission-driven products',
      'Environmental consulting or eco-friendly products business',
      'Community organizing or advocacy organization',
      'Political campaign services or strategy',
      'Nonprofit or foundation startup',
      'Fundraising and grant-writing services',
      'Diversity, equity, and inclusion consulting',
      'Community event and coalition building services',
      'Educational campaigns or awareness-based media',
      'Impact-focused membership or advocacy platform',
    ],
  },
  {
    key: 'Tech',
    title: 'Technology',
    description:
      'You enjoy solving problems with tools, systems, and innovation. You thrive in businesses that involve building, improving, or supporting technology.',
    businesses: [
      'IT support or managed services provider',
      'Custom software or app development',
      'SaaS product or platform',
      'AI tools or automation services',
      'Cybersecurity consulting',
      'Data analytics or business intelligence services',
      'Tech project management or implementation consulting',
      'No-code or low-code solution building for clients',
      'Tech training, bootcamps, or workshops',
      'Hardware, device, or tech accessory business',
    ],
  },
  {
    key: 'Trades',
    title: 'Trades',
    description:
      'You are drawn to hands-on, skilled work that builds and maintains the physical world. You thrive in businesses where craftsmanship, reliability, and practical expertise are valued.',
    businesses: [
      'Plumbing services',
      'Electrical contracting',
      'HVAC installation and repair',
      'General contracting or construction',
      'Carpentry or woodworking',
      'Roofing services',
      'Auto repair or detailing',
      'Welding or metalwork',
      'Painting and finishing services',
      'Appliance repair services',
    ],
  },
];

const strategyContent = [
  {
    key: 'Creator',
    title: 'Creator',
    description:
      "You're drawn to designing something of your own from the ground up. Starting from scratch gives you full control over the idea, brand, and systems, but it also means you carry the most responsibility for testing, refining, and building momentum from zero.",
    actions: [
      'Brainstorm three simple business ideas you could start with your current skills and write one sentence for who each one would serve.',
      'Pick one idea and outline a "starter version" you could launch in the next 30 days, such as a single service, basic offer, or minimum product.',
      'Make a short list of 5-10 people, communities, or online spaces where you can share this idea to get feedback or your first interested customers.',
    ],
  },
  {
    key: 'Consolidator',
    title: 'Consolidator',
    description:
      'You like the idea of stepping into something that already has motion behind it. Buying an existing business lets you start with customers, systems, and revenue in place, while your role becomes improving, stabilizing, or growing what is already there.',
    actions: [
      'Choose 2-3 industries you understand or are curious about and start looking at example businesses for sale to see what is possible.',
      'Draft a simple checklist of what you would want to learn before buying any business, such as revenue, expenses, customer base, and daily workload.',
      'Talk with at least one current small business owner about what they wish they had known before buying or starting their business.',
    ],
  },
  {
    key: 'Franchisee',
    title: 'Franchisee',
    description:
      'You are attracted to a clear system and recognizable brand rather than building everything from scratch. Buying into a franchise lets you follow a proven playbook with support, while trading some creative freedom for structure and guidance.',
    actions: [
      'Make a shortlist of franchise industries that interest you, such as food, fitness, or services, and note what appeals to you about each.',
      'Compare a few franchise options by looking at startup costs, support offered, and day-to-day responsibilities to see what fits your reality.',
      'Arrange a conversation with a current franchise owner to ask about their experience, including what has been easier and harder than expected.',
    ],
  },
  {
    key: 'Contractor',
    title: 'Contractor',
    description:
      'You want to start simple by getting paid directly for skills you already have. Beginning as a contractor, freelancer, or consultant lets you move quickly, test what people will pay for, and decide later if you want to grow into a larger company.',
    actions: [
      'Write down the top skills or experiences people already come to you for, and turn one into a clear paid service with a result and a price.',
      'Create a basic overview page or one-pager that explains who you help, what you do, and how someone can contact or book you.',
      'Reach out personally to a handful of people or organizations who might need this service and offer a limited "pilot" or trial version.',
    ],
  },
];

// --- Non-scored survey questions ---
const surveyQuestions: SurveyQuestionsData = {
  big5Personality: {
    key: 'big5Personality',
    label: 'Big 5 Personality',
    description: 'Five binary questions measuring the Big 5 personality traits. Not scored.',
    questions: [
      {
        order: 1,
        ref: 'big5_openness',
        text: 'Which statement sounds more like YOU?',
        type: 'binary',
        category: 'Big 5 Personality',
        construct: 'Openness',
        options: { A: 'I enjoy change', B: 'I prefer routine' },
      },
      {
        order: 2,
        ref: 'big5_extraversion',
        text: 'Which statement sounds more like YOU?',
        type: 'binary',
        category: 'Big 5 Personality',
        construct: 'Extraversion',
        options: { A: 'I thrive around other people', B: 'I prefer quiet solitude' },
      },
      {
        order: 3,
        ref: 'big5_agreeableness',
        text: 'Which statement sounds more like YOU?',
        type: 'binary',
        category: 'Big 5 Personality',
        construct: 'Agreeableness',
        options: { A: "I'm generally cooperative", B: "I'm generally assertive" },
      },
      {
        order: 4,
        ref: 'big5_neuroticism',
        text: 'Which statement sounds more like YOU?',
        type: 'binary',
        category: 'Big 5 Personality',
        construct: 'Neuroticism',
        options: { A: 'I worry easily', B: 'I rarely experience anxiety' },
      },
      {
        order: 5,
        ref: 'big5_conscientiousness',
        text: 'Which statement sounds more like YOU?',
        type: 'binary',
        category: 'Big 5 Personality',
        construct: 'Conscientiousness',
        options: { A: "I'm very self-disciplined", B: 'I jump in without thinking' },
      },
    ],
  },
  personalityGames: {
    key: 'personalityGames',
    label: 'Personality Games',
    description: 'Rank-order preference of game types. Not scored.',
    questions: [
      {
        order: 1,
        ref: 'personality_games_rank',
        text: 'Which games do you love to play?\n\nUse your finger or mouse to move the items below up and down. Put them in order with your favorite game at the top.',
        type: 'rank',
        category: 'Personality Games',
        options: {
          '1': 'Chess',
          '2': 'Tetris',
          '3': 'Sudoku',
          '4': 'Monopoly',
          '5': 'Solitaire',
          '6': 'Wordle',
        },
      },
    ],
  },
  personalityScales: {
    key: 'personalityScales',
    label: 'Personality Scales',
    description: 'Four self-assessment scales rated 1-5. Not scored.',
    questions: [
      {
        order: 1,
        ref: 'scale_creative',
        text: 'I can easily sit down and create something artistic from scratch.',
        type: 'scale',
        category: 'Personality Scales',
        construct: 'Creative',
        scaleMin: 1,
        scaleMax: 5,
        options: { '1': 'Not at all me', '5': 'Very much me' },
      },
      {
        order: 2,
        ref: 'scale_analytical',
        text: 'I could spend hours working in Excel spreadsheets.',
        type: 'scale',
        category: 'Personality Scales',
        construct: 'Analytical',
        scaleMin: 1,
        scaleMax: 5,
        options: { '1': 'Not at all me', '5': 'Very much me' },
      },
      {
        order: 3,
        ref: 'scale_relational',
        text: "When I'm in a group setting, I'm always paying attention to how others are feeling.",
        type: 'scale',
        category: 'Personality Scales',
        construct: 'Relational',
        scaleMin: 1,
        scaleMax: 5,
        options: { '1': 'Not at all me', '5': 'Very much me' },
      },
      {
        order: 4,
        ref: 'scale_obsessive',
        text: "When I have an idea or goal, I can't stop thinking about it. It becomes an obsession.",
        type: 'scale',
        category: 'Personality Scales',
        construct: 'Obsessive',
        scaleMin: 1,
        scaleMax: 5,
        options: { '1': 'Not at all me', '5': 'Very much me' },
      },
    ],
  },
  howTools: {
    key: 'howTools',
    label: 'How - Tools',
    description: 'Matrix questions about preferred business models. Not scored.',
    questions: [
      {
        order: 1,
        ref: 'how_product_type',
        text: 'I imagine my business selling...',
        type: 'matrix',
        category: 'How - Tools',
        options: {
          'Physical Products': 'Physical Products',
          'Digital Products': 'Digital Products',
          'Services': 'Services',
        },
        notes: 'Columns: Not interested, Somewhat Interested, Very Interested',
      },
      {
        order: 2,
        ref: 'how_sales_model',
        text: 'I imagine selling my products or services...',
        type: 'matrix',
        category: 'How - Tools',
        options: {
          'B2B': 'B2B (Business to Business): Selling products or services to other businesses.',
          'B2C': 'B2C (Business to Consumer): Selling directly to individual consumers.',
          'D2C': 'D2C (Direct to Consumer): Producer/brand sells straight to consumers, bypassing retailers.',
          'C2C': 'C2C (Consumer to Consumer): Individuals sell to other individuals via a platform.',
          'B2G': 'B2G / B2P (Business to Government/Public Sector): Selling to government agencies or public institutions.',
        },
        notes: 'Columns: Not interested, Somewhat Interested, Very Interested',
      },
      {
        order: 3,
        ref: 'how_business_vision',
        text: 'When I imagine my future business, I see myself...',
        type: 'matrix',
        category: 'How - Tools',
        options: {
          'Working alone': 'Working alone',
          'Building a team': 'Building a team',
          'Running a small business': 'Running a small business',
          'Scaling as big as possible': 'Scaling as big as possible',
        },
        notes: 'Columns: Not interested, Somewhat Interested, Very Interested',
      },
    ],
  },
  openEnded: {
    key: 'openEnded',
    label: 'Open-Ended',
    description: 'Free-text reflection questions. Not scored.',
    questions: [
      {
        order: 1,
        ref: 'open_business_dream',
        text: 'In a dream world, what does your future business look like?',
        type: 'open-ended',
        category: 'Open-Ended',
        notes: 'Write down whatever thoughts immediately come to mind.',
      },
      {
        order: 2,
        ref: 'open_impact_life',
        text: 'What impact do you hope your future business has on your own life?',
        type: 'open-ended',
        category: 'Open-Ended',
        notes: 'Write down whatever thoughts immediately come to mind.',
      },
    ],
  },
};

// --- Form Configuration ---
// Order matches Typeform flow from questions_order.md
const formSections: FormSectionConfig[] = [
  {
    key: 'tiebreaker',
    order: 1,
    title: 'Running a business is a lot like hunting out in the wild.',
    subtitle: '',
    introText: '',
    introButtonText: 'Start Now',
    questions: [
      { questionRef: 'tiebreaker', displayType: 'table-choice' },
    ],
  },
  {
    key: 'personality-risk',
    order: 2,
    title: "Let's have some fun! Tell me about your personality.",
    subtitle: "Don't think, just react.",
    introText: '',
    introButtonText: 'Start Now',
    questions: [
      { questionRef: 'risk_q1', displayType: 'image-choice', optionImages: { A: '/icons/form/risk_q1_a.png', B: '/icons/form/risk_q1_b.png' } },
      { questionRef: 'risk_q2', displayType: 'image-choice', optionImages: { A: '/icons/form/risk_q2_a.png', B: '/icons/form/risk_q2_b.png' } },
      { questionRef: 'risk_q3', displayType: 'image-choice', optionImages: { A: '/icons/form/risk_q3_a.png', B: '/icons/form/risk_q3_b.png' } },
      { questionRef: 'risk_q4', displayType: 'image-choice', optionImages: { A: '/icons/form/risk_q4_a.png', B: '/icons/form/risk_q4_b.png' } },
      { questionRef: 'risk_q5', displayType: 'image-choice', optionImages: { A: '/icons/form/risk_q5_a.png', B: '/icons/form/risk_q5_b.png' } },
      { questionRef: 'risk_q6', displayType: 'likert-boxes', description: 'Not at all like me → Exactly like me' },
      { questionRef: 'risk_q7', displayType: 'likert-boxes', description: 'Not at all like me → Exactly like me' },
      { questionRef: 'risk_q8', displayType: 'likert-boxes', description: 'Not at all like me → Exactly like me' },
      { questionRef: 'risk_q9', displayType: 'likert-boxes', description: 'Not at all like me → Exactly like me' },
      { questionRef: 'risk_q10', displayType: 'likert-boxes', description: 'Not at all like me → Exactly like me' },
    ],
  },
  {
    key: 'personality-reward',
    order: 3,
    title: 'How you act in everyday circumstances tells a story of who you can become in business...',
    subtitle: '',
    introText: '',
    introButtonText: 'Continue',
    questions: [
      { questionRef: 'reward_q1', displayType: 'image-choice', optionImages: { A: '/icons/form/reward_q1_a.png', B: '/icons/form/reward_q1_b.png' } },
      { questionRef: 'reward_q2', displayType: 'image-choice', optionImages: { A: '/icons/form/reward_q2_a.png', B: '/icons/form/reward_q2_b.png' } },
      { questionRef: 'reward_q3', displayType: 'image-choice', optionImages: { A: '/icons/form/reward_q3_a.png', B: '/icons/form/reward_q3_b.png' } },
      { questionRef: 'reward_q4', displayType: 'image-choice', optionImages: { A: '/icons/form/reward_q4_a.png', B: '/icons/form/reward_q4_b.png' } },
      { questionRef: 'reward_q5', displayType: 'image-choice', optionImages: { A: '/icons/form/reward_q5_a.png', B: '/icons/form/reward_q5_b.png' } },
      { questionRef: 'reward_q6', displayType: 'likert-boxes', description: 'Not at all like me → Exactly like me' },
      { questionRef: 'reward_q7', displayType: 'likert-boxes', description: 'Not at all like me → Exactly like me' },
      { questionRef: 'reward_q8', displayType: 'likert-boxes', description: 'Not at all like me → Exactly like me' },
      { questionRef: 'reward_q9', displayType: 'likert-boxes', description: 'Not at all like me → Exactly like me' },
      { questionRef: 'reward_q10', displayType: 'likert-boxes', description: 'Not at all like me → Exactly like me' },
    ],
  },
  {
    key: 'big5',
    order: 4,
    title: 'This or that?',
    subtitle: 'Which one sounds more like you?...',
    introText: '',
    introButtonText: 'Keep Going',
    questions: [
      { questionRef: 'big5_openness', displayType: 'image-choice', optionImages: { A: '/icons/form/big5_q1_a.png', B: '/icons/form/big5_q1_b.png' } },
      { questionRef: 'big5_extraversion', displayType: 'image-choice', optionImages: { A: '/icons/form/big5_q2_a.png', B: '/icons/form/big5_q2_b.png' } },
      { questionRef: 'big5_agreeableness', displayType: 'image-choice', optionImages: { A: '/icons/form/big5_q3_a.png', B: '/icons/form/big5_q3_b.png' } },
      { questionRef: 'big5_neuroticism', displayType: 'image-choice', optionImages: { A: '/icons/form/big5_q4_a.png', B: '/icons/form/big5_q4_b.png' } },
      { questionRef: 'big5_conscientiousness', displayType: 'image-choice', optionImages: { A: '/icons/form/big5_q5_a.png', B: '/icons/form/big5_q5_b.png' } },
    ],
  },
  {
    key: 'four-types',
    order: 5,
    title: 'Which of each four sounds MOST like you?',
    subtitle: 'Take your time to answer each question carefully, reflecting on which answer is MOST like you.',
    introText: '',
    introButtonText: 'Keep Going',
    questions: [
      { questionRef: 'type_q1', displayType: 'multiple-choice', optionImages: { A: '/icons/form/type_q1_a.png', B: '/icons/form/type_q1_b.png', C: '/icons/form/type_q1_c.png', D: '/icons/form/type_q1_d.png' } },
      { questionRef: 'type_q2', displayType: 'multiple-choice', optionImages: { A: '/icons/form/type_q2_a.png', B: '/icons/form/type_q2_b.png', C: '/icons/form/type_q2_c.png', D: '/icons/form/type_q2_d.png' } },
      { questionRef: 'type_q3', displayType: 'multiple-choice', optionImages: { A: '/icons/form/type_q3_a.png', B: '/icons/form/type_q3_b.png', C: '/icons/form/type_q3_c.png', D: '/icons/form/type_q3_d.png' } },
      { questionRef: 'type_q4', displayType: 'multiple-choice', optionImages: { A: '/icons/form/type_q4_a.png', B: '/icons/form/type_q4_b.png', C: '/icons/form/type_q4_c.png', D: '/icons/form/type_q4_d.png' } },
      { questionRef: 'type_q5', displayType: 'multiple-choice', optionImages: { A: '/icons/form/type_q5_a.png', B: '/icons/form/type_q5_b.png', C: '/icons/form/type_q5_c.png', D: '/icons/form/type_q5_d.png' } },
      { questionRef: 'type_q6', displayType: 'multiple-choice', optionImages: { A: '/icons/form/type_q6_a.png', B: '/icons/form/type_q6_b.png', C: '/icons/form/type_q6_c.png', D: '/icons/form/type_q6_d.png' } },
      { questionRef: 'type_q7', displayType: 'multiple-choice', optionImages: { A: '/icons/form/type_q7_a.png', B: '/icons/form/type_q7_b.png', C: '/icons/form/type_q7_c.png', D: '/icons/form/type_q7_d.png' } },
      { questionRef: 'type_q8', displayType: 'multiple-choice', optionImages: { A: '/icons/form/type_q8_a.png', B: '/icons/form/type_q8_b.png', C: '/icons/form/type_q8_c.png', D: '/icons/form/type_q8_d.png' } },
      { questionRef: 'type_q9', displayType: 'multiple-choice', optionImages: { A: '/icons/form/type_q9_a.png', B: '/icons/form/type_q9_b.png', C: '/icons/form/type_q9_c.png', D: '/icons/form/type_q9_d.png' } },
      { questionRef: 'type_q10', displayType: 'multiple-choice', optionImages: { A: '/icons/form/type_q10_a.png', B: '/icons/form/type_q10_b.png', C: '/icons/form/type_q10_c.png', D: '/icons/form/type_q10_d.png' } },
    ],
  },
  {
    key: 'brain-work',
    order: 6,
    title: 'How does your brain work?',
    subtitle: "Let's see what's going on inside that mind of yours.",
    introText: '',
    introButtonText: "Let's Find Out",
    questions: [
      { questionRef: 'personality_games_rank', displayType: 'rank-order' },
      { questionRef: 'select_driver', displayType: 'image-choice', description: "This is a hard one! Take your time to pick the ONE reason that is most important to you.", optionImages: { Boss: '/icons/form/driver_boss.png', Control: '/icons/form/driver_control.png', Passion: '/icons/form/driver_passion.png', Money: '/icons/form/driver_money.png', Solve: '/icons/form/driver_solve.png', Impact: '/icons/form/driver_impact.png', Legacy: '/icons/form/driver_legacy.png' } },
      { questionRef: 'scale_creative', displayType: 'star-rating', description: '1 = not at all me, 5 = very much me' },
      { questionRef: 'scale_analytical', displayType: 'star-rating', description: '1 = not at all me, 5 = very much me' },
      { questionRef: 'scale_relational', displayType: 'star-rating', description: '1 = not at all me, 5 = very much me' },
      { questionRef: 'scale_obsessive', displayType: 'star-rating', description: '1 = not at all me, 5 = very much me' },
    ],
  },
  {
    key: 'interests',
    order: 7,
    title: 'What lights you up?',
    subtitle: 'What gets you excited about your future business?',
    introText: '',
    introButtonText: "Let's Explore",
    questions: [
      { questionRef: 'select_aoi1', displayType: 'image-choice', description: "This is a tough one! Take your time answering.\n\nDon't worry about your skill set. Respond based on your interest level.", optionImages: { Arts: '/icons/form/aoi_arts.png', Consulting: '/icons/form/aoi_consulting.png', Digital: '/icons/form/aoi_digital.png', Education: '/icons/form/aoi_education.png', Hospitality: '/icons/form/aoi_hospitality.png', Health: '/icons/form/aoi_health.png', Personal: '/icons/form/aoi_personal.png', Retail: '/icons/form/aoi_retail.png', Social: '/icons/form/aoi_social.png', Tech: '/icons/form/aoi_tech.png', Trades: '/icons/form/aoi_trades.png' } },
      { questionRef: 'select_aoi2', displayType: 'image-choice', description: "Take your time answering.\n\nAgain, don't worry about your skill set. Respond based on your interest level.", optionImages: { Arts: '/icons/form/aoi_arts.png', Consulting: '/icons/form/aoi_consulting.png', Digital: '/icons/form/aoi_digital.png', Education: '/icons/form/aoi_education.png', Hospitality: '/icons/form/aoi_hospitality.png', Health: '/icons/form/aoi_health.png', Personal: '/icons/form/aoi_personal.png', Retail: '/icons/form/aoi_retail.png', Social: '/icons/form/aoi_social.png', Tech: '/icons/form/aoi_tech.png', Trades: '/icons/form/aoi_trades.png' } },
    ],
  },
  {
    key: 'future-business',
    order: 8,
    title: 'Tell me about your future business...',
    subtitle: '',
    introText: '',
    introButtonText: 'Continue',
    questions: [
      { questionRef: 'how_product_type', displayType: 'matrix', matrixColumns: ['Not Interested', 'Somewhat Interested', 'Very Interested'] },
      { questionRef: 'how_sales_model', displayType: 'matrix', matrixColumns: ['Not Interested', 'Somewhat Interested', 'Very Interested'] },
      { questionRef: 'how_business_vision', displayType: 'matrix', matrixColumns: ['Not Interested', 'Somewhat Interested', 'Very Interested'] },
    ],
  },
  {
    key: 'strategy',
    order: 9,
    title: 'Which business approach fits you best?',
    subtitle: '',
    introText: '',
    introButtonText: "Let's Find Out",
    questions: [
      { questionRef: 'select_strategy', displayType: 'image-choice', description: "Pick the option that you're MOST interested in pursuing.", optionImages: { Creator: '/icons/form/strategy_creator.png', Consolidator: '/icons/form/strategy_consolidator.png', Franchisee: '/icons/form/strategy_franchisee.png', Contractor: '/icons/form/strategy_contractor.png' } },
    ],
  },
  {
    key: 'contact',
    order: 10,
    title: 'Almost there!',
    subtitle: "We'll send you a copy of your results.",
    introText: '',
    introButtonText: 'Continue',
    questions: [
      { questionRef: 'user_email', displayType: 'email-input', required: true },
      { questionRef: 'user_name', displayType: 'name-input', required: true },
    ],
  },
  {
    key: 'open-ended',
    order: 11,
    title: "You're almost finished.",
    subtitle: 'Tell me more about this entrepreneurial dream of yours.',
    introText: '',
    introButtonText: 'Final Two Questions',
    questions: [
      { questionRef: 'open_business_dream', displayType: 'free-text', description: 'Write down whatever thoughts immediately come to mind.' },
      { questionRef: 'open_impact_life', displayType: 'free-text', description: 'Write down whatever thoughts immediately come to mind.' },
    ],
  },
];

const formResultsPage: FormResultsConfig = {
  headingHtml: '<p><em>Congratulations! Your assessment is complete.</em></p>',
  bodyHtml: '<p><em>Learn more about your entrepreneur personality.</em></p>',
  buttonText: 'My Report',
  buttonUrlTemplate: '/report?email={email}',
};

async function main() {
  console.log('Seeding database...');

  // Upsert ScoringConfig
  await prisma.scoringConfig.upsert({
    where: { id: 'default' },
    update: {
      riskQuestions: JSON.parse(JSON.stringify(riskQuestions)),
      rewardQuestions: JSON.parse(JSON.stringify(rewardQuestions)),
      fourTypesQuestions: JSON.parse(JSON.stringify(fourTypesQuestions)),
      tieBreakerConfig: JSON.parse(JSON.stringify(tieBreakerConfig)),
      riskThresholds: JSON.parse(JSON.stringify(riskThresholds)),
      rewardThresholds: JSON.parse(JSON.stringify(rewardThresholds)),
      surveyQuestions: JSON.parse(JSON.stringify(surveyQuestions)),
    },
    create: {
      id: 'default',
      riskQuestions: JSON.parse(JSON.stringify(riskQuestions)),
      rewardQuestions: JSON.parse(JSON.stringify(rewardQuestions)),
      fourTypesQuestions: JSON.parse(JSON.stringify(fourTypesQuestions)),
      tieBreakerConfig: JSON.parse(JSON.stringify(tieBreakerConfig)),
      riskThresholds: JSON.parse(JSON.stringify(riskThresholds)),
      rewardThresholds: JSON.parse(JSON.stringify(rewardThresholds)),
      surveyQuestions: JSON.parse(JSON.stringify(surveyQuestions)),
    },
  });
  console.log('  ScoringConfig seeded');

  // Seed AnimalTypeContent
  for (const a of animalContent) {
    await prisma.animalTypeContent.upsert({
      where: { key: a.key },
      update: { title: a.title, description: a.description, traits: a.traits },
      create: a,
    });
  }
  console.log('  AnimalTypeContent seeded');

  // Seed RiskLevelContent
  for (const r of riskLevelContent) {
    await prisma.riskLevelContent.upsert({
      where: { key: r.key },
      update: { title: r.title, description: r.description },
      create: r,
    });
  }
  console.log('  RiskLevelContent seeded');

  // Seed RewardLevelContent
  for (const r of rewardLevelContent) {
    await prisma.rewardLevelContent.upsert({
      where: { key: r.key },
      update: { title: r.title, description: r.description },
      create: r,
    });
  }
  console.log('  RewardLevelContent seeded');

  // Seed DriverContent
  for (const d of driverContent) {
    await prisma.driverContent.upsert({
      where: { key: d.key },
      update: { title: d.title, description: d.description, questions: d.questions },
      create: d,
    });
  }
  console.log('  DriverContent seeded');

  // Seed AOIContent
  for (const a of aoiContent) {
    await prisma.aOIContent.upsert({
      where: { key: a.key },
      update: { title: a.title, description: a.description, businesses: a.businesses },
      create: a,
    });
  }
  console.log('  AOIContent seeded');

  // Seed StrategyContent
  for (const s of strategyContent) {
    await prisma.strategyContent.upsert({
      where: { key: s.key },
      update: { title: s.title, description: s.description, actions: s.actions },
      create: s,
    });
  }
  console.log('  StrategyContent seeded');

  // Seed FormConfig
  await prisma.formConfig.upsert({
    where: { id: 'default' },
    update: {
      sections: JSON.parse(JSON.stringify(formSections)),
      resultsPage: JSON.parse(JSON.stringify(formResultsPage)),
      backgroundImage: '/icons/form/background.jpg',
      isLive: false,
    },
    create: {
      id: 'default',
      sections: JSON.parse(JSON.stringify(formSections)),
      resultsPage: JSON.parse(JSON.stringify(formResultsPage)),
      backgroundImage: '/icons/form/background.jpg',
      isLive: false,
    },
  });
  console.log('  FormConfig seeded');

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
