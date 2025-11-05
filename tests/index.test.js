const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const htmlPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf-8');

test('contains exactly three stage sections with expected ids', () => {
  const stageMatches = html.match(/<section class=\"stage/g) || [];
  assert.equal(stageMatches.length, 3, 'Powinny istnieć trzy sekcje lekcji.');

  ['stage-intro', 'stage-chat', 'stage-assessment'].forEach((id) => {
    assert.ok(
      html.includes(`id=\"${id}\"`),
      `Sekcja ${id} powinna być zdefiniowana w pliku HTML.`
    );
  });
});

test('navigation buttons map to available stages', () => {
  ['intro', 'chat', 'assessment'].forEach((name) => {
    assert.ok(
      html.includes(`data-stage=\"${name}\"`),
      `Nawigacja powinna zawierać przycisk dla etapu ${name}.`
    );
  });
});

test('chat stage exposes timer and control buttons', () => {
  assert.ok(
    html.includes('id=\"chat-timer\">10:00'),
    'Timer rozmowy powinien zaczynać od 10:00.'
  );
  ['chat-start', 'chat-end'].forEach((id) => {
    assert.ok(
      html.includes(`id=\"${id}\"`),
      `Przycisk sterujący ${id} powinien istnieć.`
    );
  });
});

test('assessment box and report are ukryte na starcie', () => {
  assert.ok(
    html.includes('id=\"assessment-box\" hidden'),
    'Blok pytań powinien być ukryty do czasu rozpoczęcia.'
  );
  assert.ok(
    html.includes('id=\"assessment-report\" hidden'),
    'Raport końcowy powinien być ukryty do czasu zakończenia rozmowy.'
  );
});

test('intro script zawiera narrację Macieja oraz obsługę syntezy mowy', () => {
  assert.ok(
    html.includes('Cześć, tu Maciej'),
    'Narracja Macieja powinna być zapisana w skrypcie.'
  );
  assert.ok(
    html.includes('speechSynthesis'),
    'Skrypt powinien korzystać z Web Speech API.'
  );
});
