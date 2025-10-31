# Mastra Coding Agent - React UI

A modern React-based user interface for the Mastra Coding Agent with Daytona sandbox integration.

## Features

- **Modern Chat Interface**: Clean, responsive chat UI built with React and shadcn/ui
- **Real-time Streaming**: Live agent responses with streaming support
- **Authentication**: Simple email/password auth powered by Supabase
- **Conversation Management**: Create, view, and delete conversation threads
- **Sandbox Tracking**: Monitor active Daytona sandboxes for each conversation
- **Code Highlighting**: Syntax-highlighted code blocks in messages
- **Responsive Design**: Works seamlessly on desktop and tablet devices
- **Dark Mode Ready**: Theme support with CSS custom properties

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **UI Components**: shadcn/ui with Tailwind CSS
- **Backend**: Mastra AI framework with OpenAI and Daytona
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth

## Project Structure

```
project/
├── src/
│   ├── client/              # React frontend application
│   │   ├── components/      # React components
│   │   │   ├── Auth/       # Authentication components
│   │   │   ├── Chat/       # Chat interface components
│   │   │   ├── Sidebar/    # Sidebar components
│   │   │   └── ui/         # shadcn/ui components
│   │   ├── contexts/       # React contexts (Auth)
│   │   ├── lib/            # Utilities and Supabase client
│   │   ├── pages/          # Page components
│   │   ├── App.tsx         # Main app component with routing
│   │   ├── main.tsx        # React entry point
│   │   └── index.css       # Global styles
│   └── mastra/             # Mastra agent backend
│       ├── agents/         # Agent definitions
│       ├── tools/          # Daytona tools
│       └── index.ts        # Mastra configuration with API routes
├── index.html              # HTML entry point
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── package.json            # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js 20 or higher
- OpenAI API key
- Daytona API key
- Supabase project (provided automatically)

### Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Environment variables** are already configured in `.env`:
   - `VITE_SUPABASE_URL`: Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
   - Add your API keys if needed:
     - `OPENAI_API_KEY`: Your OpenAI API key
     - `DAYTONA_API_KEY`: Your Daytona API key

### Development

Run both the Mastra backend and React frontend in development mode:

```bash
npm run dev
```

This starts:
- Mastra server on `http://localhost:4111`
- Vite dev server on `http://localhost:5173`

The React app proxies API requests to the Mastra server.

### Building for Production

Build the entire application:

```bash
npm run build
```

Or build components separately:

```bash
npm run build:vite    # Build frontend only
npm run build:mastra  # Build backend only
```

### Running in Production

```bash
npm start
```

This starts the Mastra server with the built frontend.

## Usage

1. **Sign Up / Sign In**: Create an account or sign in with your email and password
2. **Start Chatting**: Begin a conversation with the coding agent
3. **Ask Questions**: Request the agent to create sandboxes, write code, or execute commands
4. **View Sandboxes**: Monitor active Daytona sandboxes in the sidebar
5. **Manage Conversations**: Create new conversations or delete old ones

## Database Schema

The application uses Supabase with the following tables:

- **conversations**: Stores conversation threads
- **messages**: Individual messages within conversations
- **sandboxes**: Tracks Daytona sandbox sessions

All tables have Row Level Security (RLS) enabled to ensure users can only access their own data.

## API Routes

The Mastra server exposes the following API endpoint:

- `POST /api/chat`: Chat with the coding agent (streaming response)

## Customization

### Styling

Modify `src/client/index.css` to customize the color scheme. The app uses CSS custom properties for theming.

### Adding Components

Use shadcn/ui components located in `src/client/components/ui/`. These components follow the shadcn/ui patterns with Tailwind CSS.

### Agent Configuration

Modify the agent behavior in `src/mastra/agents/coding-agent.ts` and available tools in `src/mastra/tools/daytona.ts`.

## Troubleshooting

### Port Conflicts

If ports 4111 or 5173 are in use, modify:
- Mastra port: `src/mastra/index.ts` (server.port)
- Vite port: `vite.config.ts` (server.port)

### Build Errors

Ensure all dependencies are installed:
```bash
npm install
```

### Authentication Issues

Verify Supabase environment variables are correctly set in `.env`.

## Contributing

This is a template project. Feel free to customize it for your specific needs.

## License

Apache-2.0
