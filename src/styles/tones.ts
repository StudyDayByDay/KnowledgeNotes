import type { NodeKind } from '../data/types';

/** 语义色（与 tokens.css 的 --tone-* 一一对应） */
export const KIND_TONE: Record<NodeKind, string> = {
  period: 'var(--tone-time)',
  event: 'var(--tone-event)',
  battle: 'var(--tone-battle)',
  meeting: 'var(--tone-doc)',
  document: 'var(--tone-doc)',
  person: 'var(--tone-person)',
  theory: 'var(--tone-meaning)',
  concept: 'var(--tone-meaning)',
  confuse: 'var(--tone-confusion)',
};
