# Dumbal, Nepali Card Game

Another card game to play online while visiting in person is difficult!

- [Known Issues](#known-issues)
- [Getting Started (Developers)](#getting-started-developers)

## Known Issues

Occasionally the socket connection times out. When this happens you'll need to refresh your page.
If you have installed this as a progressive web app (PWA) then you can click on the scoreboard to
find a "refresh state" option which is equivalent.

## Getting Started (Developers)

This project uses [redis](https://redis.io/), [socket.io](https://socket.io/), and [React.js](https://reactjs.org/).

Before the server can be run redis should be installed and the redis server running

```bash
redis-server
```

Next build the server and start it

```bash
npm run build:server:dev
```

and

```bash
npm start
```

And then the client development server (webpack)

```bash
npm run start:dev
```

The client can now be viewed in the browser at [http://localhost:3000](http://localhost:3000).
