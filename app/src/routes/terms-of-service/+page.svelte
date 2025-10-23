<script lang="ts">
	import { page } from '$app/stores';
	import SEO from '$lib/components/SEO.svelte';
</script>

<SEO 
	title="Warunki Użytkowania - Sprawdzanie Kierowców"
	description="Warunki Użytkowania dla sprawdzaniekierowcow.pl - regulamin korzystania z systemu weryfikacji praw jazdy kierowców."
	keywords="regulamin, warunki użytkowania, terms of service"
/>

<div class="min-h-screen bg-base-200">
	<div class="container mx-auto max-w-4xl p-4 py-8 md:p-8">
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h1 class="mb-6 text-4xl font-bold">Warunki Użytkowania</h1>

				<div class="prose max-w-none">
					<p class="text-base-content/70">
						<strong>Ostatnia aktualizacja:</strong> 23 października 2025
					</p>

					<section class="mb-6">
						<h2 class="mb-3 text-2xl font-semibold">1. Akceptacja Warunków</h2>
						<p>
							Uzyskując dostęp i korzystając ze sprawdzaniekierowcow.pl ("Usługa"), akceptujesz i
							zgadzasz się na przestrzeganie warunków i postanowień niniejszej umowy. Jeśli nie
							zgadzasz się z tymi Warunkami Użytkowania, nie powinieneś korzystać z tej Usługi.
						</p>
					</section>

					<section class="mb-6">
						<h2 class="mb-3 text-2xl font-semibold">2. Opis Usługi</h2>
						<p>sprawdzaniekierowcow.pl to usługa weryfikacji praw jazdy, która pozwala:</p>
						<ul class="ml-6 list-disc space-y-2">
							<li>
								Przechowywać i zarządzać informacjami o kierowcach (imiona, nazwiska i numery praw
								jazdy)
							</li>
							<li>Weryfikować ważność prawa jazdy poprzez polski rządowy rejestr CEPiK</li>
							<li>Otrzymywać powiadomienia email, gdy prawo jazdy kierowcy staje się nieważne</li>
							<li>Importować i eksportować dane kierowców</li>
						</ul>
						<p class="mt-2">
							Usługa jest dostarczana "taka jaka jest" bez żadnych gwarancji ani rękojmi. Kod
							źródłowy jest dostępny jako oprogramowanie open-source na GitHub.
						</p>
					</section>

					<section class="mb-6">
						<h2 class="mb-3 text-2xl font-semibold">3. Obowiązki Użytkownika</h2>
						<p>Korzystając z tej Usługi, zgadzasz się:</p>
						<ul class="ml-6 list-disc space-y-2">
							<li>Podawać dokładne i prawdziwe informacje podczas tworzenia konta</li>
							<li>Zabezpieczyć hasło do konta i zachować je w tajemnicy</li>
							<li>
								Przesyłać tylko informacje o kierowcach, które jesteś prawnie upoważniony
								weryfikować
							</li>
							<li>
								Przestrzegać wszystkich obowiązujących przepisów prawnych dotyczących ochrony danych
							</li>
							<li>Nie wykorzystywać Usługi w żadnym nielegalnym ani nieuprawnionego celu</li>
							<li>Nie próbować uzyskać nieuprawnionego dostępu do Usługi lub jej systemów</li>
							<li>Nie zakłócać ani nie zaburzać działania Usługi lub serwerów</li>
						</ul>
					</section>

					<section class="mb-6">
						<h2 class="mb-3 text-2xl font-semibold">4. Dane i Prywatność</h2>
						<p>
							Twoje korzystanie z tej Usługi podlega również naszej Polityce Prywatności. Zapoznaj
							się z naszą
							<a href="/privacy-policy" class="link link-primary">Polityką Prywatności</a>, aby
							zrozumieć, jak zbieramy, wykorzystujemy i chronimy Twoje informacje.
						</p>
						<p class="mt-2">
							<strong>Ważne:</strong> Potwierdzasz, że przeczytałeś i zrozumiałeś Politykę Prywatności,
							w tym sekcję dotyczącą samodzielnego hostowania i ochrony danych.
						</p>
					</section>

					<section class="mb-6 rounded-lg border border-warning bg-warning/10 p-4">
						<h2 class="mb-3 text-2xl font-semibold text-warning">
							⚠️ Open Source i Samodzielne Hostowanie
						</h2>
						<p class="mb-2 font-semibold">
							Ta aplikacja jest dostarczana jako oprogramowanie open-source. Potwierdzasz i
							rozumiesz, że:
						</p>
						<ul class="ml-6 list-disc space-y-2">
							<li>Kod źródłowy jest swobodnie dostępny na GitHub</li>
							<li>Możesz pobrać, zmodyfikować i hostować aplikację na własnej infrastrukturze</li>
							<li>
								Jeśli korzystasz z publicznie hostowanej instancji, dostawca hostingu może mieć
								dostęp do bazy danych
							</li>
							<li>
								Dla maksymalnego bezpieczeństwa i ochrony danych powinieneś samodzielnie hostować
								aplikację
							</li>
							<li>
								Nie ponosimy odpowiedzialności za naruszenia bezpieczeństwa spowodowane przez
								zewnętrznych dostawców hostingu
							</li>
						</ul>
					</section>

					<section class="mb-6">
						<h2 class="mb-3 text-2xl font-semibold">5. Własność Intelektualna</h2>
						<p>
							Usługa i jej oryginalna zawartość, funkcje i funkcjonalność są licencjonowane na
							podstawie licencji open-source. Choć udzielamy Ci licencji na korzystanie z
							oprogramowania, musisz przestrzegać warunków odpowiedniej licencji open-source.
						</p>
					</section>

					<section class="mb-6">
						<h2 class="mb-3 text-2xl font-semibold">6. Ograniczenie Odpowiedzialności</h2>
						<p>
							W maksymalnym zakresie dozwolonym przez obowiązujące prawo, w żadnym wypadku
							sprawdzaniekierowcow.pl nie ponosi odpowiedzialności za jakiekolwiek szkody pośrednie,
							przypadkowe, specjalne, wynikowe lub karne, w tym między innymi:
						</p>
						<ul class="ml-6 list-disc space-y-2">
							<li>
								Utratę zysków, danych, użytkowania, wartości niematerialnych lub inne straty
								niematerialne
							</li>
							<li>
								Szkody wynikające z nieuprawnionego dostępu do transmisji lub danych lub ich zmiany
							</li>
							<li>Oświadczenia lub zachowanie jakiejkolwiek strony trzeciej w Usłudze</li>
							<li>Nieprawidłowe lub przestarzałe wyniki weryfikacji prawa jazdy</li>
							<li>Jakąkolwiek inną sprawę związaną z Usługą</li>
						</ul>
						<p class="mt-2">
							<strong>Ważne:</strong> Wyniki weryfikacji prawa jazdy są dostarczane wyłącznie w celach
							informacyjnych. Zawsze weryfikuj kluczowe informacje przez oficjalne kanały.
						</p>
					</section>

					<section class="mb-6">
						<h2 class="mb-3 text-2xl font-semibold">7. Wyłączenie Gwarancji</h2>
						<p>
							Korzystanie z Usługi odbywa się na Twoje wyłączne ryzyko. Usługa jest dostarczana
							"TAKA JAKA JEST" i "W MIARĘ DOSTĘPNOŚCI". Nie udzielamy żadnych gwarancji, wyraźnych
							ani dorozumianych, w tym między innymi:
						</p>
						<ul class="ml-6 list-disc space-y-2">
							<li>Usługa spełni Twoje wymagania</li>
							<li>Usługa będzie nieprzerwana, terminowa, bezpieczna lub wolna od błędów</li>
							<li>Wyniki uzyskane z korzystania z Usługi będą dokładne lub wiarygodne</li>
							<li>Wszelkie błędy w oprogramowaniu zostaną poprawione</li>
						</ul>
					</section>

					<section class="mb-6">
						<h2 class="mb-3 text-2xl font-semibold">8. Rozwiązanie Konta</h2>
						<p>
							Zastrzegamy sobie prawo do zakończenia lub zawieszenia konta w dowolnym momencie, bez
							uprzedzenia lub odpowiedzialności, z jakiegokolwiek powodu, w tym między innymi:
						</p>
						<ul class="ml-6 list-disc space-y-2">
							<li>Naruszenie niniejszych Warunków Użytkowania</li>
							<li>Oszukańcze, nielegalne lub nadużywające zachowanie</li>
							<li>Długi okres braku aktywności</li>
						</ul>
						<p class="mt-2">
							Możesz również zakończyć swoje konto w dowolnym momencie, usuwając je poprzez panel
							użytkownika. Po zakończeniu Twoje prawo do korzystania z Usługi natychmiast wygasa.
						</p>
					</section>

					<section class="mb-6">
						<h2 class="mb-3 text-2xl font-semibold">9. Prawo Właściwe</h2>
						<p>
							Niniejsze Warunki podlegają i są interpretowane zgodnie z prawem Polski, bez względu
							na jego przepisy kolizyjne.
						</p>
					</section>

					<section class="mb-6">
						<h2 class="mb-3 text-2xl font-semibold">10. Zmiany w Warunkach</h2>
						<p>
							Zastrzegamy sobie prawo do modyfikacji lub zastąpienia niniejszych Warunków w dowolnym
							momencie. Jeśli rewizja jest istotna, postaramy się zapewnić co najmniej 30 dni
							wyprzedzenia przed wejściem w życie nowych warunków. Co stanowi istotną zmianę,
							zostanie określone według naszego wyłącznego uznania.
						</p>
						<p class="mt-2">
							Kontynuując dostęp lub korzystanie z naszej Usługi po wejściu w życie rewizji,
							zgadzasz się być związany zrewidowanymi warunkami.
						</p>
					</section>

					<section class="mb-6">
						<h2 class="mb-3 text-2xl font-semibold">11. Informacje Kontaktowe</h2>
						<p>
							Jeśli masz jakiekolwiek pytania dotyczące niniejszych Warunków Użytkowania, skontaktuj
							się z nami pod adresem:
						</p>
						<p class="mt-2">
							Email: <a href="mailto:terms@sprawdzaniekierowcow.pl" class="link link-primary"
								>terms@sprawdzaniekierowcow.pl</a
							>
						</p>
					</section>

					<div class="divider"></div>

					<div class="mt-6 space-x-4 text-center">
						<a href="/privacy-policy" class="btn btn-outline">Polityka Prywatności</a>
						<a href="/" class="btn btn-primary">Powrót do strony głównej</a>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
