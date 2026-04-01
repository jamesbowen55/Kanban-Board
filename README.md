# Kanban Board

A full-stack Kanban board built with React and Supabase.

## Features
- Drag and drop tasks between columns
- Create tasks with title, description, priority, and due date
- Assign team members to tasks
- Custom labels with filtering
- Search and filter by priority, assignee, and label
- Guest accounts via Supabase anonymous auth — each user only sees their own tasks

## Tech Stack
- **Frontend:** React, @hello-pangea/dnd
- **Backend:** Supabase (PostgreSQL, Auth, RLS)
- **Hosting:** Vercel

## Running Locally

1. Clone the repo
```bash
   git clone https://github.com/jabo2204/Kanban-Board.git
   cd Kanban-Board
```

2. Install dependencies
```bash
   cd client
   npm install
```

3. Create a `.env` file in the `client/` folder
```
   REACT_APP_SUPABASE_URL=your-supabase-url
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

4. Start the app
```bash
   npm start
```

## Database Setup

Create the following tables in Supabase:

**tasks**
- id (uuid, primary key)
- title (text, required)
- description (text)
- priority (text)
- due_date (date)
- status (text)
- user_id (uuid)
- created_at (timestamptz)

**members**
- id (uuid, primary key)
- name (text, required)
- color (text)
- user_id (uuid)
- created_at (timestamptz)

**task_assignees**
- task_id (uuid, foreign key → tasks.id)
- member_id (uuid, foreign key → members.id)

**labels**
- id (uuid, primary key)
- name (text, required)
- color (text)
- user_id (uuid)
- created_at (timestamptz)

**task_labels**
- task_id (uuid, foreign key → tasks.id)
- label_id (uuid, foreign key → labels.id)

Enable RLS on all tables and enable Anonymous sign-in under Authentication → Providers.

## Architecture Notes
The app uses Supabase directly from the frontend with Row Level Security policies to ensure users only access their own data.
