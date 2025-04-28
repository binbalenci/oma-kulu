# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Frontend

### [1.2.2] - 2024-04-28

#### Added

- Set page title to "Oma Kulu | Benjamin"
- Updated API URL configuration for production environment

#### Fixed

- Corrected API endpoint paths in context providers
- Improved error handling for API requests

### [1.2.1] - 2024-03-21

#### Fixed

- Fixed transaction form not populating data when updating a transaction
- Added useEffect hook to properly handle initialData changes in TransactionForm
- Ensured form fields (amount, date, category) are properly populated when editing a transaction

#### Changed

- Updated version number to 1.2.1

### [1.2.0] - 2024-03-20

#### Added

- Initial release with basic functionality
- Transaction management
- Category management
- Chart visualization
- Responsive design

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

### [0.1.1] - 2024-04-28

#### Fixed

- Fixed API route prefixes in routers
- Corrected static file serving order in FastAPI app
- Ensured proper handling of API endpoints in production

#### Changed

- Updated router prefixes to include `/api` path
- Improved error handling for API endpoints
- Enhanced deployment configuration

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
