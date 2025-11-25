# Oma Kulu 💰

A beautiful, Apple-standard personal finance management app built with React Native and Expo.

## ✨ Features

### 🏠 Home Dashboard
- **Month Navigation**: Smooth month selector with synchronized views
- **Cash Overview**: Real-time financial status with visual indicators
- **Expected Incomes & Invoices**: Grouped by category with expandable sections
- **Smart Budgets**: Gradient progress bars showing spending vs allocated amounts
- **Quick Copy**: Copy previous month's setup for easy planning
- **Pull-to-Refresh**: Swipe down to refresh all data

### 💳 Transactions
- **Unified View**: All financial activity in one place
- **Category Grouping**: Organized by spending categories
- **Visual Indicators**: Color-coded amounts (green for income, red for expenses)
- **Smart Filtering**: Month-specific upcoming items
- **Reordering**: Up/down arrows for same-date transactions
- **Easy Entry**: Streamlined transaction creation
- **Pull-to-Refresh**: Swipe down to refresh transaction data

### 📊 Reports
- **Spending Analysis**: Monthly category breakdown with visual progress indicators
- **Budget Tracking**: Color-coded progress bars showing budget status (green/orange/red)
- **Savings Tracking**: Contributions and payment progress
- **Summary Stats**: Total categories, spending, and budget information
- **Month Navigation**: Integrated with shared month context
- **Pull-to-Refresh**: Swipe down to refresh spending data

### 🏷️ Categories
- **Emoji System**: Modern emoji selector for category representation
- **Type Management**: Separate sections for Income, Expense, and Savings categories
- **Visual Design**: Custom colors and emojis for each category
- **Smart Controls**: Toggle visibility and budget eligibility
- **Pull-to-Refresh**: Swipe down to refresh category data
- **Validation**: Unique name + type combinations, empty name prevention

---

## 🎨 Design Philosophy

- **Apple-Standard Quality**: Clean, minimal, functional design
- **Vibrant Colors**: High-contrast, accessible color palette
- **Smooth Animations**: 60fps transitions with React Native Reanimated
- **Emoji-Rich**: Modern emoji system for categories and visual cues
- **Touch-Friendly**: Minimum 44pt touch targets
- **Consistent Spacing**: Systematic spacing scale for visual harmony

---

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **UI Library**: React Native Paper
- **Icons**: React Native Vector Icons + Emoji System
- **Animations**: React Native Reanimated
- **Database**: Supabase (PostgreSQL)
- **State Management**: React Hooks + Context
- **Testing**: Jest + @testing-library/react (275 tests)
- **Type Checking**: TypeScript (strict mode)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI
- iOS Simulator or Android Emulator (or physical device)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/oma-kulu.git
   cd oma-kulu
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Add your Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app

---

## 🗄️ Database Setup

### Supabase Configuration

1. Create a new Supabase project
2. Run the SQL migration script in `docs/database-setup.sql`
3. Update your environment variables with Supabase credentials

### Tables
- `categories` - Income/expense/saving types with emojis and colors
- `expected_incomes` / `expected_invoices` / `expected_savings` - Per-month planning
- `budgets` - Category-based spending limits
- `transactions` - Actual financial activity
- `app_settings` - App configuration and user preferences

---

## 📁 Project Structure

