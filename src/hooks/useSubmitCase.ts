import { useState, useCallback } from 'react';
import { submitCaseForReview, getCaseById } from '../api/cases';
import { Case } from '../types/cases';

type SubmissionState = 'idle' | 'submitting' | 'success' | 'error';

interface UseSubmitCaseResult {
  state: SubmissionState;
  error: string | null;
  submittedCase: Case | null;
  submit: (caseId: string) => Promise<void>;
  retry: () => void;
  reset: () => void;
}

export function useSubmitCase(): UseSubmitCaseResult {
  const [state, setState] = useState<SubmissionState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [submittedCase, setSubmittedCase] = useState<Case | null>(null);
  const [lastCaseId, setLastCaseId] = useState<string | null>(null);

  const submit = useCallback(async (caseId: string) => {
    setLastCaseId(caseId);
    setState('submitting');
    setError(null);

    // Retry logic — attempt up to 3 times with exponential backoff
    const MAX_RETRIES = 3;
    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt < MAX_RETRIES) {
      try {
        await submitCaseForReview(caseId);

        // Fetch the updated case to confirm state change
        const updatedCase = await getCaseById(caseId);
        setSubmittedCase(updatedCase);
        setState('success');
        return;
      } catch (err: any) {
        lastError = err;
        attempt++;

        if (attempt < MAX_RETRIES) {
          // Exponential backoff: 500ms, 1000ms, 2000ms
          await new Promise((res) => setTimeout(res, 500 * Math.pow(2, attempt - 1)));
        }
      }
    }

    // All retries exhausted
    setError(
      lastError?.message ??
        'Submission failed after multiple attempts. Please check your connection and try again.'
    );
    setState('error');
  }, []);

  const retry = useCallback(() => {
    if (lastCaseId) submit(lastCaseId);
  }, [lastCaseId, submit]);

  const reset = useCallback(() => {
    setState('idle');
    setError(null);
    setSubmittedCase(null);
    setLastCaseId(null);
  }, []);

  return { state, error, submittedCase, submit, retry, reset };
}
