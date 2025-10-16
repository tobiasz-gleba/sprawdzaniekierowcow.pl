# sprawdzaniekierowcow.pl 🚗

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![SvelteKit](https://img.shields.io/badge/SvelteKit-FF3E00?logo=svelte&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?logo=mysql&logoColor=white)

**Darmowe monitorowanie uprawnień kierowców** | Free Driver License Monitoring

[🇵🇱 Polski](#polska-wersja) | [🇬🇧 English](#english-version)

</div>

---

## 🇵🇱 Polska Wersja

### O Projekcie

**sprawdzaniekierowcow.pl** to darmowa aplikacja webowa do monitorowania ważności uprawnień kierowców. System umożliwia firmom transportowym, flotom pojazdów i pracodawcom bieżące śledzenie statusu praw jazdy swoich pracowników.

Informacje o uprawnieniach kierowców są publicznie dostępne w polskich rejestrach, jednak sprawdzanie ich ręcznie jest czasochłonne. Nasza aplikacja automatyzuje ten proces, pozwalając na:
- Szybkie dodawanie i importowanie danych kierowców
- Automatyczne sprawdzanie statusu uprawnień
- Monitoring ważności dokumentów
- Otrzymywanie powiadomień o zmianach statusu (odebranie, wygaśnięcie uprawnień)

Projekt został udostępniony jako open source z kilku kluczowych powodów:

### Funkcje


- 📊 **Dane w czasie rzeczywistym** - Dashboard z podsumowaniem statusu uprawnień
- 📥 **Import masowy** - Importuj dane wielu kierowców jednocześnie
- 🔐 **Bezpieczna autentykacja** - System rejestracji i logowania z weryfikacją email
- 🔔 **Powiadomienia** - Alerty o zmianach statusu uprawnień
### Stack Technologiczny


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
DATABASE_URL=mysql://user:password@localhost:3306/sprawdzaniekierowcow
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

```bash
npm run build
npm run preview
```

### Dostępne komendy

```bash
npm run dev          # Uruchom serwer deweloperski
npm run build        # Zbuduj aplikację
npm run preview      # Podgląd wersji produkcyjnej
npm run db:start     # Uruchom bazę danych (Docker)
npm run db:push      # Zastosuj zmiany w schemacie
npm run db:studio    # Otwórz Drizzle Studio
npm run lint         # Sprawdź kod
npm run format       # Formatuj kod
```

### Struktura projektu

```
app/
├── src/
│   ├── lib/
│   │   ├── components/      # Komponenty Svelte
│   │   ├── server/
│   │   │   ├── auth.ts      # Logika autentykacji
│   │   │   ├── db/          # Schema i połączenie z bazą
│   │   │   └── email.ts     # Obsługa emaili
│   │   └── stores/          # Svelte stores
│   └── routes/              # Routing aplikacji
├── static/                  # Pliki statyczne
└── drizzle/                 # Migracje bazy danych
```

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

---

## 🇬🇧 English Version

### About

**sprawdzaniekierowcow.pl** (Driver License Checker) is a free web application for monitoring the validity of driver licenses. The system enables transport companies, vehicle fleets, and employers to continuously track the license status of their employees.

Information about driver licenses is publicly available in Polish registries, but checking them manually is time-consuming. Our application automates this process, allowing for:
- Quick addition and import of driver data
- Automatic license status verification
- Document validity monitoring
- Notifications about status changes (revocation, expiration)

### Why Open Source?

This project is released as open source for several key reasons:

1. **Transparency and Security** - The source code is open, allowing anyone to verify data security and processing methods. This is especially important for personal driver data.

2. **Accessibility for All** - Small transport companies and entrepreneurs often lack resources for expensive fleet management systems. We provide this tool for free so everyone can benefit.

3. **Collaboration and Development** - Open source allows the developer community to co-create and improve the application. Anyone can report bugs, propose new features, and contribute code.

4. **Education** - The project can serve as an example of practical implementation of modern full-stack web development using SvelteKit, TypeScript, and best practices.

5. **Local Community** - As a Polish solution, we want to support the local IT community and show that we can create high-quality open source software.

### Features

- ✅ **Driver Management** - Add, edit, and remove driver data
- 📊 **Real-time Statistics** - Dashboard with license status summary
- 📥 **Bulk Import** - Import multiple drivers at once
- 🔐 **Secure Authentication** - Registration and login system with email verification
- 🔔 **Notifications** - Alerts about license status changes
- 📱 **Responsive Design** - Works on computers, tablets, and smartphones
- 🌙 **Modern UI** - Beautiful interface built with TailwindCSS and DaisyUI

### Tech Stack

- **Frontend**: SvelteKit 2, Svelte 5, TypeScript
- **Styling**: TailwindCSS 4, DaisyUI 5
- **Backend**: SvelteKit Server Functions
- **Database**: MySQL + Drizzle ORM
- **Authentication**: Custom implementation with Argon2 password hashing
- **Email**: Nodemailer
- **Dev Tools**: Vite, ESLint, Prettier

### Installation & Setup

See the Polish version above for detailed installation instructions. The process is the same regardless of language.

### Contributing

We welcome contributions! Please see the guidelines in the Polish section above - they apply to all contributors regardless of language.

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Author

**Tobiasz Gleba**

- GitHub: [@tobiaszgleba](https://github.com/tobiaszgleba)

### Support

If you find this project helpful, please consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting new features
- 🤝 Contributing code
- 📢 Sharing with others who might benefit

---

<div align="center">

Made with ❤️ in Poland

</div>
