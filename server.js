const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_PATH = path.join(__dirname, 'data', 'trainings.json');

app.use(express.json({ limit: '1mb' }));
app.use(cors());
app.use(express.static(path.join(__dirname)));

function loadTrainings() {
  try {
    const file = fs.readFileSync(DATA_PATH, 'utf-8');
    const parsed = JSON.parse(file);
    if (!Array.isArray(parsed.trainings)) {
      throw new Error('trainings should be array');
    }
    return parsed.trainings;
  } catch (error) {
    console.error('Nie udało się wczytać pliku trainings.json. Tworzę pustą bazę.', error);
    return [];
  }
}

function saveTrainings(trainings) {
  const dir = path.dirname(DATA_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const payload = JSON.stringify({ trainings }, null, 2);
  fs.writeFileSync(DATA_PATH, payload, 'utf-8');
}

let trainings = loadTrainings();

const STEP_VALIDATORS = {
  voice(step) {
    return (
      typeof step.title === 'string' &&
      typeof step.prompt === 'string' &&
      typeof step.script === 'string' &&
      typeof step.durationMinutes === 'number'
    );
  },
  text(step) {
    return (
      typeof step.title === 'string' &&
      typeof step.prompt === 'string' &&
      typeof step.partnerName === 'string' &&
      typeof step.openingMessage === 'string' &&
      Array.isArray(step.autoReplies) &&
      typeof step.durationMinutes === 'number'
    );
  },
  video(step) {
    return (
      typeof step.title === 'string' &&
      typeof step.youtubeUrl === 'string'
    );
  },
};

function generateIdFromTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

app.get('/api/trainings', (req, res) => {
  res.json({ trainings });
});

app.get('/api/trainings/:id', (req, res) => {
  const training = trainings.find((item) => item.id === req.params.id);
  if (!training) {
    return res.status(404).json({ error: 'Nie znaleziono szkolenia.' });
  }
  res.json({ training });
});

app.post('/api/trainings', (req, res) => {
  const { title, description, steps } = req.body;
  if (!title || !Array.isArray(steps) || steps.length === 0) {
    return res
      .status(400)
      .json({ error: 'Szkolenie wymaga tytułu oraz co najmniej jednego kroku.' });
  }

  const trainingId = req.body.id ? req.body.id : generateIdFromTitle(title);
  if (trainings.some((item) => item.id === trainingId)) {
    return res.status(409).json({ error: 'Szkolenie o takim identyfikatorze już istnieje.' });
  }

  try {
    const preparedSteps = steps.map((step, index) => {
      const { type } = step;
      if (!['voice', 'text', 'video'].includes(type)) {
        throw new Error(`Nieznany typ kroku: ${type}`);
      }
      if (!STEP_VALIDATORS[type](step)) {
        throw new Error(`Niepoprawna struktura kroku: ${type}`);
      }
      return {
        ...step,
        id: step.id ? step.id : `${type}-${index + 1}`,
      };
    });

    const newTraining = {
      id: trainingId,
      title,
      description: description || '',
      steps: preparedSteps,
    };

    trainings.push(newTraining);
    saveTrainings(trainings);

    res.status(201).json({ training: newTraining });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/trainings/:id', (req, res) => {
  const index = trainings.findIndex((item) => item.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Nie znaleziono szkolenia do aktualizacji.' });
  }
  const { title, description, steps } = req.body;
  if (!title || !Array.isArray(steps) || steps.length === 0) {
    return res
      .status(400)
      .json({ error: 'Aktualizacja wymaga tytułu oraz co najmniej jednego kroku.' });
  }

  try {
    const preparedSteps = steps.map((step, idx) => {
      const { type } = step;
      if (!['voice', 'text', 'video'].includes(type)) {
        throw new Error(`Nieznany typ kroku: ${type}`);
      }
      if (!STEP_VALIDATORS[type](step)) {
        throw new Error(`Niepoprawna struktura kroku: ${type}`);
      }
      return {
        ...step,
        id: step.id ? step.id : `${type}-${idx + 1}`,
      };
    });

    const updated = {
      id: req.params.id,
      title,
      description: description || '',
      steps: preparedSteps,
    };
    trainings[index] = updated;
    saveTrainings(trainings);
    res.json({ training: updated });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/trainings/:id', (req, res) => {
  const index = trainings.findIndex((item) => item.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Nie znaleziono szkolenia do usunięcia.' });
  }

  const [removed] = trainings.splice(index, 1);
  saveTrainings(trainings);
  res.json({ training: removed });
});

app.listen(PORT, () => {
  console.log(`Serwer szkoleniowy działa na porcie ${PORT}`);
});
