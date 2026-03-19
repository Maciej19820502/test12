import type { SectionDTO } from '../../../shared/types.js';

interface Props {
  section: SectionDTO;
}

const VoiceChatSection = ({ section }: Props) => {
  return (
    <div>
      <h3>{section.title}</h3>
      <p>
        Ta sekcja symuluje konwersację głosową z GPT. Użyj biblioteki Web Speech API lub innego
        rozwiązania do transkrypcji i odtwarzania. Prompt: {section.prompt?.content}
      </p>
      <button type="button">Start nagrywania</button>
    </div>
  );
};

export default VoiceChatSection;
