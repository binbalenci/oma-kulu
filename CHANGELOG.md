# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Frontend

### [1.2.0] - 2024-04-28

#### Added

- Separate buttons for adding Income and Expenses
- Type-specific modals with pre-selected transaction types
- Static type display in transaction forms
- Improved transaction filtering affecting both chart and list

#### Changed

- Enhanced modal styling with semi-transparent overlay
- Improved button visibility and consistency
- Updated form validation and error handling

#### Fixed

- Resolved transaction type selection in modals
- Fixed form initialization issues
- Improved chart data filtering and display

### [1.1.0] - 2024-04-27

#### Added

- Separate contexts for transactions and categories
- New Layout component with sidebar navigation
- Improved UI with consistent styling
- Transaction filtering by type
- Category management (add, edit, delete)
- Data summary and deletion in Settings

#### Changed

- Refactored Dashboard to use new contexts
- Updated Transactions page with better visualization
- Improved error handling and loading states
- Enhanced UI with motion animations

#### Fixed

- Resolved import issues with contexts
- Fixed linter errors
- Improved code organization and maintainability

### [1.0.0] - 2024-04-27

#### Added

- Initial release
- Basic transaction tracking
- Category management
- Dashboard with summary
- Settings page

### [0.1.0] - 2024-04-27

#### Added

- Initial React frontend setup with Vite
- Tailwind CSS v4 integration
- Basic project structure and routing
- Context API for state management
- Recharts for data visualization
- Heroicons for UI components

#### Security

- React 19
- Vite 6.3.1
- Tailwind CSS 4.1.4
- TypeScript support
- ESLint configuration

## Backend

### [0.1.0] - 2024-04-28

#### Added

- Initial backend setup with FastAPI
- Supabase integration for database
- Basic CRUD endpoints for transactions and categories
- Version management using pyproject.toml
- Health check endpoint with version information
- CORS configuration for frontend integration

#### Technical

- Python 3.11
- FastAPI 0.109.0
- Supabase Python Client 2.3.0
- Poetry for dependency management
