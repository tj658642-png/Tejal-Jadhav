import { describe, expect, it } from 'vitest';
import { compareAgentRuns } from './comparisonService.js';

describe('compareAgentRuns', () => {
  it('notes missing agents when some fail', () => {
    const result = compareAgentRuns([
      {
        id: '1',
        analysisId: 'a',
        agentName: 'analyst',
        provider: 'demo',
        model: 'x',
        status: 'success',
        response: 'measure audit',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        analysisId: 'a',
        agentName: 'critic',
        provider: 'demo',
        model: 'x',
        status: 'failed',
        createdAt: new Date().toISOString(),
      },
    ]);
    expect(result.missingInformation.length).toBeGreaterThan(0);
  });
});
