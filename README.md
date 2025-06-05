    '████████╗██╗  ██╗███████╗    ███████╗ █████╗ ██╗      ██████╗ ███╗   ██╗'
    '╚══██╔══╝██║  ██║██╔════╝    ██╔════╝██╔══██╗██║     ██╔═══██╗████╗  ██║'
    '   ██║   ███████║█████╗      ███████╗███████║██║     ██║   ██║██╔██╗ ██║'
    '   ██║   ██╔══██║██╔══╝      ╚════██║██╔══██║██║     ██║   ██║██║╚██╗██║'
    '   ██║   ██║  ██║███████╗    ███████║██║  ██║███████╗╚██████╔╝██║ ╚████║'
    '   ╚═╝   ╚═╝  ╚═╝╚══════╝    ╚══════╝╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═══╝'

The Salon is an experimental hacker community hub implemented as a retro, terminal-style forum. The interface emulates a classic text terminal complete with boot sequence, sound effects, and customizable color themes. Users interact with the forum entirely through typed commands.

## Current Features

- **Boot sequence** that displays stylized ASCII art and plays startup audio.
- **Command-driven interface** with built-in commands for viewing topics, reading posts, logging in, and more.
- **Article reader pane** that opens selected topics alongside the terminal view.
- **Sound effects** on keypress, successful commands, boot, and errors (can be toggled on or off).
- **Color themes** that change the terminal text and cursor colors.

### Available Commands

```
help             Show a list of commands
topics           List forum topics
read [id]        Read a specific topic by ID
post             Create a new post (requires login)
members          List community members
login [user]     Log in as a user
logout           Log out of the current session
whoami           Display the current user
sound [on|off]   Toggle sound effects
color [theme]    Change the terminal color theme
themes           List available color themes
clear            Clear terminal history
close            Close the article reader pane
exit             Exit the terminal
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm start
   ```
   The application will be available at [http://localhost:3000](http://localhost:3000).

## Development Goals

The Salon aims to provide a nostalgic command-line experience for modern web discussions. It is built with React and Tailwind CSS and currently stores all data locally in memory. Future iterations may include persistent storage, authentication, and networked features to turn it into a fully functional community platform.

## Planned Features

Add your ideas here. Potential improvements include:

- Persistent user accounts and authentication
- Server‑side storage of forum topics
- Real-time chat or notifications
- Additional terminal themes and sounds
