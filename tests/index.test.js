const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const htmlPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf-8');

function includesAll(...snippets) {
  return snippets.every((snippet) => html.includes(snippet));
}

test('strona zawiera interfejs wyboru szkolenia oraz konfigurator', () => {
  assert.ok(
    includesAll('id="training-picker"', 'id="builder-form"', 'id="builder-steps"'),
    'Powinny istnieć podstawowe elementy interfejsu do wyboru i budowania szkolenia.'
  );
});

test('w kodzie znajduje się odwołanie do API szkoleń', () => {
  assert.ok(
    html.includes("fetch('/api/trainings'"),
    'Skrypt klienta powinien pobierać dane z endpointu /api/trainings.'
  );
});

test('sekcja scenariusza obejmuje moduły głosowe, tekstowe i wideo', () => {
  assert.ok(
    includesAll('Konwersacja głosowa', 'Konwersacja tekstowa', 'Materiał wideo'),
    'W treści HTML powinny występować nagłówki formularzy dla wszystkich typów modułów.'
  );
});

test('chat stage zachowuje timer oraz obsługę wysyłania wiadomości', () => {
  assert.ok(
    includesAll('id="chat-timer"', 'data-action="send"', 'data-action="start"'),
    'Moduł rozmowy tekstowej powinien mieć timer oraz przyciski start/send.'
  );
});

test('skrypt wspomina o syntezie mowy dla modułów głosowych', () => {
  assert.ok(
    html.includes('speechSynthesis'),
    'W kodzie klienta należy korzystać z Web Speech API.'
  );
});
