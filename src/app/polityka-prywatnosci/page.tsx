"use client";

import Link from "next/link";

export default function PolitykaPrywatnosciPage() {
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
          Polityka Prywatności
        </h1>
        <p className="text-sm mb-10" style={{ color: "var(--muted)" }}>
          Usługa &quot;Projekt AI w edukacji&quot; — obowiązuje od 25.02.2026
        </p>

        <article className="space-y-8 text-sm leading-relaxed" style={{ color: "var(--ink)" }}>
          {/* §1 */}
          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>
              § 1 Informacje podstawowe
            </h2>
            <p>
              Administrator danych osobowych to Workspace Partners Sp. z o.o. z siedzibą w Gdyni,
              ul. Piotrkowska 73, 81-502 Gdynia, NIP: 5862408931. Kontakt możliwy jest przez email{" "}
              <a href="mailto:contact@dfe.academy" style={{ color: "var(--accent)" }}>
                contact@dfe.academy
              </a>{" "}
              lub pocztą na podanym adresie.
            </p>
          </section>

          {/* §2 */}
          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>
              § 2 Zasady przetwarzania danych
            </h2>
            <p>
              Dane przetwarzane są zgodnie z zasadami: legalności, rzetelności, transparentności,
              minimalizacji, adekwatności, prawidłowości, czasowości i bezpieczeństwa.
            </p>
          </section>

          {/* §3 */}
          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>
              § 3 Cele, podstawy prawne i zakres przetwarzania danych
            </h2>
            <p className="mb-2">Dane przetwarzane są w następujących celach:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Zapewnienie dostępu do platformy edukacyjnej &quot;Projekt AI w edukacji&quot;</li>
              <li>Przetwarzanie przez dostawców API (OpenAI, ElevenLabs) zgodnie z ich politykami prywatności</li>
              <li>Historia konwersacji przechowywana lokalnie, usuwana po zamknięciu sesji</li>
              <li>Analiza dokumentów bez przechowywania przez Administratora</li>
              <li>Archiwizacja danych kontaktowych przez 6 lat</li>
            </ul>
          </section>

          {/* §4 */}
          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>
              § 4 Odbiorcy danych oraz przekazywanie do państw trzecich
            </h2>
            <p>
              Dane mogą być przekazane do: OpenAI Inc. (USA), ElevenLabs Inc. (USA), dostawcy hostingu
              oraz urzędów państwowych wymaganych prawem. Transfer do USA odbywa się na podstawie
              standardowych klauzul umownych (SCC).
            </p>
          </section>

          {/* §5 */}
          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>
              § 5 Okres przechowywania danych
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Historia konwersacji: przechowywana lokalnie do zakończenia sesji</li>
              <li>Dane kontaktowe: 6 lat od ostatniego kontaktu</li>
              <li>Dane przetwarzane przez OpenAI/ElevenLabs: zgodnie z ich politykami prywatności</li>
            </ul>
          </section>

          {/* §6 */}
          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>
              § 6 Prawa użytkowników
            </h2>
            <p className="mb-2">Użytkownikom przysługują następujące prawa:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Prawo dostępu do danych</li>
              <li>Prawo do sprostowania danych</li>
              <li>Prawo do usunięcia danych</li>
              <li>Prawo do ograniczenia przetwarzania</li>
              <li>Prawo do przenoszenia danych</li>
              <li>Prawo do sprzeciwu</li>
              <li>Prawo do cofnięcia zgody</li>
              <li>
                Prawo do wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (PUODO),
                ul. Stawki 2, 00-193 Warszawa
              </li>
            </ul>
          </section>

          {/* §7 */}
          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>
              § 7 Bezpieczeństwo danych
            </h2>
            <p className="mb-2">Stosowane są następujące środki bezpieczeństwa:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Szyfrowanie połączeń HTTPS</li>
              <li>Przechowywanie danych sesji lokalnie w przeglądarce użytkownika</li>
              <li>Korzystanie z zaufanych dostawców usług chmurowych</li>
            </ul>
            <p className="mt-2">
              Użytkownik odpowiada za bezpieczne przechowywanie hasła dostępu oraz wgrywanie wyłącznie
              danych niezastrzeżonych.
            </p>
          </section>

          {/* §8 */}
          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>
              § 8 Automatyczne profilowanie
            </h2>
            <p>Usługa nie korzysta z automatycznego profilowania użytkowników.</p>
          </section>

          {/* §9 */}
          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>
              § 9 Pliki cookies i localStorage
            </h2>
            <p>
              Usługa nie używa tradycyjnych plików cookies. Do przechowywania danych sesji wykorzystywany
              jest mechanizm localStorage w przeglądarce użytkownika. Użytkownik może usunąć te dane
              poprzez wyczyszczenie cache przeglądarki.
            </p>
          </section>

          {/* §10 */}
          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>
              § 10 Zmiany Polityki Prywatności
            </h2>
            <p>
              Administrator zastrzega sobie prawo do zmian niniejszej Polityki Prywatności z powiadomieniem
              na stronie logowania. Kontynuacja użytkowania oznacza akceptację zmian.
            </p>
          </section>

          {/* §11 */}
          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>
              § 11 Polityki prywatności dostawców zewnętrznych
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                OpenAI:{" "}
                <a
                  href="https://openai.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--accent)" }}
                >
                  openai.com/privacy
                </a>
              </li>
              <li>
                ElevenLabs:{" "}
                <a
                  href="https://elevenlabs.io/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--accent)" }}
                >
                  elevenlabs.io/privacy
                </a>
              </li>
            </ul>
          </section>

          {/* §12 */}
          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>
              § 12 Kontakt w sprawach ochrony danych
            </h2>
            <p>
              Workspace Partners Sp. z o.o.<br />
              ul. Piotrkowska 73, 81-502 Gdynia<br />
              Email:{" "}
              <a href="mailto:contact@dfe.academy" style={{ color: "var(--accent)" }}>
                contact@dfe.academy
              </a>
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
