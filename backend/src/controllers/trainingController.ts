import { Request, Response } from 'express';
import { z } from 'zod';
import * as trainingService from '../services/trainingService.js';

const trainingSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional()
});

const sectionSchema = z.object({
  title: z.string().min(1),
  order: z.number().int().nonnegative().default(0),
  type: z.enum(['voice', 'text', 'video']),
  videoUrl: z.string().url().optional(),
  prompt: z.object({
    content: z.string().min(1),
    voiceModel: z.string().optional(),
    textModel: z.string().optional()
  }).optional()
});

export const createTraining = async (req: Request, res: Response) => {
  const parseResult = trainingSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.flatten() });
  }

  const training = await trainingService.createTraining(parseResult.data);
  res.status(201).json(training);
};

export const listTrainings = async (_req: Request, res: Response) => {
  const trainings = await trainingService.listTrainings();
  res.json(trainings);
};

export const getTrainingById = async (req: Request, res: Response) => {
  const trainingId = Number(req.params.id);
  const training = await trainingService.getTrainingById(trainingId);

  if (!training) {
    return res.status(404).json({ error: 'Training not found' });
  }

  res.json(training);
};

export const addSectionToTraining = async (req: Request, res: Response) => {
  const trainingId = Number(req.params.id);
  const parseResult = sectionSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.flatten() });
  }

  try {
    const section = await trainingService.addSection(trainingId, parseResult.data);
    res.status(201).json(section);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getSectionsByTraining = async (req: Request, res: Response) => {
  const trainingId = Number(req.params.id);
  const sections = await trainingService.getSections(trainingId);
  res.json(sections);
};
