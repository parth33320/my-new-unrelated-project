# Tandem

A CodePath project scaffold for a Chinese/Japanese word quiz.

**Status: scaffolding only.** React routes render placeholder pages. API routes
are registered but return `501 Not Implemented`. Gameplay, player management,
audio, localStorage persistence, and leaderboard queries are TODOs. The word
dataset is intentionally empty. The schema, database setup scripts, fetch
helper, development proxy, and production static serving are wired up.

## Stack

- React + Vite + React Router; plain CSS
- Node.js + Express + PostgreSQL via `pg`; no ORM
- npm workspaces with `client/` and `server/`

## Start the scaffold

Use Node.js 22.12+ (Node 24 recommended), npm, and PostgreSQL when you are ready
to use the database. Run commands from this folder, alongside `package.json`.

```sh
npm install
npm run dev
```

Open the Vite URL printed in the terminal (normally `http://localhost:5173`).
Express listens on port 3001. Vite proxies `/api` to that port. A database is
not needed to view placeholders or call `GET /api/health`.

## Database setup

1. Copy `server/.env.example` to `server/.env` and set `DATABASE_URL`.
2. Create the database with `createdb tandem` (or use pgAdmin).
3. Run `npm run db:schema` to execute `server/src/db/schema.sql`.
4. Add word objects to `server/data/words.json`.
5. Run `npm run db:seed`.

The seed script clears **only the words table** and inserts the dataset in a
transaction. It refuses to clear the table when the dataset is empty. Players
and scores are preserved. Add at least five true, three false, and two partial
friends before implementing round generation. Use the column names in
`schema.sql` for word fields, and arrays for `jp_reading`, `pinyin`, and
`distractors`. The optional `note` field is for language details needing review.

The schema includes case-insensitive unique usernames and cascading score
deletion. This project intentionally has no authentication; a username is not
proof of identity. Ownership checks and protected accounts are outside this scaffold.

## File structure

```text
client/
  public/sounds/{ja,zh,sfx}/
  src/
    main.jsx, App.jsx
    api/client.js
    context/PlayerContext.jsx
    pages/{Home,Game,Results,Leaderboard,Profile}.jsx
    components/{QuestionCard,RevealCard,Timer,HintBar,RubyText,MuteToggle}.jsx
    hooks/{useTimer,useSound}.js
    utils/scoring.js
    styles/global.css + page/component CSS files
server/
  data/words.json
  src/
    index.js, app.js
    config/scoring.js
    db/{pool.js,schema.sql,migrate.js,seed.js}
    routes/{players,scores,leaderboard,words}.js
    controllers/{players,scores,leaderboard,words}.js
    utils/{buildRound,validation}.js
  .env.example
package.json
render.yaml
```

## Planned API

All feature endpoints below currently return `501`; only health is implemented.

| Method | Endpoint | Intended behavior |
| --- | --- | --- |
| GET | `/api/health` | Health check (implemented) |
| POST | `/api/players` | Create `{ username }`; 201 or 409 |
| GET | `/api/players/:id` | Profile + ten most recent scores; 404 if missing |
| PATCH | `/api/players/:id` | Rename with `{ username }`; 409 if taken |
| DELETE | `/api/players/:id` | Delete player and scores; 204 or 404 |
| GET | `/api/words/round?direction=zh-ja` | Ten questions for a direction |
| POST | `/api/scores` | Save `{ player_id, score, direction }`; 201 |
| GET | `/api/leaderboard?direction=zh-ja` | Each player's best score; top 20 |

Use `validation.js` when implementing controllers and parameterized `$1`, `$2`,
etc. queries through `pool.js`. Directions are `zh-ja` (guess Japanese) and
`ja-zh` (guess Chinese).

## Implementation placeholders

- `buildRound.js`: 5 true / 3 false / 2 partial, shuffled; no false friend first.
- `config/scoring.js`: default points and penalties, round size, and timer length.
- `useTimer.js`: deadline-based 10-second countdown independent of audio.
- `useSound.js`: preload clips and persist mute; tick at 10–6, voice at 5–1.
- `PlayerContext.jsx`: current-player state; localStorage integration is TODO.
- `RubyText.jsx`: chunk arrays; ruby readings are TODO.
- `client/src/utils/scoring.js`: category/sentence penalties before halving.

Add your audio under `client/public/sounds/`: `sfx/tick.mp3`,
`ja/ja_5.mp3` through `ja/ja_1.mp3`, and `zh/zh_5.mp3` through `zh/zh_1.mp3`.
No clips or generated audio are included.

## Production and Render

```sh
npm run build
```

Set `NODE_ENV=production` and run `npm start` to serve `client/dist` through
Express, with React Router fallback. On PowerShell:

```powershell
$env:NODE_ENV = 'production'
npm start
```

Push **the contents of this folder** to your repository. Create a Render
Blueprint from `render.yaml`, which defines an Express web service and a
PostgreSQL database. The build command installs dependencies and builds the
client. The start command applies the schema before starting Express. It never
seeds automatically, so deployments won't erase your word data.

For a manual web service, use `npm ci --include=dev && npm run build` as the
build command and `npm run db:schema && npm start` as the start command. Set
`DATABASE_URL` to your Render database connection string and `NODE_ENV` to
`production`. The API honors Render's `PORT`. If this folder is nested in your
Git repository, set the service's Root Directory to its repository-relative path.

Review Render's current plan limits before provisioning. Seed from an environment
with database access after adding your data. No deployment has been performed.

## Credits and references

- Created as a CodePath student project.
- [React](https://react.dev/), [Vite](https://vite.dev/guide/),
  [React Router](https://reactrouter.com/), and [Express](https://expressjs.com/).
- [node-postgres parameterized queries](https://node-postgres.com/features/queries).
- [Render Express deployment](https://render.com/docs/deploy-node-express-app)
  and [Blueprint reference](https://render.com/docs/blueprint-spec).
- DM Sans, Noto Sans JP, and Noto Sans SC via Google Fonts.
- Word verification and audio recording/source credits: TODO when assets are added.
