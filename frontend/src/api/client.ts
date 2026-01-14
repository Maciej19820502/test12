import axios from 'axios';
import type { TrainingDTO, SectionDTO } from '../../shared/types.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000'
});

export const createTraining = (payload: { title: string; description?: string }) =>
  api.post<TrainingDTO>('/trainings', payload).then((res) => res.data);

export const listTrainings = () =>
  api.get<TrainingDTO[]>('/trainings').then((res) => res.data);

export const getTraining = (id: string | number) =>
  api.get<TrainingDTO>(`/trainings/${id}`).then((res) => res.data);

export const addSection = (
  trainingId: number,
  payload: {
    title: string;
    order?: number;
    type: 'voice' | 'text' | 'video';
    videoUrl?: string;
    prompt?: {
      content: string;
      voiceModel?: string;
      textModel?: string;
    };
  }
) => api.post<SectionDTO>(`/trainings/${trainingId}/sections`, payload).then((res) => res.data);

export const getSections = (trainingId: number) =>
  api.get<SectionDTO[]>(`/trainings/${trainingId}/sections`).then((res) => res.data);
