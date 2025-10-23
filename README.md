# sprawdzaniekierowcow.pl

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![SvelteKit](https://img.shields.io/badge/SvelteKit-FF3E00?logo=svelte&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?logo=mysql&logoColor=white)

---

![Screenshot](app/static/Screenshot.png)

### O Projekcie

**sprawdzaniekierowcow.pl** to darmowa aplikacja webowa do monitorowania ważności uprawnień kierowców. System umożliwia firmom transportowym, flotom pojazdów i pracodawcom bieżące śledzenie statusu praw jazdy swoich pracowników.

Informacje o uprawnieniach kierowców są publicznie dostępne w polskich rejestrach, jednak sprawdzanie ich ręcznie jest czasochłonne. Nasza aplikacja automatyzuje ten proces, pozwalając na:
- Szybkie dodawanie i importowanie danych kierowców
- Automatyczne sprawdzanie statusu uprawnień
- Monitoring ważności dokumentów
- Otrzymywanie powiadomień o zmianach statusu (odebranie, wygaśnięcie uprawnień)

Projekt został udostępniony jako open source.

### Funkcje


- 📊 **Dane w czasie rzeczywistym** - Dashboard z podsumowaniem statusu uprawnień
- 📥 **Import masowy** - Importuj dane wielu kierowców jednocześnie
- 🔐 **Bezpieczna autentykacja** - System rejestracji i logowania z weryfikacją email
- 🔔 **Powiadomienia** - Alerty o zmianach statusu uprawnień
- ⚙️ **Automatyczna walidacja** - Background workers dla ciągłego monitoringu
- 📝 **CLI Scripts** - Narzędzia do masowej walidacji i zarządzania

### Stack Technologiczny

**Frontend:**
- SvelteKit - Framework aplikacji webowej
- Tailwind CSS + DaisyUI - Stylowanie i komponenty UI
- TypeScript - Typowanie statyczne

**Backend:**
- Node.js - Środowisko uruchomieniowe
- MySQL 8+ - Baza danych
- Drizzle ORM - Zarządzanie bazą danych
- Lucia Auth - Autentykacja użytkowników
- Nodemailer - Wysyłka emaili

**Automatyzacja:**
- Playwright - Automatyczna walidacja uprawnień
- Background Workers - Ciągłe sprawdzanie w tle
- Kubernetes CronJobs - Zaplanowane zadania

**Deployment:**
- Docker & Docker Compose - Konteneryzacja
- Kubernetes - Orkiestracja dla środowisk produkcyjnych
- FluxCD ready - Automatyczne wdrożenia

### Architektura

Aplikacja składa się z trzech głównych komponentów:

1. **Web Application** - Interfejs użytkownika (SvelteKit)
2. **Validation Workers** - Background procesy do automatycznej walidacji
3. **Scheduled Jobs** - CronJobs dla okresowych zadań (walidacja, notyfikacje)

#### Wymagania

- Node.js 18+ lub Bun
- MySQL 8+
- Docker (opcjonalnie)

#### Kroki instalacji

1. **Sklonuj repozytorium**
```bash
git clone https://github.com/yourusername/sprawdzaniekierowcow.pl.git
cd sprawdzaniekierowcow.pl/app
```

2. **Zainstaluj zależności**
```bash
npm install
# lub
bun install
```

3. **Skonfiguruj bazę danych**

Opcja A - Użyj Docker:
```bash
npm run db:start
```

Opcja B - Użyj własnej instancji MySQL i utwórz bazę danych:
```sql
CREATE DATABASE sprawdzaniekierowcow;
```

4. **Skonfiguruj zmienne środowiskowe**

Utwórz plik `.env` w katalogu `app/`:
```env
DB_HOST=localhost
DB_NAME=sprawdzaniekierowcow
DB_USERNAME=root
DB_PASSWORD=your-password
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
SMTP_FROM=noreply@sprawdzaniekierowcow.pl
```

5. **Uruchom migracje bazy danych**
```bash
npm run db:push
```

6. **Uruchom aplikację w trybie deweloperskim**
```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem `http://localhost:5173`

### Budowanie dla produkcji

#### Lokalne buildy

```bash
npm run build
npm run preview
```

#### Docker Compose (produkcja)

Aplikacja zawiera pełną konfigurację Docker Compose dla środowiska produkcyjnego z automatycznymi migracjami bazy danych.

**Uruchomienie:**

```bash
# Z katalogu głównego repozytorium
docker compose -f docker-compose.prod.yml up -d
```

**Co się dzieje przy starcie:**
1. Uruchamia się kontener MySQL
2. Init container automatycznie wykonuje migracje bazy danych (`db-migrate`)
3. Po pomyślnym zakończeniu migracji uruchamia się główna aplikacja
4. Aplikacja dostępna na `http://localhost:3001`

**Zatrzymanie:**
```bash
docker compose -f docker-compose.prod.yml down
```

**Zatrzymanie z usunięciem danych:**
```bash
docker compose -f docker-compose.prod.yml down -v
```

**Przeglądanie logów:**
```bash
# Wszystkie serwisy
docker compose -f docker-compose.prod.yml logs -f

# Tylko aplikacja
docker compose -f docker-compose.prod.yml logs -f app

# Tylko migracje
docker compose -f docker-compose.prod.yml logs db-migrate
```

**Ważne:** Przed uruchomieniem edytuj `docker-compose.prod.yml` i zmień:
- `EMAIL_USER` - twój adres email SMTP
- `EMAIL_PASS` - hasło do konta email
- `SMTP_HOST` - serwer SMTP (domyślnie Gmail)
- `DB_PASSWORD` - hasło do bazy danych (zmień także w sekcji `db`)
- `PUBLIC_BASE_URL` - URL aplikacji (dla linków w emailach)

**Uwagi:**
- Aplikacja domyślnie działa na porcie 3001 (możesz zmienić w sekcji `app.ports`)
- Baza danych MySQL nie jest wystawiana na zewnątrz - aplikacja łączy się przez wewnętrzną sieć Docker
- Jeśli port 3001 jest zajęty, zmień mapowanie w `docker-compose.prod.yml` (np. `3002:3000`)

#### Kubernetes Deployment

Dla środowisk produkcyjnych projekt zawiera pełną konfigurację Kubernetes z obsługą FluxCD.

**Struktura deploymentu:**

```bash
kubernetes/
├── deployment.yaml         # Główna aplikacja webowa
├── worker-deployment.yaml  # Background workers dla walidacji
├── cron.yaml              # CronJobs (walidacja, notyfikacje)
├── mysql.yaml             # Baza danych MySQL
├── fluxcd.yaml            # Konfiguracja HelmRelease dla FluxCD
└── kustomization.yaml     # Kustomize config
```

**Deployment z kubectl:**

```bash
# Z katalogu głównego repozytorium
kubectl apply -k kubernetes/

# Sprawdź status
kubectl get pods
kubectl get cronjobs
```

**Komponenty:**

1. **App Deployment** - Główna aplikacja (3 repliki dla HA)
2. **Worker Deployment** - Background workers (1-2 repliki)
3. **CronJobs:**
   - Walidacja kierowców oznaczonych do sprawdzenia (co 30 min)
   - Walidacja wszystkich kierowców (codziennie o 2:00)
   - Wysyłka notyfikacji o nieważnych prawach (codziennie o 8:00)

**Wymagane sekrety Kubernetes:**

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: sprawdzaniekierowcow-secrets
type: Opaque
stringData:
  DB_PASSWORD: "your-db-password"
  EMAIL_USER: "your-email@example.com"
  EMAIL_PASS: "your-email-password"
  SMTP_HOST: "smtp.gmail.com"
  SMTP_PORT: "587"
  PUBLIC_BASE_URL: "https://sprawdzaniekierowcow.pl"
```

**Monitoring i logi:**

```bash
# Logi aplikacji
kubectl logs -f deployment/sprawdzaniekierowcow-app

# Logi workers
kubectl logs -f deployment/sprawdzaniekierowcow-worker

# Status CronJobs
kubectl get cronjobs
kubectl logs job/validate-marked-drivers-<job-id>
```

### CLI Scripts

Aplikacja zawiera zestaw skryptów CLI do zarządzania walidacją kierowców i notyfikacjami. Szczegółowa dokumentacja dostępna w `app/scripts/README.md`.

#### Walidacja wszystkich kierowców

```bash
cd app/

# Waliduj wszystkich kierowców
npm run validate:all

# Waliduj tylko kierowców ze statusem "pending"
npm run validate:pending

# Waliduj kierowców konkretnego użytkownika
bun run scripts/validate-all-drivers.ts --user-id <user-id>

# Dry run (bez faktycznej walidacji)
bun run scripts/validate-all-drivers.ts --dry-run

# Z dodatkową współbieżnością (maks. 3)
bun run scripts/validate-all-drivers.ts --concurrency 2
```

#### Oznaczanie kierowców do walidacji

```bash
# Oznacz wszystkich kierowców jako wymagających walidacji
npm run mark:all
```

#### Wysyłka powiadomień

```bash
# Wyślij powiadomienia do wszystkich użytkowników z nieważnymi prawami
npm run notify:invalid

# Tylko dla konkretnego użytkownika
bun run scripts/notify-invalid-drivers.ts --user-id <user-id>

# Dry run (bez wysyłki emaili)
bun run scripts/notify-invalid-drivers.ts --dry-run
```

#### Background Worker

```bash
# Uruchom worker walidacji (ciągłe przetwarzanie)
npm run worker:validate
```

**Uwagi o wydajności:**
- Skrypty używają browser poolingu dla optymalnego zużycia pamięci
- Maksymalna współbieżność walidacji to 3 dla uniknięcia przeciążenia
- Domyślne opóźnienie między walidacjami: 2000ms
- Wymagana pamięć dla walidacji: min. 512Mi, zalecane 2Gi

### Dostępne komendy

#### Podstawowe komendy deweloperskie

```bash
npm run dev          # Uruchom serwer deweloperski
npm run build        # Zbuduj aplikację
npm run preview      # Podgląd wersji produkcyjnej
npm run lint         # Sprawdź kod
npm run format       # Formatuj kod
```

#### Zarządzanie bazą danych

```bash
npm run db:start     # Uruchom bazę danych (Docker)
npm run db:push      # Zastosuj zmiany w schemacie (development)
npm run db:generate  # Generuj pliki migracji
npm run db:migrate   # Wykonaj migracje
npm run db:studio    # Otwórz Drizzle Studio
```

#### Skrypty walidacji i notyfikacji

```bash
npm run validate:all      # Waliduj wszystkich kierowców
npm run validate:pending  # Waliduj tylko kierowców ze statusem "pending"
npm run notify:invalid    # Wyślij powiadomienia o nieważnych prawach
npm run mark:all          # Oznacz wszystkich kierowców do walidacji
npm run worker:validate   # Uruchom background worker walidacji
```

### Automatyzacja

System umożliwia automatyczne sprawdzanie kierowców na kilka sposobów:

#### 1. Background Workers (Kubernetes)

Workers działają w tle i ciągle przetwarzają kierowców oznaczonych do walidacji:

```yaml
# kubernetes/worker-deployment.yaml
replicas: 1-2  # Skalowalne w zależności od obciążenia
```

#### 2. CronJobs (Kubernetes)

Zaplanowane zadania wykonywane okresowo:

- **Walidacja oznaczonych** - co 30 minut
- **Walidacja wszystkich** - codziennie o 2:00
- **Notyfikacje** - codziennie o 8:00

#### 3. Manualne skrypty CLI

Uruchamianie skryptów on-demand na serwerze lub lokalnie.

### Kontrybuowanie

Zapraszamy do współpracy! Jeśli chcesz pomóc w rozwoju projektu:

1. Fork repozytorium
2. Stwórz branch dla swojej funkcjonalności (`git checkout -b feature/AmazingFeature`)
3. Commit zmiany (`git commit -m 'Add some AmazingFeature'`)
4. Push do brancha (`git push origin feature/AmazingFeature`)
5. Otwórz Pull Request

#### Zasady kontrybuowania

- Przestrzegaj istniejącego stylu kodu (użyj `npm run lint` i `npm run format`)
- Dodaj testy dla nowych funkcji
- Zaktualizuj dokumentację jeśli to konieczne
- Upewnij się, że wszystkie testy przechodzą przed utworzeniem PR

### Zgłaszanie błędów

Znalazłeś błąd? Otwórz issue na GitHubie z następującymi informacjami:
- Opis problemu
- Kroki do reprodukcji
- Oczekiwane zachowanie
- Screenshots (jeśli dotyczy)
- Informacje o środowisku (przeglądarka, system operacyjny)

### Uwagi produkcyjne

#### Bezpieczeństwo

- Zmień domyślne hasła do bazy danych w `docker-compose.prod.yml`
- Użyj silnych haseł dla kont email i bazy danych
- W Kubernetes przechowuj dane uwierzytelniające w Secrets
- Regularnie aktualizuj zależności: `npm audit` i `npm update`
- W produkcji używaj HTTPS (skonfiguruj reverse proxy jak nginx/traefik)

#### Wydajność

- Workers wymagają co najmniej 512Mi RAM (zalecane 2Gi)
- Główna aplikacja: min. 256Mi RAM
- Dla dużych baz danych rozważ skalowanie workers (1-3 repliki)
- Browser pooling redukuje zużycie pamięci o ~70%
- Optymalne ustawienie współbieżności: 1-2 dla production

#### Monitoring

- Sprawdzaj logi workers: `kubectl logs -f deployment/sprawdzaniekierowcow-worker`
- Monitoruj wykonanie CronJobs: `kubectl get cronjobs`
- Śledź metryki bazy danych (połączenia, rozmiar)
- Ustaw alerty dla nieudanych walidacji

### Licencja

Projekt udostępniony na licencji MIT. Zobacz plik `LICENSE` dla szczegółów.

### Kontakt

Dla pytań i sugestii:
- Otwórz issue na GitHubie
- Zobacz `SECURITY_AUDIT_PLAN.md` dla kwestii bezpieczeństwa

---

**sprawdzaniekierowcow.pl** - Open source narzędzie do monitorowania uprawnień kierowców 🚛

