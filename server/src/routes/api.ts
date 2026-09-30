import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileTypeFromBuffer } from 'file-type';
import pdf from 'pdf-parse';
import { env } from '../config/env.js';
import { analyzeRequestSchema } from '../schemas/analyze.js';
import { allowDemoUser, AuthRequest, optionalAuth, requireAuth } from '../middleware/auth.js';
import { runAnalysis } from '../services/orchestrator/orchestrator.js';
import {
  deleteAnalysis,
  getAnalysis,
  getDashboardStats,
  getFinalResult,
  listAgentRuns,
  listHistory,
} from '../repositories/analysisRepository.js';
import { listAllModels } from '../providers/registry.js';
import { compareAgentRuns } from '../services/comparison/comparisonService.js';
import { DEMO_SCENARIOS } from '../services/demo/demoScenarios.js';
import { v4 as uuidv4 } from 'uuid';

const uploadDir = path.join(process.cwd(), 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (_req, file, cb) => cb(null, `${uuidv4()}-${file.originalname}`),
  }),
  limits: { fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024 },
});

const ALLOWED_EXT = new Set([
  '.pdf', '.png', '.jpg', '.jpeg', '.webp', '.txt', '.md', '.csv', '.json',
  '.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.go', '.rs', '.html', '.css',
]);

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'ai-council', ts: new Date().toISOString() });
});

apiRouter.get('/models', async (_req, res) => {
  const models = await listAllModels();
  res.json({ models });
});

apiRouter.get('/demo/scenarios', (_req, res) => {
  res.json({
    scenarios: DEMO_SCENARIOS.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      taskType: s.taskType,
    })),
  });
});

apiRouter.post('/analyze', optionalAuth, allowDemoUser, async (req: AuthRequest, res) => {
  const parsed = analyzeRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
  }
  const data = parsed.data;
  if (data.isDemo || data.demoScenarioId) {
    data.isDemo = true;
  }
  const result = await runAnalysis({
    userId: req.userId!,
    prompt: data.prompt,
    taskType: data.taskType,
    title: data.title,
    selectedAgents: data.selectedAgents,
    selectedModels: data.selectedModels,
    demoScenarioId: data.demoScenarioId,
    isDemo: data.isDemo,
    contextText: data.contextText,
  });
  res.status(202).json({ analysisId: result.analysisId, status: 'queued' });
});

function paramId(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

apiRouter.get('/analysis/:id', requireAuth, async (req: AuthRequest, res) => {
  const id = paramId(req.params.id);
  const analysis = await getAnalysis(id, req.userId!);
  if (!analysis) return res.status(404).json({ error: 'Not found' });
  res.json({ analysis });
});

apiRouter.get('/analysis/:id/agents', requireAuth, async (req: AuthRequest, res) => {
  const id = paramId(req.params.id);
  const analysis = await getAnalysis(id, req.userId!);
  if (!analysis) return res.status(404).json({ error: 'Not found' });
  const agents = await listAgentRuns(id);
  res.json({ agents });
});

apiRouter.get('/analysis/:id/result', requireAuth, async (req: AuthRequest, res) => {
  const id = paramId(req.params.id);
  const analysis = await getAnalysis(id, req.userId!);
  if (!analysis) return res.status(404).json({ error: 'Not found' });
  const [agents, result] = await Promise.all([
    listAgentRuns(id),
    getFinalResult(id),
  ]);
  const comparison = compareAgentRuns(agents);
  res.json({ analysis, agents, result, comparison });
});

apiRouter.get('/history', requireAuth, async (req: AuthRequest, res) => {
  const history = await listHistory(req.userId!);
  res.json({ history });
});

apiRouter.delete('/analysis/:id', requireAuth, async (req: AuthRequest, res) => {
  const ok = await deleteAnalysis(paramId(req.params.id), req.userId!);
  if (!ok) return res.status(404).json({ error: 'Not found' });
  res.json({ deleted: true });
});

apiRouter.get('/dashboard/stats', requireAuth, async (req: AuthRequest, res) => {
  const stats = await getDashboardStats(req.userId!);
  res.json(stats);
});

apiRouter.post('/upload', requireAuth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const ext = path.extname(req.file.originalname).toLowerCase();
  if (!ALLOWED_EXT.has(ext)) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: 'File type not allowed' });
  }
  const buffer = fs.readFileSync(req.file.path);
  const detected = await fileTypeFromBuffer(buffer);
  let extractedText = '';
  if (ext === '.pdf' || detected?.mime === 'application/pdf') {
    try {
      const pdfData = await pdf(buffer);
      extractedText = pdfData.text?.slice(0, 50000) ?? '';
    } catch {
      extractedText = '';
    }
  } else if (['.txt', '.md', '.csv', '.json'].includes(ext)) {
    extractedText = buffer.toString('utf8').slice(0, 50000);
  }
  res.json({
    fileName: req.file.originalname,
    filePath: req.file.filename,
    mimeType: detected?.mime ?? req.file.mimetype,
    size: req.file.size,
    extractedText,
  });
});
