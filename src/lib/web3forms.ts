/**
 * Web3Forms delivery shared by the contact form and the blog newsletter.
 * Submissions are emailed to the inbox tied to VITE_WEB3FORMS_ACCESS_KEY
 * (free key at https://web3forms.com), so no backend is needed.
 */

export const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY as
  | string
  | undefined;

/** Sends one submission; throws unless Web3Forms confirms it was accepted. */
export async function submitToWeb3Forms(
  fields: Record<string, string | boolean>
) {
  const res = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ access_key: WEB3FORMS_KEY, ...fields }),
  });
  const data = await res.json();
  if (data.success !== true) {
    throw new Error(data.message ?? "Submission failed");
  }
}
