import { prisma } from '../db.js';
import { SectionType } from '@prisma/client';

interface TrainingInput {
  title: string;
  description?: string;
}

interface SectionInput {
  title: string;
  order?: number;
  type: SectionType;
  videoUrl?: string;
  prompt?: {
    content: string;
    voiceModel?: string;
    textModel?: string;
  };
}

export const createTraining = async (data: TrainingInput) => {
  return prisma.training.create({
    data
  });
};

export const listTrainings = async () => {
  return prisma.training.findMany({
    include: {
      sections: {
        include: {
          prompt: true
        },
        orderBy: { order: 'asc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const getTrainingById = async (id: number) => {
  return prisma.training.findUnique({
    where: { id },
    include: {
      sections: {
        include: { prompt: true },
        orderBy: { order: 'asc' }
      }
    }
  });
};

export const addSection = async (trainingId: number, data: SectionInput) => {
  const training = await prisma.training.findUnique({ where: { id: trainingId } });
  if (!training) {
    throw new Error('Training not found');
  }

  return prisma.section.create({
    data: {
      title: data.title,
      order: data.order ?? 0,
      type: data.type,
      videoUrl: data.videoUrl,
      trainingId,
      prompt: data.prompt
        ? {
            create: {
              content: data.prompt.content,
              voiceModel: data.prompt.voiceModel,
              textModel: data.prompt.textModel
            }
          }
        : undefined
    },
    include: { prompt: true }
  });
};

export const getSections = async (trainingId: number) => {
  return prisma.section.findMany({
    where: { trainingId },
    include: { prompt: true },
    orderBy: { order: 'asc' }
  });
};
