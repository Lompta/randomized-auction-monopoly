# Randomized Auction Monopoly

An experimental web app that explores an alternate format for Monopoly focused on property auctions and portfolio analysis. Players bid on randomized properties, then an AI simulator runs hundreds of games to determine whose property portfolio performs best!

## How It Works

1. Join a game room with 2-4 players
2. Properties are presented in random order for auction
3. Players can either bid or pass on each property
4. After all properties are distributed, an AI simulator runs 100 games using the final property distribution
5. The player whose property portfolio wins the most simulated games is the winner

## Features

- Real-time multiplayer using WebRTC
- Two auction modes: turn-based or simultaneous bidding
- Detailed property information and auction history
- AI simulation engine that plays out simplified Monopoly games (e.g. no chance card implementation)
- Portfolio analysis showing win rates and bankruptcy statistics

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Legal Note

This is a non-commercial, experimental project inspired by Monopoly but not affiliated with or endorsed by Hasbro. Monopoly is a trademark of Hasbro. This project is an educational exploration of auction mechanics and portfolio analysis using familiar game properties as a framework.

## License

MIT License

## Shout Out
To Claude 3.5, for enabling me to make this project in my free time. Would have taken a lot longer solo.