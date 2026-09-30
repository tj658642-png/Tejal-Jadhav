import type { AgentName, JudgeResult, TaskType } from '../../types/analysis.js';

export interface DemoScenario {
  id: string;
  title: string;
  description: string;
  prompt: string;
  taskType: TaskType;
  agents: AgentName[];
  agentResponses: Record<string, string>;
  judge: JudgeResult;
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'college-electricity',
    title: 'College Electricity Optimization',
    description: 'Simulated multi-agent debate on reducing campus electricity use by 20%.',
    prompt: 'How can a college reduce electricity consumption by 20%?',
    taskType: 'business',
    agents: ['analyst', 'creative', 'critic', 'technical'],
    agentResponses: {
      analyst:
        'Break consumption into HVAC (~45%), lighting (~20%), labs/IT (~25%), and miscellaneous. Prioritize metering by building, peak-load scheduling, and baseline audits before investments.',
      creative:
        'Pilot student-led energy challenges, dynamic tariffs for labs, green roof insulation on older halls, and AI-based occupancy lighting in classrooms.',
      critic:
        'Behavior change fades without maintenance budgets. Old wiring may block smart controls. Verify savings claims with independent measurement—not vendor dashboards alone.',
      technical:
        'Deploy sub-metering, BACnet integration for HVAC, LED retrofits with daylight sensors, and server virtualization to cut IT load. Phase rollout starting with highest kWh/sqft buildings.',
    },
    judge: {
      summary:
        'A 20% reduction is feasible with metering, HVAC optimization, lighting retrofits, and IT efficiency, supported by governance and verified measurement.',
      consensus: [
        'Sub-metering and baselines are prerequisites',
        'HVAC and lighting offer the largest near-term gains',
        'Measurement and verification must be independent',
      ],
      disagreements: [
        'Creative favors gamification-first; Technical favors infrastructure-first sequencing',
        'Critic warns behavioral programs may underdeliver without capital for equipment',
      ],
      caveats: [
        'DEMO MODE — simulated agent outputs, not live API responses',
        'Actual savings depend on campus age, climate, and occupancy patterns',
        'Multi-model consensus does not guarantee correctness',
      ],
      nextSteps: [
        'Run a 30-day building-level audit',
        'Model ROI for LED + HVAC controls on top 3 buildings',
        'Establish a student-facilities energy task force with KPIs',
      ],
      confidence: 0.72,
      confidenceReason: 'Model-estimated confidence based on aligned themes with known energy-management practice.',
      sources: [
        { title: 'Campus energy benchmarking (general practice)', sourceType: 'reference' },
      ],
      agentAssessment: [
        { agent: 'analyst', assessment: 'Strong decomposition and prioritization' },
        { agent: 'creative', assessment: 'Useful engagement ideas; needs cost realism' },
        { agent: 'critic', assessment: 'Correctly highlights verification risks' },
        { agent: 'technical', assessment: 'Actionable engineering roadmap' },
      ],
    },
  },
  {
    id: 'scalable-chatbot',
    title: 'Scalable AI Chatbot Architecture',
    description: 'Simulated architecture council for a production chatbot.',
    prompt: 'How should we design a scalable AI chatbot?',
    taskType: 'technical',
    agents: ['technical', 'analyst', 'critic'],
    agentResponses: {
      technical:
        'Use an API gateway, stateless inference workers, vector store for RAG, queue for async jobs, and autoscaling GPU/CPU pools with circuit breakers per model provider.',
      analyst:
        'Define SLAs for latency vs quality tiers, separate sync chat from long-running tasks, and map data retention/compliance requirements early.',
      critic:
        'Watch for prompt-injection via retrieved docs, runaway token costs, and single-provider lock-in. Add eval harnesses before scaling traffic.',
    },
    judge: {
      summary:
        'Adopt a modular, stateless serving layer with RAG, queues for heavy work, strong observability, and provider abstraction with cost guards.',
      consensus: ['Stateless workers', 'RAG with governance', 'Provider failover', 'Cost and safety controls'],
      disagreements: ['Sync vs async UX trade-offs for long tasks'],
      caveats: ['DEMO MODE — simulated responses', 'Production needs threat modeling and load testing'],
      nextSteps: ['Define SLOs', 'Build eval set', 'Pilot dual-provider routing'],
      confidence: 0.68,
      confidenceReason: 'Model-estimated confidence; architecture themes align but context-specific constraints unknown.',
      sources: [],
      agentAssessment: [],
    },
  },
  {
    id: 'document-vision',
    title: 'Document / Image Analysis',
    description: 'Simulated multimodal review of a facilities diagram.',
    prompt: 'Review this facilities energy diagram and suggest improvements.',
    taskType: 'image',
    agents: ['vision', 'analyst', 'critic'],
    agentResponses: {
      vision:
        '[Simulated] Diagram shows main hall, annex, and central plant with color-coded high-load zones near the lab wing.',
      analyst:
        'Focus retrofit sequencing on lab wing and central plant interconnections; validate load assumptions with meter data.',
      critic:
        'Diagram may be outdated; confirm single-line electrical layout with facilities before procurement.',
    },
    judge: {
      summary: 'Treat the diagram as a hypothesis map—validate with live metering before major capex.',
      consensus: ['Lab wing likely high priority', 'Central plant upgrades need validation'],
      disagreements: ['Extent of annex contribution without meter proof'],
      caveats: ['DEMO MODE — no real image was processed'],
      nextSteps: ['Upload actual diagram in production mode with vision-enabled models'],
      confidence: 0.55,
      confidenceReason: 'Low confidence due to simulated vision input.',
      sources: [],
      agentAssessment: [],
    },
  },
];

export function getDemoScenario(id: string): DemoScenario | undefined {
  return DEMO_SCENARIOS.find((s) => s.id === id);
}
