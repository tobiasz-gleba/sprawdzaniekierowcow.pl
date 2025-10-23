<script lang="ts">
	import { page } from '$app/stores';
	import SEO from '$lib/components/SEO.svelte';
</script>

<SEO 
	title="Polityka Prywatności - Sprawdzanie Kierowców"
	description="Polityka Prywatności dla sprawdzaniekierowcow.pl - jak zbieramy, przechowujemy i chronimy Twoje dane osobowe w systemie weryfikacji praw jazdy."
	keywords="polityka prywatności, RODO, ochrona danych, prywatność, bezpieczeństwo danych"
/>

<div class="min-h-screen bg-base-200">
	<div class="container mx-auto max-w-4xl p-4 py-8 md:p-8">
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h1 class="mb-6 text-4xl font-bold">Polityka Prywatności</h1>

				<div class="prose max-w-none">
					<p class="text-base-content/70">
						<strong>Ostatnia aktualizacja:</strong> 23 października 2025
					</p>

					<section class="mb-6">
						<h2 class="mb-3 text-2xl font-semibold">1. Wprowadzenie</h2>
						<p>
							Witamy na stronie sprawdzaniekierowcow.pl ("my", "nasz" lub "nas"). Zobowiązujemy się
							do ochrony Twoich danych osobowych i prawa do prywatności. Niniejsza Polityka
							Prywatności wyjaśnia, w jaki sposób zbieramy, wykorzystujemy, ujawniamy i chronimy
							Twoje informacje podczas korzystania z naszej usługi weryfikacji praw jazdy.
						</p>
					</section>

					<section class="mb-6">
						<h2 class="mb-3 text-2xl font-semibold">2. Zbierane Informacje</h2>
						<p>Zbieramy następujące rodzaje informacji:</p>
						<ul class="ml-6 list-disc space-y-2">
							<li>
								<strong>Informacje o koncie:</strong> Adres email i hasło podczas tworzenia konta.
								<em
									>Są to dane wymagane do uwierzytelnienia i zapewnienia dostępu do Twojego
									osobistego panelu.</em
								>
							</li>
							<li>
								<strong>Dane kierowców:</strong> Imiona, nazwiska i numery seryjne dokumentów prawa
								jazdy, które dodajesz do systemu.
								<em
									>Te informacje są niezbędne do przeprowadzania kontroli ważności prawa jazdy przez
									oficjalny polski rejestr rządowy.</em
								>
							</li>
							<li>
								<strong>Dane użytkowania:</strong> Informacje o tym, jak korzystasz z naszej usługi,
								w tym adresy IP, typ przeglądarki i czasy dostępu.
								<em
									>Pomaga nam to utrzymać bezpieczeństwo, zapobiegać nadużyciom i ulepszać usługę.</em
								>
							</li>
							<li>
								<strong>Tokeny weryfikacji email:</strong> Tymczasowe tokeny używane do weryfikacji
								adresu email.
								<em>Są automatycznie usuwane po pomyślnej weryfikacji lub wygaśnięciu.</em>
							</li>
						</ul>
					</section>

					<section class="mb-6">
						<h2 class="mb-3 text-2xl font-semibold">3. Dlaczego Potrzebujemy Twoich Danych</h2>
						<p>Każda część zbieranych danych służy konkretnemu celowi:</p>
						<ul class="ml-6 list-disc space-y-2">
							<li>
								<strong>Adres email:</strong> Wymagany do uwierzytelniania konta, odzyskiwania hasła
								oraz wysyłania powiadomień o zmianach statusu prawa jazdy kierowcy. Bez adresu email
								nie możemy powiadomić Cię, gdy prawo jazdy kierowcy stanie się nieważne.
							</li>
							<li>
								<strong>Hasło (zaszyfrowane):</strong> Niezbędne do ochrony Twojego konta i przechowywanych
								przez Ciebie wrażliwych danych kierowców. Hasła są hashowane przy użyciu Argon2id, nowoczesnego
								i bezpiecznego algorytmu.
							</li>
							<li>
								<strong>Informacje o kierowcach:</strong> Imiona, nazwiska i numery seryjne dokumentów
								są kluczowe dla zapytań do polskiego rządowego rejestru praw jazdy (CEPiK) w celu weryfikacji
								ważności prawa jazdy.
							</li>
							<li>
								<strong>Znaczniki czasu i logi statusów:</strong> Śledzimy kiedy rekordy kierowców są
								tworzone, aktualizowane i walidowane, aby zapewnić aktualność danych i dostarczyć dokładne
								informacje o statusie.
							</li>
						</ul>
					</section>

					<section class="mb-6">
						<h2 class="mb-3 text-2xl font-semibold">
							4. Jak Przechowujemy i Przetwarzamy Twoje Dane
						</h2>
						<p>
							<strong>Przechowywanie danych:</strong> Wszystkie dane są przechowywane w bazie danych
							MySQL. Twoje hasło jest hashowane przy użyciu Argon2id z następującymi parametrami:
						</p>
						<ul class="ml-6 list-disc space-y-2">
							<li>Koszt pamięci: 19456 KiB</li>
							<li>Koszt czasu: 2 iteracje</li>
							<li>Równoległość: 1 wątek</li>
							<li>Długość wyjściowa: 32 bajty</li>
						</ul>
						<p class="mt-4">
							<strong>Przetwarzanie danych:</strong> Dane kierowców są przetwarzane według następującego
							przepływu:
						</p>
						<ul class="ml-6 list-disc space-y-2">
							<li>Gdy dodajesz kierowcę, rekord jest oznaczany jako "oczekujący" (status: 2)</li>
							<li>Nasz zautomatyzowany system waliduje prawo jazdy w rejestrze CEPiK</li>
							<li>
								Status jest aktualizowany na "ważne" (1) lub "nieważne" (0) w oparciu o odpowiedź z
								rejestru
							</li>
							<li>
								Jeśli wcześniej ważne prawo jazdy stanie się nieważne, wysyłamy powiadomienie email
							</li>
							<li>Kontrole w tle są uruchamiane okresowo, aby utrzymać aktualne dane</li>
						</ul>
						<p class="mt-4">
							<strong>Zarządzanie sesjami:</strong> Używamy bezpiecznych ciasteczek sesji, aby utrzymać
							Cię zalogowanym. Sesje wygasają po okresie braku aktywności ze względów bezpieczeństwa.
						</p>
					</section>

					<section class="mb-6">
						<h2 class="mb-3 text-2xl font-semibold">5. Bezpieczeństwo Danych</h2>
						<p>
							Wdrażamy odpowiednie techniczne i organizacyjne środki bezpieczeństwa w celu ochrony
							Twoich danych osobowych, w tym:
						</p>
						<ul class="ml-6 list-disc space-y-2">
							<li>Hashowanie haseł algorytmem Argon2id</li>
							<li>Szyfrowanie HTTPS dla transmisji danych</li>
							<li>Bezpieczne zarządzanie sesjami</li>
							<li>
								Walidacja i sanityzacja danych wejściowych dla zapobiegania atakom typu injection
							</li>
							<li>Regularne aktualizacje bezpieczeństwa i poprawki</li>
						</ul>
						<p class="mt-4">
							Jednak żadna metoda transmisji przez Internet ani przechowywania elektronicznego nie
							jest w 100% bezpieczna, i nie możemy zagwarantować absolutnego bezpieczeństwa.
						</p>
					</section>

					<section class="mb-6 rounded-lg border border-warning bg-warning/10 p-4">
						<h2 class="mb-3 text-2xl font-semibold text-warning">
							⚠️ Ważne: Informacja o Samodzielnym Hostowaniu
						</h2>
						<p class="mb-2 font-semibold">
							Ta aplikacja jest dostarczana jako oprogramowanie open-source dostępne na GitHub.
							Ochrona danych i bezpieczeństwo są odpowiedzialnością dostawcy hostingu.
						</p>
						<p>
							<strong>Jeśli korzystasz z publicznie hostowanej instancji:</strong> Należy pamiętać, że
							dostawca hostingu może mieć dostęp do bazy danych i potencjalnie może uzyskać dostęp do
							Twoich danych. Zdecydowanie zalecamy samodzielne hostowanie tej aplikacji na własnej infrastrukturze,
							jeśli obsługujesz wrażliwe informacje.
						</p>
						<p class="mt-2">
							<strong>Dla maksymalnego bezpieczeństwa:</strong> Pobierz kod źródłowy z naszego repozytorium
							GitHub i wdróż go na własnych serwerach, gdzie masz pełną kontrolę nad dostępem do danych
							i bezpieczeństwem.
						</p>
					</section>

					<section class="mb-6">
						<h2 class="mb-3 text-2xl font-semibold">6. Udostępnianie i Ujawnianie Danych</h2>
						<p>
							Nie sprzedajemy, nie wymieniamy ani nie wynajmujemy Twoich danych osobowych stronom
							trzecim. Możemy udostępnić Twoje informacje tylko w następujących okolicznościach:
						</p>
						<ul class="ml-6 list-disc space-y-2">
							<li>Za Twoją wyraźną zgodą</li>
							<li>W celu wypełnienia zobowiązań prawnych lub nakazów sądowych</li>
							<li>Aby chronić nasze prawa, prywatność, bezpieczeństwo lub własność</li>
							<li>
								Z polskim rządowym rejestrem CEPiK podczas weryfikacji praw jazdy (tylko imiona,
								nazwiska i numery dokumentów - nie informacje o Twoim koncie)
							</li>
						</ul>
					</section>

					<section class="mb-6">
						<h2 class="mb-3 text-2xl font-semibold">7. Twoje Prawa</h2>
						<p>Masz prawo do:</p>
						<ul class="ml-6 list-disc space-y-2">
							<li>
								Dostępu, aktualizacji lub usunięcia swoich danych osobowych w dowolnym momencie
								przez panel użytkownika
							</li>
							<li>Eksportu danych kierowców (dostępne przez panel)</li>
							<li>Sprzeciwu wobec przetwarzania swoich danych osobowych</li>
							<li>Żądania ograniczenia przetwarzania swoich danych osobowych</li>
							<li>Wycofania zgody w dowolnym momencie przez usunięcie konta</li>
							<li>Wniesienia skargi do organu ochrony danych, jeśli ma zastosowanie</li>
						</ul>
					</section>

					<section class="mb-6">
						<h2 class="mb-3 text-2xl font-semibold">8. Przechowywanie Danych</h2>
						<p>
							Przechowujemy Twoje dane osobowe tylko tak długo, jak jest to konieczne do świadczenia
							naszych usług i realizacji celów określonych w niniejszej Polityce Prywatności. Po
							usunięciu konta usuniemy lub zanonimizujemy Twoje dane osobowe, z wyjątkiem
							przypadków, gdy jesteśmy prawnie zobowiązani do zachowania niektórych danych.
						</p>
						<p class="mt-2">
							Tokeny weryfikacji email są automatycznie usuwane po 24 godzinach lub po pomyślnej
							weryfikacji, w zależności od tego, co nastąpi wcześniej.
						</p>
					</section>

					<section class="mb-6">
						<h2 class="mb-3 text-2xl font-semibold">9. Cookies i Śledzenie</h2>
						<p>
							Używamy niezbędnych ciasteczek do utrzymania sesji i zapewnienia prawidłowego
							działania usługi. Nie używamy ciasteczek śledzących ani ciasteczek reklamowych stron
							trzecich. Możesz kontrolować ciasteczka poprzez ustawienia przeglądarki, ale
							wyłączenie ciasteczek uniemożliwi logowanie.
						</p>
					</section>

					<section class="mb-6">
						<h2 class="mb-3 text-2xl font-semibold">10. Prywatność Dzieci</h2>
						<p>
							Nasza usługa nie jest przeznaczona dla osób poniżej 18 roku życia. Nie zbieramy
							świadomie danych osobowych od dzieci. Jeśli uważasz, że zebraliśmy informacje od
							dziecka, prosimy o natychmiastowy kontakt.
						</p>
					</section>

					<section class="mb-6">
						<h2 class="mb-3 text-2xl font-semibold">11. Zmiany w Polityce Prywatności</h2>
						<p>
							Możemy aktualizować tę Politykę Prywatności od czasu do czasu. Powiadomimy Cię o
							wszelkich zmianach publikując nową Politykę Prywatności na tej stronie i aktualizując
							datę "Ostatnia aktualizacja". Zaleca się okresowe przeglądanie tej Polityki
							Prywatności w celu zapoznania się ze zmianami.
						</p>
					</section>

					<section class="mb-6">
						<h2 class="mb-3 text-2xl font-semibold">12. Kontakt</h2>
						<p>
							Jeśli masz jakiekolwiek pytania dotyczące niniejszej Polityki Prywatności, skontaktuj
							się z nami pod adresem:
						</p>
						<p class="mt-2">
							Email: <a href="mailto:privacy@sprawdzaniekierowcow.pl" class="link link-primary"
								>privacy@sprawdzaniekierowcow.pl</a
							>
						</p>
					</section>

					<div class="divider"></div>

					<div class="mt-6 text-center">
						<a href="/" class="btn btn-primary">Powrót do strony głównej</a>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
