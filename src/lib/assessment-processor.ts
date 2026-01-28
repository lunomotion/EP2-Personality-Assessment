// Assessment Processing Logic
// Ported from ep2_code_node.js for Next.js

import type { ReportData, AnimalType, RiskLevel, RewardLevel, DriverType, AOIType, StrategyType } from '@/types/report';

// Animal Types with descriptions (from ep2_code_node.js reference)
const ANIMAL_TYPES: Record<string, { title: string; text: string; traits: string[] }> = {
  'African Dog': {
    title: 'The Steady Strategist',
    text: 'Collaborative, consistent, and dependable, the African Dog thrives in teamwork and structured environments. They prefer steady growth over risky leaps, building trust-based ventures that endure through integrity and discipline.',
    traits: ['calculated', 'control', 'steady', 'shared']
  },
  'Killer Whale': {
    title: 'The Steady Strategist',
    text: 'Intelligent, patient, and precise, the Killer Whale plays the long game. They succeed through planning, partnerships, and well-timed decisions, turning strategy into lasting success and influence.',
    traits: ['intelligent', 'patient', 'precise', 'strategic']
  },
  'Lion': {
    title: 'The Ambitious Climber',
    text: 'Confident and courageous, the Lion blends bold action with thoughtful control. They pursue goals with discipline and heart, steadily growing their ventures through persistence and purpose.',
    traits: ['confident', 'courageous', 'disciplined', 'purposeful']
  },
  'Tiger': {
    title: 'The Fearless Pursuer',
    text: 'Driven, daring, and instinctive, the Tiger thrives on high stakes and fast movement. They chase bold ideas, take decisive risks, and transform ambition into powerful momentum and visible results.',
    traits: ['driven', 'daring', 'instinctive', 'bold']
  }
};

// Risk levels (from ep2_code_node.js reference)
const RISK_LEVELS: Record<string, { category: string; text: string }> = {
  'Low': {
    category: 'Low Risk',
    text: 'A low level of risk appetite reflects a preference for stability, predictability, and security. Individuals with this mindset make decisions carefully, prioritizing preparation and consistency over rapid change. They excel at building steady, reliable businesses where planning and control minimize uncertainty.'
  },
  'Medium': {
    category: 'Medium Risk',
    text: 'A medium level of risk appetite reflects a balanced approach to decision-making. Individuals with this mindset take calculated risks, weighing potential gains against possible losses before acting. They are confident enough to pursue new opportunities but grounded enough to ensure there\'s a solid plan behind every move.'
  },
  'High': {
    category: 'High Risk',
    text: 'A high level of risk appetite reflects bold confidence and a strong tolerance for uncertainty. Individuals with this trait are energized by challenges and see potential where others see danger, often viewing setbacks as learning opportunities. They move decisively, willing to bet on their instincts and embrace change as a path to big rewards.'
  }
};

// Reward levels (from ep2_code_node.js reference)
const REWARD_LEVELS: Record<string, { category: string; text: string }> = {
  'Low': {
    category: 'Low Reward',
    text: 'A low level of reward drive reflects a preference for shared success and collective achievement over personal gain. Individuals with this mindset are motivated by teamwork, collaboration, and contributing to a group\'s long-term stability. They find fulfillment in seeing others grow and succeed alongside them, valuing community wins over individual recognition.'
  },
  'Medium': {
    category: 'Medium Reward',
    text: 'A medium level of reward drive reflects a balanced motivation between personal achievement and shared success. Individuals with this mindset strive for recognition and progress but also value collaboration and collective growth. They enjoy achieving their own goals while contributing to a team\'s overall accomplishments.'
  },
  'High': {
    category: 'High Reward',
    text: 'A high level of reward drive reflects strong motivation for achievement, recognition, and tangible success. Individuals with this mindset are goal-oriented, ambitious, and inspired by results that demonstrate progress and impact. They measure success through growth, performance, and the rewards that come from winning big.'
  }
};

