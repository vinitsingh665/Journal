import type { NormalizedExecution, DeduplicationResult } from "./types";

/**
 * Deduplicate executions against a set of existing fingerprints.
 * Uses the unique fingerprint hash to ensure idempotent imports.
 */
export function deduplicateExecutions(
  executions: NormalizedExecution[],
  existingFingerprints: Set<string>
): DeduplicationResult {
  const newExecutions: NormalizedExecution[] = [];
  const duplicates: NormalizedExecution[] = [];
  const seen = new Set<string>();

  for (const exec of executions) {
    if (existingFingerprints.has(exec.fingerprint) || seen.has(exec.fingerprint)) {
      duplicates.push(exec);
    } else {
      newExecutions.push(exec);
      seen.add(exec.fingerprint);
    }
  }

  return {
    newExecutions,
    duplicates,
    errors: [],
  };
}
