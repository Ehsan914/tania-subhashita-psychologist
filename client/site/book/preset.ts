// What the Book page starts with: ?service= and ?program= from the Therapies and
// Programs pages, or router state ({ serviceId, sessionType, message }) from older links.
import type { ProgramData, ServiceData } from '../../context/SiteDataContext';
import { serviceForProgram } from '../therapies/therapyData';

export interface BookingPreset {
  service: string;
  program: ProgramData | null;
  wantsFull: boolean;
  message: string;
}

const DEFAULT_SERVICE = 'psychotherapy';

const stateField = (state: unknown, key: string): string | undefined => {
  if (!state || typeof state !== 'object') return undefined;
  const value = (state as Record<string, unknown>)[key];
  return typeof value === 'string' ? value : undefined;
};

export function readPreset(
  params: URLSearchParams,
  state: unknown,
  services: ServiceData[],
  programs: ProgramData[],
): BookingPreset {
  const program = programs.find((p) => p.slug === params.get('program')) ?? null;
  const exists = (slug: string | null | undefined): slug is string => !!slug && services.some((s) => s.slug === slug);
  const candidates = [params.get('service'), program && serviceForProgram(program.slug), stateField(state, 'serviceId'), DEFAULT_SERVICE];

  return {
    service: candidates.find(exists) ?? services[0]?.slug ?? '',
    program,
    wantsFull: program !== null || stateField(state, 'sessionType') === 'full',
    message: program ? `I'd like to join the ${program.title} program.` : stateField(state, 'message') ?? '',
  };
}

export function programHint(program: ProgramData): string {
  const duration = program.duration.trim().toLowerCase();
  return `You're registering interest in the ${program.title} program${duration ? ` (${duration})` : ''}.`;
}
