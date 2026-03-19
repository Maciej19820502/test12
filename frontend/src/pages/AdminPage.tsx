import { FormEvent, useEffect, useState } from 'react';
import { addSection, createTraining, listTrainings } from '../api/client.js';
import type { TrainingDTO } from '../../../shared/types.js';

const AdminPage = () => {
  const [trainings, setTrainings] = useState<TrainingDTO[]>([]);
  const [selectedTrainingId, setSelectedTrainingId] = useState<number | null>(null);
  const [trainingForm, setTrainingForm] = useState({ title: '', description: '' });
  const [sectionForm, setSectionForm] = useState({
    title: '',
    order: 0,
    type: 'text' as 'voice' | 'text' | 'video',
    videoUrl: '',
    prompt: ''
  });

  useEffect(() => {
    listTrainings().then(setTrainings).catch(console.error);
  }, []);

  const handleTrainingSubmit = (event: FormEvent) => {
    event.preventDefault();
    createTraining({ title: trainingForm.title, description: trainingForm.description })
      .then((training) => {
        setTrainings((prev) => [training, ...prev]);
        setTrainingForm({ title: '', description: '' });
      })
      .catch(console.error);
  };

  const handleSectionSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!selectedTrainingId) return;

    addSection(selectedTrainingId, {
      title: sectionForm.title,
      order: sectionForm.order,
      type: sectionForm.type,
      videoUrl: sectionForm.type === 'video' ? sectionForm.videoUrl : undefined,
      prompt:
        sectionForm.type !== 'video'
          ? {
              content: sectionForm.prompt,
              voiceModel: sectionForm.type === 'voice' ? 'gpt-4o-mini-voice' : undefined,
              textModel: sectionForm.type === 'text' ? 'gpt-4o-mini' : undefined
            }
          : undefined
    })
      .then(() => listTrainings().then(setTrainings))
      .then(() =>
        setSectionForm({ title: '', order: 0, type: 'text', videoUrl: '', prompt: '' })
      )
      .catch(console.error);
  };

  return (
    <section>
      <h2>Panel administratora</h2>
      <div className="admin-forms">
        <form onSubmit={handleTrainingSubmit}>
          <h3>Nowe szkolenie</h3>
          <label>
            Tytuł
            <input
              value={trainingForm.title}
              onChange={(e) => setTrainingForm((prev) => ({ ...prev, title: e.target.value }))}
              required
            />
          </label>
          <label>
            Opis
            <textarea
              value={trainingForm.description}
              onChange={(e) =>
                setTrainingForm((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </label>
          <button type="submit">Dodaj szkolenie</button>
        </form>

        <form onSubmit={handleSectionSubmit}>
          <h3>Nowa sekcja</h3>
          <label>
            Szkolenie
            <select
              value={selectedTrainingId ?? ''}
              onChange={(e) => setSelectedTrainingId(Number(e.target.value))}
              required
            >
              <option value="" disabled>
                Wybierz szkolenie
              </option>
              {trainings.map((training) => (
                <option key={training.id} value={training.id}>
                  {training.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Tytuł sekcji
            <input
              value={sectionForm.title}
              onChange={(e) => setSectionForm((prev) => ({ ...prev, title: e.target.value }))}
              required
            />
          </label>
          <label>
            Kolejność
            <input
              type="number"
              value={sectionForm.order}
              onChange={(e) =>
                setSectionForm((prev) => ({ ...prev, order: Number(e.target.value) }))
              }
            />
          </label>
          <label>
            Typ
            <select
              value={sectionForm.type}
              onChange={(e) =>
                setSectionForm((prev) => ({
                  ...prev,
                  type: e.target.value as 'voice' | 'text' | 'video'
                }))
              }
            >
              <option value="voice">Konwersacja głosowa</option>
              <option value="text">Konwersacja tekstowa</option>
              <option value="video">YouTube video</option>
            </select>
          </label>
          {sectionForm.type === 'video' ? (
            <label>
              Link do YouTube
              <input
                value={sectionForm.videoUrl}
                onChange={(e) => setSectionForm((prev) => ({ ...prev, videoUrl: e.target.value }))}
                required
              />
            </label>
          ) : (
            <label>
              Prompt
              <textarea
                value={sectionForm.prompt}
                onChange={(e) => setSectionForm((prev) => ({ ...prev, prompt: e.target.value }))}
                required
              />
            </label>
          )}
          <button type="submit">Dodaj sekcję</button>
        </form>
      </div>
    </section>
  );
};

export default AdminPage;