// Drivers (from ep2_code_node.js reference)
const DRIVERS: Record<string, { title: string; description: string; questions: string[] }> = {
  'Boss': {
    title: 'Be My Own Boss',
    description: 'You are driven by independence and decision-making power as a future entrepreneur. You want to call the shots, set the direction, and build something that reflects your ideas, values, and standards.',
    questions: [
      'Which industries or niches interest you that would let you operate mostly on your own terms (for example, solo consulting, creative services, coaching, or a small product brand)?',
      'Do you picture yourself working mainly one-on-one with clients, selling to many customers online, or leading a small team, and which business types match that picture?',
      'When you imagine being "the boss," what kind of business setting do you see around you: local and in-person, fully online, or a mix of both?'
    ]
  },
  'Control': {
    title: 'Control My Time & Schedule',
    description: 'You are motivated by flexibility and control over your time and routine. You want a business that supports your lifestyle, energy, and responsibilities, not one that traps you in a new version of a 9-to-5.',
    questions: [
      'Which business ideas could realistically be run from anywhere with a laptop, like digital services, online education, or content creation?',
      'Are you more drawn to project-based work (freelancing, consulting) or ongoing income models (memberships, subscriptions, retainers) that give more predictability to your schedule?',
      'Do you want a business that can stay small and flexible, or eventually grow into something bigger with a team, and which ideas match that vision?'
    ]
  },
  'Passion': {
    title: 'Turn Passion Into Income',
    description: 'You are driven by the desire to earn money doing something you genuinely enjoy or care about. You want your business to reflect your interests, talents, or hobbies so your work feels personally meaningful.',
    questions: [
      'Which passions could realistically connect to an existing industry, such as arts and culture, education, health, or digital services?',
      'Do your interests fit better with selling services (teaching, coaching, creating) or selling products (physical goods, digital products, art, or tools)?',
      'When you imagine "doing what you love" as a business, do you see yourself working with people directly, working behind the scenes, or creating things that reach people at scale?'
    ]
  },
  'Money': {
    title: 'Earn More Money',
    description: 'You are strongly motivated by increasing your income and building financial freedom. You want a business that has clear earning potential and room to grow over time.',
    questions: [
      'Which business models in your areas of interest naturally allow for higher income, such as high-ticket services, scalable digital products, or tech and consulting?',
      'Are you more drawn to businesses that sell to individuals (B2C) or organizations (B2B), and which one seems more likely to reach your income goals?',
      'Which industries are growing or in high demand right now that also match your skills or interests, such as technology, education, health, or digital services?'
    ]
  },
  'Solve': {
    title: 'Solve a Problem',
    description: 'You are motivated by fixing something that feels broken or inefficient. You want your business to exist for a clear purpose: to make life easier, faster, cheaper, or better for specific people.',
    questions: [
      'Which problems have you personally experienced in areas like education, health, technology, or everyday life that could be turned into a service or product?',
      'Do you see yourself solving problems for individuals (for example, tutoring, coaching, personal services) or for organizations (for example, consulting, software, training)?',
      'Which business areas seem to have a lot of frustrated people but not many good solutions yet, and could you see yourself stepping into that gap?'
    ]
  },
  'Impact': {
    title: 'Have a Positive Social Impact',
    description: 'You are driven by the desire to create change and help people, communities, or causes. You want your business to line up with your values and make a meaningful difference.',
    questions: [
      'Which issue areas matter most to you, such as environment, youth, justice, health, or community development, and what types of businesses already exist in those spaces?',
      'Does your impact vision fit better with a social enterprise, a mission-driven service (like coaching or education), or an advocacy-focused venture (events, media, campaigns)?',
      'Which kinds of customers or communities do you feel most called to serve, and what kinds of services or products could genuinely help them?'
    ]
  },
  'Legacy': {
    title: 'Build a Legacy',
    description: 'You are motivated by creating something that lasts beyond you. You want a business that can grow, be remembered, or even be passed on to others over time.',
    questions: [
      'Which business ideas could realistically be built into a brand, agency, firm, or organization that continues without you doing every task yourself?',
      'Do you imagine your legacy being tied to a specific community, industry, or cause, and which types of businesses live long in those spaces (for example, schools, firms, product brands, or foundations)?',
      'When you picture your business 10-20 years from now, is it a name people recognize, a system others use, or a place people rely on, and which ideas you have today match that picture?'
    ]
  }
};