```
oma-kulu/
├── app/                        # All application code
│   ├── (tabs)/                 # Thin wrappers (3-11 lines)
│   │   ├── index.tsx           # Budget screen wrapper
│   │   ├── transactions.tsx    # Transactions screen wrapper
│   │   ├── reports.tsx         # Reports screen wrapper
│   │   └── categories.tsx      # Categories screen wrapper
│   ├── features/               # Feature-based modules
│   │   ├── shared/             # Shared utilities (165 tests)
│   │   │   ├── services/       # Pure functions (calculations, formatters, validators)
│   │   │   ├── hooks/          # React hooks (useFinancialData)
│   │   │   ├── README.md       # Detailed docs
│   │   │   └── CLAUDE.md       # AI guide
│   │   ├── budget/             # Budget feature
│   │   ├── transactions/       # Transactions feature (29 tests)
│   │   ├── reports/            # Reports feature (26 tests)
│   │   └── categories/         # Categories feature
│   ├── lib/                    # Core utilities
│   │   ├── database.ts         # Supabase CRUD operations
│   │   ├── storage.ts          # Data access layer
│   │   ├── types.ts            # TypeScript definitions
│   │   └── month-context.tsx  # Shared month state
│   ├── components/             # Shared UI components
│   │   └── ui/                 # Component library
│   ├── constants/              # Theme and config
│   │   ├── AppTheme.ts         # Theme system
│   │   └── theme.ts            # Legacy theme
│   └── hooks/                  # Framework hooks
│       ├── use-color-scheme.ts
│       └── use-theme-color.ts
├── docs/                       # Documentation
│   ├── APP_SPEC.md             # Feature specifications
│   ├── ROADMAP.md              # Development roadmap
│   └── plans/                  # Architecture plans
├── assets/                     # Images and fonts
├── CLAUDE.md                   # AI development guide
└── README.md                   # This file
```

---

## 🔧 Development

### Quick Commands
```bash
npm start              # Start Expo dev server
npm run check-all      # Type-check + lint (zero warnings required)
npm test              # Run all tests (275 passing)
npm test app/features/shared  # Run specific feature tests
```

### Code Style
- **TypeScript**: Strict type checking enabled
- **ESLint**: Configured with Expo rules
- **Testing**: Services 100%, hooks 90%+, components 0%
- **Imports**: Use `@/app/*` paths (all code in app/)

### Architecture Patterns
- **Data Flow**: Screen → Hook → Service → Database
- **Component Composition**: Thin wrappers import feature screens
- **Testing**: Co-located tests (myFile.ts + myFile.test.ts)
- **Documentation**: README.md (detailed) + CLAUDE.md (AI guide) per feature

### Key Rules
- Use `logger.*` (NOT `console.log`)
- Use `AppTheme` for colors/spacing (NOT hardcoded values)
- Use feature hooks for data loading (NOT direct database calls)
- Test services/hooks (NOT components/screens)

---

## 🧪 Testing

**275 tests passing** with high coverage:
- **Shared utilities**: 165 tests, 99%+ coverage
- **Transactions**: 29 tests, 100% coverage
- **Reports**: 26 tests, 100% services, 96% hooks
- **Categories**: Services tested, hooks tested

Run tests:
```bash
npm test                          # All tests
npm test app/features/shared      # Shared utilities
npm test -- --coverage            # With coverage report
npm test -- --watch               # Watch mode
```

---

## 📚 Documentation

- **Root Guide**: [CLAUDE.md](CLAUDE.md) - Overall architecture and patterns
- **Feature Docs**: Each feature has README.md + CLAUDE.md
  - [shared](app/features/shared/README.md) - Shared utilities
  - [budget](app/features/budget/README.md) - Budget feature
  - [transactions](app/features/transactions/README.md) - Transactions feature
  - [reports](app/features/reports/README.md) - Reports feature
  - [categories](app/features/categories/README.md) - Categories feature
- **Plans**: [docs/plans/](docs/plans/) - Architecture and refactoring plans

---

## 🚀 Deployment

### Building for Production

1. **Configure app.json**
   ```bash
   expo build:configure
   ```

2. **Build for iOS**
   ```bash
   expo build:ios
   ```

3. **Build for Android**
   ```bash
   expo build:android
   ```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for your changes
4. Ensure `npm run check-all` passes
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **React Native Paper** for the beautiful component library
- **Expo** for the amazing development platform
- **Supabase** for the backend-as-a-service
- **React Native Vector Icons** for the comprehensive icon sets
- **React Native Reanimated** for smooth animations

---

**Made with ❤️ for better personal finance management**
