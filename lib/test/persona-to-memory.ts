/**
 * Convert PersonaV3 brain seed → UserMemoryContext (in-memory · 不查 DB).
 * 给 brief pipeline 的 injectedMemory 用.
 */

import type { PersonaV3 } from './personas-v3';
import type {
  UserMemoryContext,
  MemoryCard,
  CoreState,
  OpenLoop,
} from '@/lib/memory/types';

export function personaToUserMemoryContext(persona: PersonaV3): UserMemoryContext {
  const now = Math.floor(Date.now() / 1000);

  const coreState: CoreState[] = persona.coreState.map((c, i) => ({
    id: -i - 1, // synthetic ID, 不冲突
    kind: c.kind,
    factText: c.factText,
    violationPattern: null,
    severity: c.severity ?? 'hard',
    status: 'active',
    source: 'user_self',
    createdAt: now - 30 * 86400,
  }));

  const cardsByType: Record<MemoryCard['cardType'], MemoryCard[]> = {
    factual: [],
    boundary: [],
    relational: [],
    episodic: [],
    psych_signal: [],
  };

  let cardIdCounter = -1;
  for (const seed of persona.brainSeed) {
    const card: MemoryCard = {
      id: cardIdCounter--,
      cardType: seed.type,
      title: seed.title,
      content: seed.content,
      confidence: seed.confidence,
      source: 'onboarding',
      sourceDecisionId: null,
      tags: [],
      lastVerifiedAt: now - 7 * 86400,
      createdAt: now - 30 * 86400,
    };
    cardsByType[seed.type].push(card);
  }

  const openLoops: OpenLoop[] = [];

  return {
    userId: -1,
    userUid: `synthetic-${persona.id}`,
    coreState,
    factual: cardsByType.factual,
    boundary: cardsByType.boundary,
    episodic: cardsByType.episodic,
    relational: cardsByType.relational,
    psychSignal: cardsByType.psych_signal,
    openLoops,
    brainContent: persona.baselineBrainSummary,
    stats: {
      totalCards: persona.brainSeed.length,
      totalDecisions: 0,
      accountAgeDays: 30,
    },
  };
}
