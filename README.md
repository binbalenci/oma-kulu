# Oma Kulu - Personal Finance Tracker

A modern web application for tracking personal finances, built with React, FastAPI, and Supabase.

## Author

- **Name**: Benjamin Bui
- **GitHub**: [binbalenci](https://github.com/binbalenci)

## Features

- Track income and expenses
- View financial summaries and trends
- Categorize expenses
- Interactive charts and visualizations
- Responsive design with modern UI
- Real-time updates

## Tech Stack

### Frontend

- React 19
- TailwindCSS 4
- Framer Motion
- Recharts
- Vite 6

### Backend

- FastAPI
- Python 3.11
- Supabase Python Client

### Database

- Supabase (PostgreSQL)
- Row Level Security

## Project Structure

```
oma-kulu/
├── frontend/           # React frontend
│   ├── src/           # Source code
│   ├── public/        # Static assets
│   └── package.json   # Frontend dependencies
├── backend/           # FastAPI backend
│   ├── config/        # Configuration files
│   ├── models/        # Data models
│   ├── routers/       # API endpoints
│   └── main.py        # Application entry point
└── CHANGELOG.md       # Version history
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- Python (v3.11 or higher)
- Supabase account

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory with your Supabase credentials:

   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Create a virtual environment:

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the backend directory with your Supabase credentials:

   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   ```

5. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

### Supabase Setup

1. Create a new Supabase project
2. Create the following tables in your Supabase database:

```sql
-- Categories table
create table categories (
  id serial primary key,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  color text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Transactions table
create table transactions (
  id uuid default uuid_generate_v4() primary key,
  amount float not null,
  category_id integer references categories(id),
  type text not null check (type in ('income', 'expense')),
  date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table transactions enable row level security;
alter table categories enable row level security;

-- Create policies
create policy "Enable all operations for authenticated users" on transactions
    for all
    to authenticated
    using (true)
    with check (true);

create policy "Enable all operations for authenticated users" on categories
    for all
    to authenticated
    using (true)
    with check (true);
```

## Version History

See [CHANGELOG.md](CHANGELOG.md) for detailed version history of both frontend and backend.

## Usage

1. Access the frontend at `http://localhost:5173`
2. Access the API documentation at `http://localhost:8000/docs`

## API Endpoints

- `POST /api/transactions` - Create a new transaction
- `GET /api/transactions` - Get all transactions
- `GET /api/summary` - Get financial summary
- `GET /api/categories` - Get expense categories breakdown

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT
