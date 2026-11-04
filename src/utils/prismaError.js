const UNIQUE_VIOLATION_CODE = 'P2002';

export function isUniqueViolation(error) {
  return error.code === UNIQUE_VIOLATION_CODE;
}
