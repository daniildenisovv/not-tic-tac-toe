# Tic Tac Toe - Telegram Mini App

A modern Tic Tac Toe game built as a Telegram Mini App with a unique twist: each player can only have 3 pieces on the board at any time!

## 🎮 Features

- **Unique Gameplay**: Maximum 3 pieces per player - oldest piece disappears when placing the 4th
- **Real-time Multiplayer**: Play with friends using Socket.IO
- **Telegram Integration**: Works as a Telegram Mini App with native features
- **Modern UI**: Built with Next.js, TypeScript, and shadcn/ui components
- **Responsive Design**: Works great on mobile devices
- **Room System**: Create rooms and share with friends via unique room IDs

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd tic-tac-toe
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: shadcn/ui with Tailwind CSS
- **Real-time Communication**: Socket.IO
- **Telegram Integration**: @twa-dev/sdk
- **State Management**: React Context API

### Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── game/[roomId]/     # Dynamic game room pages
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Home page
├── components/
│   ├── game/              # Game-related components
│   │   ├── game-board.tsx
│   │   ├── game-cell.tsx
│   │   ├── game-info.tsx
│   │   └── game-room.tsx
│   ├── providers/         # Context providers
│   │   ├── socket-provider.tsx
│   │   └── telegram-provider.tsx
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── game-logic.ts      # Core game logic
│   └── utils.ts          # Utility functions
└── types/
    └── game.ts           # TypeScript type definitions
```

## 🎯 Game Rules

1. **Standard Tic Tac Toe**: Get 3 in a row to win
2. **3-Piece Limit**: Each player can have maximum 3 pieces on the board
3. **Automatic Removal**: When placing your 4th piece, your oldest piece automatically disappears
4. **Turn-based**: Players alternate turns
5. **Real-time**: All moves are synchronized in real-time

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```bash
# Socket.IO server URL (optional)
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000

# Production settings
NODE_ENV=development
PORT=3000
```

### Telegram Bot Setup

1. Create a new bot with [@BotFather](https://t.me/botfather)
2. Set up a Mini App using `/newapp` command
3. Configure the web app URL to your deployed application
4. Add the bot token to your environment variables (if needed)

## 📱 Telegram Mini App Features

- **Haptic Feedback**: Vibration feedback for moves and game events
- **Theme Integration**: Respects Telegram's dark/light theme
- **Sharing**: Easy sharing of room links through Telegram
- **User Integration**: Uses Telegram user information for player names

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy!

### Deploy with Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. test

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Socket.IO](https://socket.io/) for real-time communication
- [Telegram](https://core.telegram.org/bots/webapps) for the Mini App platform
- [Next.js](https://nextjs.org/) for the amazing React framework