// Areas of Interest (from ep2_code_node.js reference)
const AOIS: Record<string, { title: string; description: string; businesses: string[] }> = {
  'Arts': {
    title: 'Arts & Culture',
    description: 'You are drawn to creativity, expression, and preserving or elevating culture through your work. You thrive in businesses where aesthetics, storytelling, and community experiences matter.',
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
      'Creative workshop or retreat facilitator'
    ]
  },
  'Consulting': {
    title: 'Consulting',
    description: 'You like solving problems, offering expert advice, and helping others make better decisions. You thrive in roles where your knowledge, experience, and strategic thinking drive results.',
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
      'IT or digital transformation consulting'
    ]
  },
  'Digital': {
    title: 'Digital Services',
    description: 'You enjoy working online, creating digital assets, and providing services that help others show up better on the internet. You thrive in remote-friendly, scalable businesses.',
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
      'Online course or digital product creation services'
    ]
  },
  'Education': {
    title: 'Education',
    description: 'You are motivated by teaching, mentoring, and helping others learn and grow. You thrive in businesses that focus on instruction, guidance, and knowledge-sharing.',
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
      'Educational content creation (books, videos, lesson plans)'
    ]
  },
  'Hospitality': {
    title: 'Food & Hospitality',
    description: 'You enjoy serving others, creating experiences, and bringing people together around food, travel, or comfort. You thrive in businesses where service, ambiance, and customer experience are central.',
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
      'Short-term rental or Airbnb management'
    ]
  },
  'Health': {
    title: 'Health',
    description: 'You care about wellbeing, vitality, and helping people feel or live better. You thrive in businesses centered on care, support, and personal transformation.',
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
      'Online health and wellness content or membership'
    ]
  },
  'Personal': {
    title: 'Personal & Home',
    description: 'You like helping individuals and families improve their daily lives, surroundings, or routines. You thrive in service-based businesses that offer convenience, comfort, or lifestyle upgrades.',
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
      'Moving, packing, or downsizing support'
    ]
  },
  'Retail': {
    title: 'Retail',
    description: 'You are drawn to products, merchandising, and connecting people with things they love or need. You thrive in businesses that involve curation, branding, and customer experience.',
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
      'Marketplace seller (Etsy, Amazon, etc.)'
    ]
  },
  'Social': {
    title: 'Social',
    description: 'You are motivated by impact, justice, and improving communities or the world. You thrive in mission-driven ventures that align business with values and change-making.',
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
      'Impact-focused membership or advocacy platform'
    ]
  },
  'Tech': {
    title: 'Technology',
    description: 'You enjoy solving problems with tools, systems, and innovation. You thrive in businesses that involve building, improving, or supporting technology.',
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
      'Hardware, device, or tech accessory business'
    ]
  },
  'Trades': {
    title: 'Trades',
    description: 'You are drawn to hands-on, skilled work that builds and maintains the physical world. You thrive in businesses where craftsmanship, reliability, and practical expertise are valued.',
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
      'Appliance repair services'
    ]
  }
};

// Business Strategies (from ep2_code_node.js reference)
const STRATEGIES: Record<string, { title: string; description: string; actions: string[] }> = {
  'Creator': {
    title: 'Creator',
    description: 'You\'re drawn to designing something of your own from the ground up. Starting from scratch gives you full control over the idea, brand, and systems, but it also means you carry the most responsibility for testing, refining, and building momentum from zero.',
    actions: [
      'Brainstorm three simple business ideas you could start with your current skills and write one sentence for who each one would serve.',
      'Pick one idea and outline a "starter version" you could launch in the next 30 days, such as a single service, basic offer, or minimum product.',
      'Make a short list of 5-10 people, communities, or online spaces where you can share this idea to get feedback or your first interested customers.'
    ]
  },
  'Consolidator': {
    title: 'Consolidator',
    description: 'You like the idea of stepping into something that already has motion behind it. Buying an existing business lets you start with customers, systems, and revenue in place, while your role becomes improving, stabilizing, or growing what is already there.',
    actions: [
      'Choose 2-3 industries you understand or are curious about and start looking at example businesses for sale to see what is possible.',
      'Draft a simple checklist of what you would want to learn before buying any business, such as revenue, expenses, customer base, and daily workload.',
      'Talk with at least one current small business owner about what they wish they had known before buying or starting their business.'
    ]
  },
  'Franchisee': {
    title: 'Franchisee',
    description: 'You are attracted to a clear system and recognizable brand rather than building everything from scratch. Buying into a franchise lets you follow a proven playbook with support, while trading some creative freedom for structure and guidance.',
    actions: [
      'Make a shortlist of franchise industries that interest you, such as food, fitness, or services, and note what appeals to you about each.',
      'Compare a few franchise options by looking at startup costs, support offered, and day-to-day responsibilities to see what fits your reality.',
      'Arrange a conversation with a current franchise owner to ask about their experience, including what has been easier and harder than expected.'
    ]
  },
  'Contractor': {
    title: 'Contractor',
    description: 'You want to start simple by getting paid directly for skills you already have. Beginning as a contractor, freelancer, or consultant lets you move quickly, test what people will pay for, and decide later if you want to grow into a larger company.',
    actions: [
      'Write down the top skills or experiences people already come to you for, and turn one into a clear paid service with a result and a price.',
      'Create a basic overview page or one-pager that explains who you help, what you do, and how someone can contact or book you.',
      'Reach out personally to a handful of people or organizations who might need this service and offer a limited "pilot" or trial version.'
    ]
  }
};

