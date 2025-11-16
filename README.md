# Oma Kulu 💰

A beautiful, Apple-standard personal finance management app built with React Native and Expo.

> **Version 3.3.0** - Foundation Layer Complete: Feature-Based Architecture with Comprehensive Testing

## 🆕 What's New in 3.3.0

### 🏗️ Major Refactoring - Phase 1 Complete
**Feature-Based Architecture**: Completed the foundation layer of a comprehensive codebase refactoring that transforms the app into a modern, maintainable, and LLM-optimized architecture.

#### ✨ New Foundation
- **Shared Utilities**: Centralized calculations, formatters, and validators in `features/shared/`
- **Comprehensive Testing**: 90-100% test coverage on all shared services and hooks
- **Code Reduction**: Eliminated 400+ lines of duplicated code
- **Better Organization**: Clear separation of concerns (Services → Hooks → Components → Screens)

#### 🧪 Testing Infrastructure
- **Jest Framework**: Full testing setup with Expo integration
- **Hook Testing**: @testing-library/react for testing custom hooks
- **Co-located Tests**: Test files live next to source code for maintainability
- **Test Scripts**: `npm test`, `test:watch`, `test:coverage`, `test:shared`, `test:budget`

#### 📦 Shared Services (100% Tested)
- **calculations.ts**: Financial calculations (money to assign, actual in bank, category spending, savings)
- **formatters.ts**: Currency and date formatting utilities
- **validators.ts**: Form validation logic for budgets, transactions, and inputs
- **database-helpers.ts**: Common database operations and category resolution (90% tested)

#### 🪝 Shared Hooks (90%+ Tested)
- **useFinancialData**: Centralized data loading for incomes, invoices, budgets, and transactions

#### 📚 Documentation
- **Detailed Docs**: [features/shared/README.md](features/shared/README.md) with complete API reference
- **AI Guide**: [features/shared/CLAUDE.md](features/shared/CLAUDE.md) for AI-optimized development
- **Refactoring Plan**: [docs/plans/2025-01-16-feature-based-refactoring.md](docs/plans/2025-01-16-feature-based-refactoring.md)

#### 🎯 Impact
- **Maintainability**: Modular, testable code structure
- **Quality**: Comprehensive test coverage prevents regressions
- **Developer Experience**: Clear patterns and documentation for future development
- **LLM Optimization**: Smaller files (100-300 lines) improve AI code comprehension

This release establishes the foundation for Phase 2 (Budget Feature) and beyond. See the [refactoring plan](docs/plans/2025-01-16-feature-based-refactoring.md) for the complete roadmap.

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
- **Easy Entry**: Streamlined transaction creation
- **Pull-to-Refresh**: Swipe down to refresh transaction data

### 📊 Reports

- **Spending Analysis**: Monthly category breakdown with visual progress indicators
- **Budget Tracking**: Color-coded progress bars showing budget status
- **Summary Stats**: Total categories, spending, and budget information
- **Month Navigation**: Integrated with shared month context
- **Pull-to-Refresh**: Swipe down to refresh spending data

### 🏷️ Categories

- **Emoji System**: Modern emoji selector for category representation
- **Dual Management**: Separate sections for Income and Expense categories
- **Visual Design**: Custom colors and emojis for each category
- **Smart Controls**: Toggle visibility and budget eligibility
- **Pull-to-Refresh**: Swipe down to refresh category data
- **Drag & Drop**: Reorder categories for personal preference

## 🎨 Design Philosophy

- **Apple-Standard Quality**: Clean, minimal, functional design
- **Vibrant Colors**: High-contrast, accessible color palette
- **Smooth Animations**: 60fps transitions with React Native Reanimated
- **Emoji-Rich**: Modern emoji system for categories and visual cues
- **Touch-Friendly**: Minimum 44pt touch targets
- **Consistent Spacing**: Systematic spacing scale for visual harmony

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **UI Library**: React Native Paper
- **Icons**: React Native Vector Icons (MaterialDesignIcons, Ionicons) + Emoji System
- **Animations**: React Native Reanimated
- **Database**: Supabase (PostgreSQL)
- **State Management**: React Hooks + Context
- **Styling**: StyleSheet with custom theme system

