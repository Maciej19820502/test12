import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listTrainings } from '../api/client.js';
import type { TrainingDTO } from '../../../shared/types.js';

const TrainingsPage = () => {
  const [trainings, setTrainings] = useState<TrainingDTO[]>([]);

  useEffect(() => {
    listTrainings().then(setTrainings).catch(console.error);
  }, []);

  return (
    <section>
      <h2>Dostępne szkolenia</h2>
      <ul>
        {trainings.map((training) => (
          <li key={training.id}>
            <Link to={`/trainings/${training.id}`}>{training.title}</Link>
            {training.description ? <p>{training.description}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default TrainingsPage;