// Driver mappings from Typeform answers
const DRIVER_MAPPINGS: Record<string, DriverType> = {
  'Be my own boss': 'Boss',
  'Control my time & schedule': 'Control',
  'Turn passion into income': 'Passion',
  'Earn more money': 'Money',
  'Solve a problem': 'Solve',
  'Have a positive social impact': 'Impact',
  'Build a legacy': 'Legacy'
};

// AOI mappings
const AOI_MAPPINGS: Record<string, AOIType> = {
  'Arts': 'Arts',
  'Consulting': 'Consulting',
  'Digital': 'Digital',
  'Education': 'Education',
  'Hospitality': 'Hospitality',
  'Health': 'Health',
  'Personal': 'Personal',
  'Retail': 'Retail',
  'Social': 'Social',
  'Tech': 'Tech',
  'Trades': 'Trades'
};

// Strategy mappings
const STRATEGY_MAPPINGS: Record<string, StrategyType> = {
  'Creator': 'Creator',
  'Consolidator': 'Consolidator',
  'Franchisee': 'Franchisee',
  'Contractor': 'Contractor'
};

// Determine animal type from Risk/Reward scores
function determineAnimalType(riskScore: number, rewardScore: number): AnimalType {
  if (riskScore <= 20 && rewardScore <= 20) {
    return 'African Dog';
  } else if (riskScore <= 20 && rewardScore >= 40) {
    return 'Killer Whale';
  } else if (riskScore >= 40 && rewardScore >= 40) {
    return 'Tiger';
  } else {
    return 'Lion';
  }
}

// Get risk level from score
function getRiskLevel(score: number): RiskLevel {
  if (score <= 20) return 'Low';
  if (score <= 39) return 'Medium';
  return 'High';
}

// Get reward level from score
function getRewardLevel(score: number): RewardLevel {
  if (score <= 20) return 'Low';
  if (score <= 39) return 'Medium';
  return 'High';
}

// Helper to get variable from Typeform variables array
function getVariable(variables: Array<{ key: string; type: string; number?: number; text?: string }>, key: string): number | string | null {
  const variable = variables.find(v => v.key === key);
  if (!variable) return null;
  if (variable.type === 'number') return variable.number ?? null;
  if (variable.type === 'text') return variable.text ?? null;
  return null;
}

// Extract email from answers or hidden fields
function getEmailFromAnswers(
  answers: Array<{ email?: string; type?: string; text?: string }>,
  hidden?: Record<string, string>
): string {
  // Check answers for email type field
  const emailAnswer = answers.find(a => a.email || a.type === 'email');
  if (emailAnswer?.email) return emailAnswer.email;

  // Check hidden fields for email
  if (hidden?.email) return hidden.email;

  // Check for any text answer that looks like an email
  const textWithEmail = answers.find(a => a.text && a.text.includes('@'));
  if (textWithEmail?.text) return textWithEmail.text;

  return '';
}

// Extract animal type from definition.endings by matching the ending id/ref
// The ending at form_response root contains the id, and definition.endings has the title
function extractAnimalFromEnding(
  ending?: { id: string; ref?: string },
  definition?: { endings?: Array<{ id: string; ref?: string; title: string }> }
): AnimalType | null {
  if (!ending || !definition?.endings) return null;

  // Find the ending that matches the id or ref
  const endingDetails = definition.endings.find(e =>
    e.id === ending.id || (ending.ref && e.ref === ending.ref)
  );

  if (!endingDetails?.title) return null;

  const title = endingDetails.title.toLowerCase();
  if (title.includes('wolf') || title.includes('african dog')) return 'African Dog';
  if (title.includes('whale') || title.includes('killer whale')) return 'Killer Whale';
  if (title.includes('lion')) return 'Lion';
  if (title.includes('tiger')) return 'Tiger';
  return null;
}

