# Oma Kulu 💰

A beautiful, Apple-standard personal finance management app built with React Native and Expo.

> **Version 1.0.0-beta** - Complete UI/UX overhaul with emoji system and enhanced user experience

## 🆕 What's New in 1.0.0-beta

### 🎨 Complete UI/UX Overhaul
- **Emoji System**: Modern emoji selector replaces icon picker for categories
- **Smooth Animations**: Enhanced dialog animations with proper scrolling
- **Smart Filtering**: Category filtering by type in Home/Transactions dialogs
- **Confirmation Dialogs**: Added for all delete actions
- **Safe Area Support**: Fixed iPhone compatibility issues
- **Enhanced UX**: Improved color differentiation and visual hierarchy

### 🔧 Technical Improvements
- **Custom Components**: SimpleDropdown with proper scrolling
- **Code Quality**: Zero TypeScript/ESLint errors
- **Database Ready**: Emoji field support (requires schema update)
- **Performance**: Optimized animations and rendering

## ✨ Features

### 🏠 Home Dashboard

- **Month Navigation**: Smooth month selector with synchronized views
- **Cash Overview**: Real-time financial status with visual indicators
- **Expected Incomes & Invoices**: Grouped by category with expandable sections
- **Smart Budgets**: Gradient progress bars showing spending vs allocated amounts
- **Quick Copy**: Copy previous month's setup for easy planning

### 💳 Transactions

- **Unified View**: All financial activity in one place
- **Category Grouping**: Organized by spending categories
- **Visual Indicators**: Color-coded amounts (green for income, red for expenses)
- **Smart Filtering**: Month-specific upcoming items
- **Easy Entry**: Streamlined transaction creation

### 🏷️ Categories

- **Emoji System**: Modern emoji selector for category representation
- **Dual Management**: Separate sections for Income and Expense categories
- **Visual Design**: Custom colors and emojis for each category
- **Smart Controls**: Toggle visibility and budget eligibility
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
