export const SIFR_CANONICAL_URL = 'https://sifr-dev.vercel.app';
export const SIFR_GITHUB_OWNER = 'Sifr-Dev';
export const SIFR_GITHUB_URL = 'https://github.com/Sifr-Dev';
export const SIFR_LINKEDIN_URL = 'https://www.linkedin.com/in/mohamed-salahy';

const LEGACY_TO_CANONICAL_MAP: Record<string, string> = {
  go_db: 'mizan',
  churn_analytics_engine: 'logitrisk',
  task_manager_cli: 'lockstep',
  malloc_allocator: 'freelist',
  redis_clone: 'redwire',
  sysmon_daemon: 'procstatd',
  'sifr-ml-systems': 'subtorch',
  'sifr-native': 'Cipher',
  'sifr-apps': 'CipherDesk',
  'sifr-probe': 'wireprobe',
  'sifr-query': 'rowscan',
  'sifr-crypt': 'sha-zero',
  'sifr-md': 'glyphmd',
  'sifr-inflate': 'huffstream',
  'sifr-diff': 'hunkdiff',
  'sifr-serve': 'barehttp',
};

export function resolveCanonicalRepoId(rawId: string): string {
  const trimmed = rawId.trim();
  const mapped = LEGACY_TO_CANONICAL_MAP[trimmed.toLowerCase()];
  return mapped ?? trimmed;
}
