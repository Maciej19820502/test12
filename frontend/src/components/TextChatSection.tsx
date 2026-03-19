import { FormEvent, useState } from 'react';
import type { SectionDTO } from '../../../shared/types.js';

interface Props {
  section: SectionDTO;
}

const TextChatSection = ({ section }: Props) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!input) return;

    const response = `Simulated GPT response for prompt: ${section.prompt?.content}`;
    setMessages((prev) => [...prev, `Ty: ${input}`, `GPT: ${response}`]);
    setInput('');
  };

  return (
    <div>
      <h3>{section.title}</h3>
      <p className="section-hint">Prompt: {section.prompt?.content}</p>
      <div className="chat-log">
        {messages.map((message, index) => (
          <p key={index}>{message}</p>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Napisz wiadomość" />
        <button type="submit">Wyślij</button>
      </form>
    </div>
  );
};

export default TextChatSection;
