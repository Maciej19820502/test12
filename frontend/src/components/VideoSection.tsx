import type { SectionDTO } from '../../../shared/types.js';

interface Props {
  section: SectionDTO;
}

const VideoSection = ({ section }: Props) => {
  if (!section.videoUrl) {
    return <p>Brak linku wideo.</p>;
  }

  const embedUrl = section.videoUrl.replace('watch?v=', 'embed/');

  return (
    <div>
      <h3>{section.title}</h3>
      <iframe
        width="560"
        height="315"
        src={embedUrl}
        title={section.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

export default VideoSection;
