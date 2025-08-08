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
After cloning, go to each of the project folders (client and server) and run the following commands:

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm start
   ```
   The application will be available at [http://localhost:3000](http://localhost:3000).
   
3. Install the resources:  
   You will also need to install [postgresql](https://www.postgresql.org/download/) and [pgadmin4](https://www.pgadmin.org/download/) in order to set up the database locally.
     
5. Create the database:  
   Once those have been installed, connect your pgadmin to your postgresql server and create a database named "the_salon"
   

## SQL Code for Local DB
Here are the table creations needed so far in order to properly utilize the local postgres database:

### Users table
```SQL
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'user',
  status VARCHAR(20) DEFAULT 'active',
  bio TEXT DEFAULT '',
  join_date TIMESTAMP NOT NULL,
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```
### Posts table
```SQL
CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(100) NOT NULL REFERENCES users(username),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### If you run into a server error
There is a common error in the authentication of the 'postgres' user. If this happens, please follow the guidance of this Stack Overflow post: https://stackoverflow.com/questions/55038942/fatal-password-authentication-failed-for-user-postgres-postgresql-11-with-pg

## Development Goals

The Salon aims to provide a nostalgic command-line experience for modern web discussions. It is built with React and Tailwind CSS and currently stores all data locally in memory. Future iterations may include persistent storage, authentication, and networked features to turn it into a fully functional community platform.




## Planned Features

- Persistent user accounts and authentication [CHECK]
- Server‑side storage of forum topics [CHECK]
- Real-time chat or notifications
- Additional terminal themes and sounds
