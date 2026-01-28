import { NextResponse } from 'next/server';
import { getFormConfig } from '@/lib/form-config-loader';
import { getScoringConfig } from '@/lib/scoring-config-loader';
import type {
  HydratedFormQuestion,
  HydratedSection,
  HydratedFormConfig,
  FormSectionConfig,
  FormQuestionConfig,
} from '@/types/form-config';
import type { ScoringConfigData, RiskRewardQuestion, NonScoredQuestion } from '@/types/scoring';

// Form-only question definitions
interface FormOnlyDef {
  text: string;
  source: 'form-only';
}

const FORM_ONLY_QUESTIONS: Record<string, FormOnlyDef> = {
  user_name: { text: 'What is your first and last name?', source: 'form-only' },
  user_email: { text: 'What is your email address?', source: 'form-only' },
  select_driver: {
    text: 'What is driving you to think about becoming an entrepreneur?\n\nThis is a tough one! Take your time answering.',
    source: 'form-only',
  },
  select_aoi1: {
    text: 'Regardless of what you\'ve done in the past, which ONE field interests you the most when it comes to entrepreneurship?\n\nThis is a tough one! Take your time answering.\n\nDon\'t worry about your skill set. Respond based on your interest level.',
    source: 'form-only',
  },
  select_aoi2: {
    text: 'What is your SECOND choice area of interest for entrepreneurship?\n\nDon\'t worry about your skill set. Respond based on your interest level.',
    source: 'form-only',
  },
  select_strategy: {
    text: 'Which business path sounds most like you?\n\nThink about what feels natural to you. There\'s no wrong answer.',
    source: 'form-only',
  },
};

// Options for driver/AOI/strategy selection questions
const DRIVER_OPTIONS: Record<string, string> = {
  Boss: 'Be my own boss',
  Control: 'Control my time & schedule',
  Passion: 'Turn passion into income',
  Money: 'Earn more money',
  Solve: 'Solve a problem',
  Impact: 'Have a positive social impact',
  Legacy: 'Build a legacy',
};

const AOI_OPTIONS: Record<string, string> = {
  Arts: 'Arts & Culture (design, restoration, events, supplies)',
  Consulting: 'Consulting (accounting, law, business, personal)',
  Digital: 'Digital Services (graphic design, coding, website)',
  Education: 'Education (teaching, tutoring, test prep)',
  Hospitality: 'Food & Hospitality (restaurant, hotel, travel & leisure)',
  Health: 'Health (caregiving, personal training, medical)',
  Personal: 'Personal & Home (landscaping, pet care, salon)',
  Retail: 'Retail (clothes, ecommerce, physical & digital goods)',
  Social: 'Social (environmental, political, activism)',
  Tech: 'Technology (IT, software, SaaS, AI)',
  Trades: 'Trades (plumbing, HVAC, construction)',
};

const STRATEGY_OPTIONS: Record<string, string> = {
  Creator: 'Creator: Starting from scratch (new independent business you design, name, and build yourself).',
  Consolidator: 'Consolidator: Buying an existing business (acquire operations, customers, and systems already in place).',
  Franchisee: 'Franchisee: Buying into a franchise (operate under an established brand and playbook for fees/royalties).',
  Contractor: 'Contractor: Starting as a contractor/freelancer/consultant (sell your skills, maybe formalize into a firm later).',
};

function hydrateQuestion(
  qConfig: FormQuestionConfig,
  scoringConfig: ScoringConfigData
): HydratedFormQuestion {
  const ref = qConfig.questionRef;

  // Check form-only questions first
  if (FORM_ONLY_QUESTIONS[ref]) {
    const fo = FORM_ONLY_QUESTIONS[ref];
    const base: HydratedFormQuestion = {
      ...qConfig,
      text: fo.text,
      source: fo.source,
    };
    // Attach options for selection questions
    if (ref === 'select_driver') base.options = DRIVER_OPTIONS;
    if (ref === 'select_aoi1' || ref === 'select_aoi2') base.options = AOI_OPTIONS;
    if (ref === 'select_strategy') base.options = STRATEGY_OPTIONS;
    return base;
  }

  // Check risk questions
  const riskQ = scoringConfig.riskQuestions.find((q: RiskRewardQuestion) => q.ref === ref);
  if (riskQ) {
    return {
      ...qConfig,
      text: riskQ.text,
      optionLabels: riskQ.optionLabels,
      source: 'risk',
    };
  }

  // Check reward questions
  const rewardQ = scoringConfig.rewardQuestions.find((q: RiskRewardQuestion) => q.ref === ref);
  if (rewardQ) {
    return {
      ...qConfig,
      text: rewardQ.text,
      optionLabels: rewardQ.optionLabels,
      source: 'reward',
    };
  }

  // Check four-types questions
  const fourTypesQ = scoringConfig.fourTypesQuestions.find((q) => q.ref === ref);
  if (fourTypesQ) {
    return {
      ...qConfig,
      text: fourTypesQ.text,
      optionLabels: fourTypesQ.optionLabels,
      source: 'fourTypes',
    };
  }

  // Check tie-breaker
  if (ref === scoringConfig.tieBreakerConfig.ref) {
    return {
      ...qConfig,
      text: scoringConfig.tieBreakerConfig.text,
      optionLabels: scoringConfig.tieBreakerConfig.optionLabels,
      source: 'tieBreaker',
    };
  }

  // Check survey questions (non-scored)
  if (scoringConfig.surveyQuestions) {
    for (const category of Object.values(scoringConfig.surveyQuestions)) {
      const surveyQ = category.questions.find((q: NonScoredQuestion) => q.ref === ref);
      if (surveyQ) {
        return {
          ...qConfig,
          text: surveyQ.text,
          options: surveyQ.options,
          source: 'survey',
        };
      }
    }
  }

  // Fallback: unknown ref
  return {
    ...qConfig,
    text: `Question: ${ref}`,
    source: 'form-only',
  };
}

export async function GET() {
  try {
    const [formConfig, scoringConfig] = await Promise.all([
      getFormConfig(),
      getScoringConfig(),
    ]);

    if (!formConfig) {
      return NextResponse.json(
        { error: 'Form configuration not found' },
        { status: 404 }
      );
    }

    if (!scoringConfig) {
      return NextResponse.json(
        { error: 'Scoring configuration not found' },
        { status: 500 }
      );
    }

    const hydratedSections: HydratedSection[] = formConfig.sections
      .sort((a: FormSectionConfig, b: FormSectionConfig) => a.order - b.order)
      .map((section: FormSectionConfig) => ({
        key: section.key,
        order: section.order,
        title: section.title,
        subtitle: section.subtitle,
        introText: section.introText,
        introButtonText: section.introButtonText,
        questions: section.questions.map((q: FormQuestionConfig) =>
          hydrateQuestion(q, scoringConfig)
        ),
      }));

    const response: HydratedFormConfig = {
      sections: hydratedSections,
      resultsPage: formConfig.resultsPage,
      backgroundImage: formConfig.backgroundImage,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error loading form config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
