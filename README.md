# Personal Finance Tracker

A modern web application for tracking personal finances, built with React, FastAPI, and Supabase.

## Features

- Track income and expenses
- View financial summaries and trends
- Categorize expenses
- Interactive charts and visualizations
- Responsive design with modern UI
- Real-time updates

## Tech Stack

- Frontend: React, TailwindCSS, Framer Motion, Recharts
- Backend: FastAPI, Python
- Database: Supabase (PostgreSQL)
- Authentication: Supabase Auth

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
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
2. Create the following table in your Supabase database:

```sql
create table transactions (
  id uuid default uuid_generate_v4() primary key,
  amount float not null,
  category text not null,
  type text not null check (type in ('income', 'expense')),
  date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

3. Enable Row Level Security (RLS) if needed
4. Get your Supabase URL and keys from the project settings

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
