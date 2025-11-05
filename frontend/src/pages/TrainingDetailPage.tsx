import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTraining } from '../api/client.js';
import type { TrainingDTO, SectionDTO } from '../../../shared/types.js';
import VoiceChatSection from '../components/VoiceChatSection.js';
import TextChatSection from '../components/TextChatSection.js';
import VideoSection from '../components/VideoSection.js';

const TrainingDetailPage = () => {
  const { id } = useParams();
  const [training, setTraining] = useState<TrainingDTO | null>(null);
  const [activeSection, setActiveSection] = useState<SectionDTO | null>(null);

  useEffect(() => {
    if (!id) return;
    getTraining(id)
      .then((data) => {
        setTraining(data);
        setActiveSection(data.sections[0] ?? null);
      })
      .catch(console.error);
  }, [id]);

  const renderSection = (section: SectionDTO | null) => {
    if (!section) return <p>Wybierz sekcję z listy.</p>;

    switch (section.type) {
      case 'voice':
        return <VoiceChatSection section={section} />;
      case 'text':
        return <TextChatSection section={section} />;
      case 'video':
      default:
        return <VideoSection section={section} />;
    }
  };

  return (
    <section>
      {training ? (
        <>
          <h2>{training.title}</h2>
          <p>{training.description}</p>
          <div className="sections-layout">
            <aside>
              <h3>Sekcje</h3>
              <ul>
                {training.sections.map((section) => (
                  <li key={section.id}>
                    <button type="button" onClick={() => setActiveSection(section)}>
                      {section.title}
                    </button>
                  </li>
                ))}
              </ul>
            </aside>
            <article>{renderSection(activeSection)}</article>
          </div>
        </>
      ) : (
        <p>Ładowanie...</p>
      )}
    </section>
  );
};

export default TrainingDetailPage;
