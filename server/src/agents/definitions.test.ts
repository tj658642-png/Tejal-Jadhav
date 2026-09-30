import { describe, expect, it } from 'vitest';
import { routeAgents } from './definitions.js';

describe('routeAgents', () => {
  it('routes coding tasks to technical agents', () => {
    const agents = routeAgents('coding', false);
    expect(agents).toContain('technical');
    expect(agents).toContain('analyst');
  });

  it('includes vision for image tasks when hasVision', () => {
    const agents = routeAgents('image', true);
    expect(agents[0]).toBe('vision');
  });
});
