<!-- Static content cached for 24h on client side via +page.server.ts -->
<svelte:head>
	<link rel="preload" as="image" href="/Screenshot.png" />
</svelte:head>

<main>
	<article>
		<section class="py-16 md:py-24" aria-labelledby="hero-heading">
			<div class="container mx-auto max-w-7xl px-4">
				<!-- Image Container -->
				<figure class="mb-16 flex justify-center">
					<a href="/login" class="block cursor-pointer transition-transform hover:scale-[1.02]" aria-label="Zobacz panel sprawdzania kierowców">
						<img
							src="/Screenshot.png"
							alt="Panel monitorowania uprawnień kierowców - przejrzysty dashboard z listą kierowców i ich statusami"
							class="h-auto w-[100%] rounded-xl border-2 border-neutral-700 shadow-2xl"
							loading="eager"
							width="1200"
							height="630"
						/>
					</a>
				</figure>

				<!-- Content Grid -->
				<div class="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
					<!-- Left Column - Heading -->
					<header>
						<h1 id="hero-heading" class="text-4xl leading-tight font-bold md:text-5xl lg:text-6xl">
							Darmowe monitorowanie uprawnień kierowców.
						</h1>
					</header>

					<!-- Right Column - Description and CTA -->
					<div class="flex flex-col justify-center">
						<p class="mb-8 text-lg leading-relaxed opacity-70 md:text-xl">
							W
							<a
								href="https://moj.gov.pl/uslugi/engine/ng/index?xFormsAppName=UprawnieniaKierowcow&xFormsOrigin=EXTERNAL"
								target="_blank"
								rel="noopener noreferrer"
								class="link font-semibold link-primary"
								aria-label="Otwórz Centralną Ewidencję Kierowców w nowym oknie"
							>
								Centralnej Ewidencji Kierowców
							</a>, informacje o prawie jazdy są dostępne dla wszystkich.
							<br />
							W naszym panelu administracyjnym, możesz monitorować oraz otrzymywać <strong>powiadomienia</strong> w
							razie zmiany statusu (odebrania, wygaśnięcia) uprawnienia do prowadzenia pojazdów Twojego pracownika.
						</p>

						<div>
							<a href="/login" class="btn gap-2 btn-lg btn-primary" aria-label="Zacznij korzystać - przejdź do logowania">
								Ustaw powiadomienia w 2 minuty
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="2"
									stroke="currentColor"
									class="h-5 w-5"
									aria-hidden="true"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
									/>
								</svg>
							</a>
						</div>
					</div>
				</div>
			</div>
		</section>
	</article>
</main>
