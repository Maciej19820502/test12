"use client";

import Link from "next/link";

export default function RegulaminPage() {
  return (
    <main
      className="min-h-screen py-12 px-4"
      style={{ background: "var(--surface)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm mb-8 transition-colors duration-200"
          style={{ color: "var(--accent)" }}
        >
          ← Powrót do logowania
        </Link>

        <h1 className="text-3xl md:text-4xl mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>
          Regulamin
        </h1>
        <p className="text-sm mb-10" style={{ color: "var(--muted)" }}>
          Usługa &quot;Projekt AI w edukacji&quot; — obowiązuje od 25.02.2026
        </p>

        <article className="space-y-8 text-sm leading-relaxed" style={{ color: "var(--ink)" }}>
          {/* §1 */}
          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>
              § 1 Postanowienia ogólne
            </h2>
            <p>
              Regulamin określa zasady korzystania z platformy edukacyjnej &quot;Projekt AI w edukacji&quot;.
              Usługa została opracowana przez Workspace Partners Sp. z o.o. z siedzibą w Gdyni
              (ul. Piotrkowska 73, 81-502, NIP 5862408931). Dedykowana jest wyłącznie dla uczestników
              programu Akademii Leona Koźmińskiego w Warszawie. Korzystanie z Usługi jest równoznaczne
              z akceptacją postanowień niniejszego Regulaminu.
            </p>
          </section>

          {/* §2 */}
          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>
              § 2 Definicje
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Usługa</strong> — platforma edukacyjna &quot;Projekt AI w edukacji&quot; dla
                uczestników programu, składająca się z 5 narzędzi AI.
              </li>
              <li>
                <strong>Użytkownik</strong> — uczestnik programu posiadający ważne hasło dostępu.
              </li>
              <li>
                <strong>Narzędzia AI</strong> — funkcjonalności wykorzystujące technologie OpenAI
                i ElevenLabs.
              </li>
              <li>
                <strong>Dane niezastrzeżone</strong> — informacje ogólnodostępne, nieobjęte tajemnicą.
              </li>
            </ul>
          </section>

          {/* §3 */}
          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>
              § 3 Dostęp do Usługi
            </h2>
            <p>
              Dostęp wymaga ważnego hasła przekazanego przez organizatorów. Hasła przydzielane są
              indywidualnie lub grupowo. Okres ważności Usługi: od momentu aktywacji do 30 czerwca
              2026 roku. Użytkownik nie może udostępniać hasła osobom trzecim.
            </p>
          </section>

          {/* §4 */}
          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>
              § 4 Zakres Usługi
            </h2>
            <p className="mb-2">Usługa składa się z pięciu narzędzi:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Narzędzie A — Definiowanie tematu projektu przy wsparciu agenta AI</li>
              <li>Narzędzie B — Tworzenie karty projektu z agentowym wsparciem AI</li>
              <li>Narzędzie C — Przegląd projektu przez agenta-CFO</li>
              <li>Narzędzie D — Przegląd projektu przez agenta-PM</li>
              <li>Narzędzie E — Głosowa obrona projektu z agentem AI (ElevenLabs)</li>
            </ol>
          </section>

          {/* §5 */}
          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>
              § 5 Przeznaczenie Usługi i cele edukacyjne
            </h2>
            <p>
              Usługa przeznaczona jest wyłącznie do celów edukacyjnych w ramach programu. Zabrania się
              wykorzystywania do celów komercyjnych, nielegalnych lub naruszających prawa osób trzecich.
              Użytkownik ponosi pełną odpowiedzialność za treści wgrywane do narzędzi.
            </p>
          </section>

          {/* §6 */}
          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>
              § 6 Bezpieczeństwo danych i ochrona prywatności
            </h2>
            <p className="mb-2">
              Użytkownik zobowiązany jest do wgrywania wyłącznie danych niezastrzeżonych. Zabrania się
              wgrywania:
            </p>
            <ul className="list-disc pl-5 space-y-1 mb-2">
              <li>danych osobowych (RODO)</li>
              <li>danych objętych tajemnicą</li>
              <li>materiałów chronionych prawami autorskimi bez zgody</li>
              <li>informacji niejawnych</li>
            </ul>
            <p>
              Użytkownik ponosi pełną odpowiedzialność za naruszenie niniejszego zakazu oraz ewentualne
              konsekwencje prawne. Dane przechowywane są lokalnie (localStorage), nie są przekazywane
              administratorowi. Historia konwersacji usuwana jest po wyczyszczeniu cache.
            </p>
          </section>

          {/* §7 */}
          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>
              § 7 Ograniczenia technologiczne i niepewność wyników AI
            </h2>
            <p>
              Usługa wykorzystuje modele AI będące narzędziami probabilistycznymi mogące generować błędy.
              Administrator nie gwarantuje poprawności merytorycznej wyników generowanych przez Narzędzia AI.
              Użytkownik zobowiązany jest do krytycznej oceny i weryfikacji wyników. Odpowiedzialność
              za zastosowanie wyników spoczywa wyłącznie na użytkowniku.
            </p>
          </section>

          {/* §8 */}
          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>
              § 8 Wymagania techniczne
            </h2>
            <p>
              Wymagane są: urządzenie z dostępem do internetu oraz przeglądarka wspierająca JavaScript.
              Administrator nie odpowiada za problemy techniczne po stronie użytkownika.
            </p>
          </section>

          {/* §9 */}
          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>
              § 9 Koszty korzystania z Usługi
            </h2>
            <p>
              Dostęp do platformy jest bezpłatny dla uczestników programu do 30.06.2026. Użytkownik
              ponosi koszty transmisji danych internetowych we własnym zakresie.
            </p>
          </section>

          {/* §10 */}
          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>
              § 10 Prawa autorskie i własność intelektualna
            </h2>
            <p>
              Wszelkie prawa do Usługi należą do Workspace Partners Sp. z o.o. Zabrania się kopiowania,
              modyfikowania, rozpowszechniania kodu źródłowego czy przeprowadzania reverse engineering.
              Treści generowane przez AI mogą podlegać ograniczeniom dostawców zewnętrznych.
            </p>
          </section>

          {/* §11 */}
          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>
              § 11 Wyłączenie odpowiedzialności
            </h2>
            <p>
              Administrator nie ponosi odpowiedzialności za działania lub zaniechania Użytkownika
              w zakresie wykorzystania wyników AI. Nie odpowiada za szkody wynikłe z niewłaściwego
              użytkowania, utratę danych ani niedostępność usługi. Usługa świadczona jest w stanie
              &quot;jak jest&quot; (as is), bez gwarancji jakiegokolwiek rodzaju.
            </p>
          </section>

          {/* §12 */}
          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>
              § 12 Zmiany Regulaminu
            </h2>
            <p>
              Administrator zastrzega sobie prawo do zmian Regulaminu. Użytkownicy zostaną poinformowani
              przez powiadomienie na stronie logowania. Kontynuacja użytkowania oznacza akceptację zmian.
            </p>
          </section>

          {/* §13 */}
          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>
              § 13 Postanowienia końcowe
            </h2>
            <p>
              Zastosowanie mają przepisy prawa polskiego, w szczególności Kodeks cywilny, ustawa
              o świadczeniu usług drogą elektroniczną oraz RODO. Spory rozstrzygane będą przez sąd
              właściwy dla siedziby Administratora.
            </p>
          </section>

          {/* §14 */}
          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>
              § 14 Kontakt
            </h2>
            <p>
              Workspace Partners Sp. z o.o.<br />
              ul. Piotrkowska 73, 81-502 Gdynia<br />
              NIP: 5862408931<br />
              Email: contact@dfe.academy
            </p>
          </section>
        </article>

        <div className="mt-12 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm transition-colors duration-200"
            style={{ color: "var(--accent)" }}
          >
            ← Powrót do logowania
          </Link>
        </div>
      </div>
    </main>
  );
}
