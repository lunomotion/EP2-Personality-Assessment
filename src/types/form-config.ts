// Form configuration types for the native assessment form

export type FormDisplayType =
  | 'image-choice'     // binary with circular images per option
  | 'likert-boxes'     // numbered 1-5 rectangular buttons
  | 'star-rating'      // 1-5 star icons
  | 'multiple-choice'  // A/B/C/D text options
  | 'table-choice'     // rich text + table + row options (tie-breaker)
  | 'matrix'           // rows x columns radio grid
  | 'rank-order'       // drag-to-reorder
  | 'email-input'
  | 'name-input'
  | 'free-text'
  | 'multi-option';

export interface FormQuestionConfig {
  questionRef: string;           // must match a ref in ScoringConfig or be a form-only ref
  displayType: FormDisplayType;
  description?: string;          // subtitle below question text
  questionImage?: string;        // image URL shown above question
  optionImages?: Record<string, string>; // key=option key, value=image URL
  matrixColumns?: string[];      // for matrix: column headers
  matrixRows?: string[];         // for matrix: row labels
  required?: boolean;
}

export interface FormSectionConfig {
  key: string;
  order: number;
  title: string;
  subtitle?: string;
  introText?: string;
  introButtonText: string;
  questions: FormQuestionConfig[];
}

export interface FormResultsConfig {
  headingHtml: string;
  bodyHtml: string;
  buttonText: string;
  buttonUrlTemplate: string;   // e.g. "/report?email={email}"
}

export interface FormConfigData {
  sections: FormSectionConfig[];
  resultsPage: FormResultsConfig;
  backgroundImage?: string;
  isLive: boolean;
}

// Hydrated question type returned from /api/assessment/config
export interface HydratedFormQuestion {
  // From FormQuestionConfig
  questionRef: string;
  displayType: FormDisplayType;
  description?: string;
  questionImage?: string;
  optionImages?: Record<string, string>;
  matrixColumns?: string[];
  matrixRows?: string[];
  required?: boolean;
  // Merged from ScoringConfig
  text: string;
  optionLabels?: Record<string, string>;
  options?: Record<string, string>;
  // Source metadata
  source: 'risk' | 'reward' | 'fourTypes' | 'tieBreaker' | 'survey' | 'form-only';
}

export interface HydratedSection {
  key: string;
  order: number;
  title: string;
  subtitle?: string;
  introText?: string;
  introButtonText: string;
  questions: HydratedFormQuestion[];
}

export interface HydratedFormConfig {
  sections: HydratedSection[];
  resultsPage: FormResultsConfig;
  backgroundImage?: string;
}
