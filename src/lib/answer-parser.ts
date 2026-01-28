// Source-agnostic answer normalization

interface TypeformAnswer {
  type?: string;
  text?: string;
  email?: string;
  boolean?: boolean;
  number?: number;
  choice?: { label: string; other?: string };
  choices?: { labels: string[] };
  field?: { ref: string; id: string };
}

interface TypeformWebhookPayload {
  form_response: {
    answers?: TypeformAnswer[];
    variables?: Array<{ key: string; type: string; number?: number; text?: string }>;
    hidden?: Record<string, string>;
    ending?: { id: string; ref?: string };
    definition?: {
      fields?: Array<{ id: string; ref: string; title: string; type: string }>;
      endings?: Array<{ id: string; ref?: string; title: string }>;
    };
  };
}

/**
 * Parse Typeform webhook answers into a normalized Map keyed by field ref.
 * Binary questions: maps to "A" or "B" based on choice label patterns.
 * Likert questions: maps to "1"-"5" number string.
 * Four-types: maps to "A", "B", "C", or "D".
 */
export function parseTypeformAnswers(
  webhookPayload: TypeformWebhookPayload
): Map<string, string | number> {
  const answers = new Map<string, string | number>();
  const formResponse = webhookPayload.form_response;
  const rawAnswers = formResponse.answers || [];

  for (const answer of rawAnswers) {
    const ref = answer.field?.ref;
    if (!ref) continue;

    switch (answer.type) {
      case 'choice': {
        const label = answer.choice?.label || '';
        answers.set(ref, label);
        break;
      }
      case 'number': {
        if (answer.number !== undefined) {
          answers.set(ref, answer.number);
        }
        break;
      }
      case 'text': {
        if (answer.text !== undefined) {
          answers.set(ref, answer.text);
        }
        break;
      }
      case 'email': {
        if (answer.email !== undefined) {
          answers.set(ref, answer.email);
        }
        break;
      }
      case 'boolean': {
        if (answer.boolean !== undefined) {
          answers.set(ref, answer.boolean ? 'B' : 'A');
        }
        break;
      }
      default: {
        // Store whatever we have
        if (answer.text) answers.set(ref, answer.text);
        else if (answer.choice?.label) answers.set(ref, answer.choice.label);
        break;
      }
    }
  }

  return answers;
}

/**
 * Parse custom form answers into normalized Map format.
 * Handles string, number, string[] (rank-order), and Record<string, string> (matrix) values.
 */
export function parseCustomFormAnswers(
  formData: Record<string, string | number | string[] | Record<string, string>>
): Map<string, string | number> {
  const result = new Map<string, string | number>();

  for (const [key, value] of Object.entries(formData)) {
    if (Array.isArray(value)) {
      // Rank-order: store as comma-separated string
      result.set(key, value.join(','));
    } else if (typeof value === 'object' && value !== null) {
      // Matrix: flatten { "row1": "col2", "row2": "col1" } into individual refs
      for (const [rowKey, colValue] of Object.entries(value)) {
        result.set(`${key}_${rowKey}`, colValue);
      }
    } else {
      result.set(key, value);
    }
  }

  return result;
}
