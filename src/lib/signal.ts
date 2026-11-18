export type SignalTopic =
  | 'Systems & Kernel Architecture'
  | 'ML & Triton GPU Compute'
  | 'Security & Post-Quantum Systems'
  | 'Full-Time / Founding Engineering';

export interface SignalPayload {
  senderName: string;
  senderEmail: string;
  topic: SignalTopic;
  message: string;
}

export interface SignalValidationResult {
  valid: boolean;
  error?: string;
}

export const SIFR_DIRECT_EMAIL = 'mohamedabdullahsalahy@proton.me';

export const SIGNAL_TOPICS: readonly SignalTopic[] = [
  'Systems & Kernel Architecture',
  'ML & Triton GPU Compute',
  'Security & Post-Quantum Systems',
  'Full-Time / Founding Engineering',
];

export function validateSignalPayload(payload: SignalPayload): SignalValidationResult {
  const name = payload.senderName.trim();
  const email = payload.senderEmail.trim();
  const message = payload.message.trim();

  if (name.length < 2) {
    return { valid: false, error: 'Enter your name or organization (min 2 chars).' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { valid: false, error: 'Enter a valid return email address.' };
  }
  if (message.length < 10) {
    return { valid: false, error: 'Signal payload must be at least 10 characters.' };
  }
  return { valid: true };
}

export function buildSignalMailto(payload: SignalPayload): string {
  const subject = encodeURIComponent(`[SIFR Signal] ${payload.topic} - ${payload.senderName.trim()}`);
  const body = encodeURIComponent(
    `From: ${payload.senderName.trim()} (${payload.senderEmail.trim()})\n` +
      `Scope: ${payload.topic}\n\n` +
      `${payload.message.trim()}\n\n` +
      `Sent from SIFR portfolio`
  );
  return `mailto:${SIFR_DIRECT_EMAIL}?subject=${subject}&body=${body}`;
}

export function generateDispatchReceiptId(payload: SignalPayload): string {
  const input = `${payload.senderEmail}|${payload.topic}|${payload.message.length}`;
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  const hex = (hash >>> 0).toString(16).toUpperCase().padStart(8, '0');
  return `SIFR-${hex}`;
}