// Process Typeform webhook data into ReportData
export function processTypeformData(webhookData: {
  form_response: {
    variables?: Array<{ key: string; type: string; number?: number; text?: string }>;
    answers?: Array<{ email?: string; type?: string; text?: string; choice?: { label: string }; field?: { ref: string } }>;
    hidden?: Record<string, string>;
    ending?: { id: string; ref?: string };
    definition?: { endings?: Array<{ id: string; ref?: string; title: string }> };
  };
}): ReportData {
  const formResponse = webhookData.form_response;
  const variables = formResponse.variables || [];
  const answers = formResponse.answers || [];
  const hidden = formResponse.hidden;

  // Get scores from Typeform variables
  const riskScore = (getVariable(variables, 'risk') as number) || 25;
  const rewardScore = (getVariable(variables, 'reward') as number) || 25;

  // Determine animal type - extract from definition.endings, fallback to risk/reward calculation
  const animalType: AnimalType = extractAnimalFromEnding(formResponse.ending, formResponse.definition)
    ?? determineAnimalType(riskScore, rewardScore);

  const animal = ANIMAL_TYPES[animalType];

  // Get risk/reward levels
  const riskLevel = getRiskLevel(riskScore);
  const rewardLevel = getRewardLevel(rewardScore);

  // Get driver from variables
  const driverVars = ['boss', 'control', 'passion', 'money', 'solve', 'impact', 'legacy'] as const;
  let driverKey: DriverType = 'Money';
  for (const dv of driverVars) {
    if (getVariable(variables, dv) === 1) {
      driverKey = (dv.charAt(0).toUpperCase() + dv.slice(1)) as DriverType;
      break;
    }
  }

  // Get AOIs from variables
  const aoiVars = ['arts', 'consult', 'digital', 'educate', 'hospitality', 'health', 'personal', 'retail', 'social', 'tech', 'trade'] as const;
  const aoiKeyMap: Record<string, AOIType> = {
    'arts': 'Arts', 'consult': 'Consulting', 'digital': 'Digital', 'educate': 'Education',
    'hospitality': 'Hospitality', 'health': 'Health', 'personal': 'Personal',
    'retail': 'Retail', 'social': 'Social', 'tech': 'Tech', 'trade': 'Trades'
  };
  const selectedAOIs: AOIType[] = [];
  for (const av of aoiVars) {
    if (getVariable(variables, av) === 1) {
      selectedAOIs.push(aoiKeyMap[av]);
    }
  }
  const aoi1Key: AOIType = selectedAOIs[0] || 'Digital';
  const aoi2Key: AOIType = selectedAOIs[1] || (selectedAOIs[0] !== 'Consulting' ? 'Consulting' : 'Digital');

  // Get strategy from variables
  const strategyVars = ['creator', 'consolidator', 'franchisee', 'contractor'] as const;
  const strategyKeyMap: Record<string, StrategyType> = {
    'creator': 'Creator', 'consolidator': 'Consolidator',
    'franchisee': 'Franchisee', 'contractor': 'Contractor'
  };
  let strategyKey: StrategyType = 'Creator';
  for (const sv of strategyVars) {
    if (getVariable(variables, sv) === 1) {
      strategyKey = strategyKeyMap[sv];
      break;
    }
  }

  // Get email from answers or hidden fields
  const email = getEmailFromAnswers(answers, hidden);
  const name = email ? email.split('@')[0] : 'Participant';

  // Build report data
  return {
    name,
    email,
    reportDate: new Date().toLocaleDateString(),

    animalType,
    personalityTitle: animal.title,
    personalityText: animal.text,
    traits: animal.traits,

    riskLevel,
    riskScore,
    riskCategory: RISK_LEVELS[riskLevel].category,
    riskText: RISK_LEVELS[riskLevel].text,

    rewardLevel,
    rewardScore,
    rewardCategory: REWARD_LEVELS[rewardLevel].category,
    rewardText: REWARD_LEVELS[rewardLevel].text,

    driverKey,
    driverTitle: DRIVERS[driverKey].title,
    driverDescription: DRIVERS[driverKey].description,
    driverQuestions: DRIVERS[driverKey].questions,

    aoi1Key,
    aoi1Title: AOIS[aoi1Key].title,
    aoi1Description: AOIS[aoi1Key].description,
    aoi1Businesses: AOIS[aoi1Key].businesses,

    aoi2Key,
    aoi2Title: AOIS[aoi2Key].title,
    aoi2Description: AOIS[aoi2Key].description,
    aoi2Businesses: AOIS[aoi2Key].businesses,

    strategyKey,
    strategyTitle: STRATEGIES[strategyKey].title,
    strategyDescription: STRATEGIES[strategyKey].description,
    strategyActions: STRATEGIES[strategyKey].actions,
  };
}
