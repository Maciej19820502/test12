# Lekcja online: Weryfikacja projektów AI w finansach

## Jak uruchomić projekt

1. Sklonuj repozytorium lub pobierz paczkę z plikami projektu.
2. Uruchom prosty serwer HTTP w katalogu projektu, aby przeglądarka mogła poprawnie
   załadować zasoby audio oraz skrypty. Możesz skorzystać z wbudowanego w Pythona
   modułu `http.server`:

   ```bash
   python3 -m http.server 8000
   ```

3. Otwórz przeglądarkę i wejdź na adres `http://localhost:8000/index.html`.
4. Upewnij się, że przeglądarka ma włączone odtwarzanie dźwięku oraz dostęp do mikrofonu
   (jeśli chcesz korzystać z funkcji rozpoznawania mowy).

Po wykonaniu powyższych kroków aplikacja uruchomi się i poprowadzi Cię przez trzy
plansze lekcji z Maciejem.

## Jak uruchomić testy

Do weryfikacji integralności pliku `index.html` wykorzystujemy wbudowany w Node.js
mechanizm `node:test`. Upewnij się, że korzystasz z Node.js w wersji 18 lub nowszej,
a następnie wykonaj:

```bash
npm test
```

Polecenie uruchomi zestaw testów sprawdzających obecność kluczowych elementów lekcji,
w tym sekcji nawigacji, timerów konwersacji oraz narracji głosowej Macieja.
