/**
 * The email check used by the site's public forms (contact, early access),
 * the same pattern as src/components/ContactForm.tsx.
 */
export const EMAIL_PATTERN =
  /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9-]*\.)+[A-Za-z]{2,}$/;
