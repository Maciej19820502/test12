# Studio szkoleń AI

Rozbudowana wersja lekcji z Maciejem umożliwia teraz budowanie dowolnych scenariuszy
szkoleniowych z wykorzystaniem modułów głosowych, tekstowych oraz materiałów wideo.
W repozytorium znajdziesz przykładowe szkolenie „Ocena projektów AI w finansach”, a
backend w Node.js pozwala dodawać kolejne konfiguracje przez API lub wbudowany
konfigurator.

## Wymagania
- Node.js 18 lub nowszy
- npm (instalowany wraz z Node.js)

## Instalacja
```bash
npm install
```

## Uruchomienie aplikacji
1. W terminalu uruchom backend i serwer plików statycznych:
   ```bash
   npm start
   ```
   Aplikacja domyślnie działa na porcie `3000`.

2. Otwórz przeglądarkę i wejdź na adres `http://localhost:3000/`.

3. W panelu po lewej stronie wybierz istniejące szkolenie. W sekcji po prawej
   możesz dodać nowe moduły i zapisać własny scenariusz. Po zapisaniu lista
   szkoleń odświeży się automatycznie.

### Tryb deweloperski
Na czas prac możesz użyć automatycznego restartu serwera:
```bash
npm run dev
```

## API backendu
Backend udostępnia proste REST API operujące na pliku `data/trainings.json`:

- `GET /api/trainings` – lista wszystkich szkoleń
- `GET /api/trainings/:id` – pojedyncze szkolenie po identyfikatorze
- `POST /api/trainings` – utworzenie nowego szkolenia (patrz format poniżej)
- `PUT /api/trainings/:id` – pełna aktualizacja szkolenia
- `DELETE /api/trainings/:id` – usunięcie szkolenia

### Przykładowe żądanie POST
```json
{
  "title": "Warsztat wdrożeń AI",
  "description": "Szkolenie łączące moduły głosowe i wideo.",
  "steps": [
    {
      "type": "voice",
      "title": "Rozgrzewka",
      "prompt": "Powitaj uczestnika i przedstaw cele.",
      "script": "Cześć! Dziś skupimy się na planowaniu wdrożeń AI.",
      "durationMinutes": 4
    },
    {
      "type": "video",
      "title": "Przykład z branży finansowej",
      "youtubeUrl": "https://www.youtube.com/watch?v=example"
    }
  ]
}
```

## Testy
Zestaw testów weryfikuje obecność kluczowych elementów interfejsu oraz odwołań do API.
Uruchom je poleceniem:
```bash
npm test
```

## Dane przykładowe
Plik `data/trainings.json` zawiera szkolenie demonstracyjne odtwarzające poprzednią
lekcję z Maciejem oraz dodatkowy moduł wideo. Możesz go modyfikować ręcznie lub
rozbudowywać aplikację przez API.