## 📱 Screenshots

_Screenshots coming soon..._

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

## 🗄️ Database Setup

### Supabase Configuration

1. Create a new Supabase project
2. Run the SQL migration script in `docs/database-setup.sql`
3. **Add emoji column** (for 1.0.0-beta):
   ```sql
   ALTER TABLE categories ADD COLUMN emoji TEXT;
   ```
4. Update your environment variables with Supabase credentials

### Tables

- `expected_incomes` - Planned income sources
- `expected_invoices` - Expected bills and expenses
- `budgets` - Category-based spending limits
- `transactions` - Actual financial activity
- `categories` - Income/expense categories with emojis and colors
- `app_settings` - App configuration and user preferences

## 🎯 Key Features

### Smart Budgeting

- **Visual Progress**: Gradient progress bars show spending vs budget
- **Category Grouping**: Related items grouped for clarity
- **Month Planning**: Work on future months' budgets
- **Quick Setup**: Copy previous month's structure

### Transaction Management

- **Automatic Creation**: Marking expected items as paid creates transactions
- **Manual Entry**: Add one-off transactions easily
- **Category Assignment**: Smart category suggestions
- **Visual Feedback**: Color-coded amounts and status

### Data Synchronization

- **Real-time Updates**: Changes sync across all screens
- **Month Navigation**: Consistent month selection across tabs
- **Focus Refresh**: Data reloads when switching tabs

## 🎨 Theme System

The app uses a comprehensive theme system defined in `constants/AppTheme.ts`:

- **Colors**: Primary, success, error, warning, and neutral palettes
- **Typography**: Consistent font sizes and weights
- **Spacing**: Systematic spacing scale (4, 8, 12, 16, 20, 24, 32, 40, 48)
- **Shadows**: Elevation system for depth
- **Animations**: Consistent timing and easing

## 📁 Project Structure

```
oma-kulu/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Home (Budget) screen
│   │   ├── transactions.tsx
│   │   └── categories.tsx
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
│   ├── ui/               # UI component library
│   │   ├── Dialog.tsx
│   │   ├── ColorPickerDialog.tsx
│   │   ├── EmojiPickerDialog.tsx
│   │   ├── GradientProgressBar.tsx
│   │   └── CategoryBadge.tsx
│   └── snackbar-provider.tsx
├── constants/            # App configuration
│   ├── AppTheme.ts       # Theme system
│   └── theme.ts          # Legacy theme (backward compatibility)
├── lib/                  # Business logic
│   ├── database.ts       # Supabase operations
│   ├── storage.ts        # Data access layer
│   ├── types.ts          # TypeScript definitions
│   └── month-context.tsx # Shared month state
├── docs/                 # Documentation
│   ├── APP_SPEC.md       # Feature specifications
│   └── ROADMAP.md        # Development roadmap
└── assets/               # Images and fonts
```

## 🔧 Development

### Code Style

- **TypeScript**: Strict type checking enabled
- **ESLint**: Configured with Expo rules
- **Prettier**: Code formatting (recommended)
- **Naming**: PascalCase for components, camelCase for functions

### Component Guidelines

- Use the custom `Dialog` component for all modals
- Apply theme colors from `AppTheme` consistently
- Use emojis for categories and vector icons for UI elements
- Implement smooth animations with Reanimated
- Follow the spacing scale for consistent layouts

### State Management

- Use React Context for shared state (month selection)
- Local state with `useState` for component-specific data
- `useFocusEffect` for data reloading on screen focus
- Async operations with proper error handling

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

### App Store Submission

- Update version in `app.json`
- Test on physical devices
- Prepare screenshots and metadata
- Submit through Expo Application Services (EAS)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Native Paper** for the beautiful component library
- **Expo** for the amazing development platform
- **Supabase** for the backend-as-a-service
- **React Native Vector Icons** for the comprehensive icon sets
- **React Native Reanimated** for smooth animations

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/oma-kulu/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

---

**Made with ❤️ for better personal finance management**
