# improved-initiative

_Combat tracker for Dungeons and Dragons (D&amp;D) 5th Edition_

The official Improved Initiative app lives at https://improvedinitiative.app/

## Local Development

### Requirements

- [Node.js](https://nodejs.org/en/) (see package.json for specific version)

### Setup

- Clone the repo to a folder on your computer
- Open the cloned folder in a code editor such as [Visual Studio Code](https://code.visualstudio.com/)
- Open a terminal window (Powershell is the recommend terminal application for this project)
- Install dependencies and start the development environment:

```
npm install
npm run dev
```

- Visit <http://localhost:3000> in a web browser. Client TypeScript and HTML
  changes reload the page, while LESS changes are injected without a reload.
  Server TypeScript changes restart the server automatically.
- In Visual Studio Code, the `Develop Improved Initiative` launch configuration
  starts the same workflow with the debugger attached to child processes.
- Open5e preloading is skipped by default for a faster startup. Run the server
  separately when developing Open5e behavior.
- To override development server settings, copy `.env.example` to `.env` and
  edit it. The file is optional and ignored by Git. Environment variables set
  in the shell take precedence over `.env`, which takes precedence over the
  development defaults.

Development of Improved Initiative is supported through [Patreon](https://www.patreon.com/improvedinitiative).

To learn more about how to contribute code to Improved Initiative, refer to [CONTRIBUTING.md](./CONTRIBUTING.md).

### Linting

Improved Initiative uses Eslint with prettier to lint the code files.

Linting happens automatically on commit, but you can also run it manually via: `npm run lint`.

### App Settings

You can configure your instance of Improved Initiative with these settings. All are optional, basic functionality should work if you don't specify any.

- `PORT` - Defaults to 80
- `NODE_ENV` - Set to "production" to satisfy react, set to "development" to disable html view caching.
- `BASE_URL` - Used in absolute URLs on client side. Falls back to relative urls if unavailable. This is the canonical URL for Patreon callback and browser localStorage.
- `SESSION_SECRET` - Used to keep session continuity through app restarts or something. Handed to express-session.
- `DEFAULT_ACCOUNT_LEVEL` - Set to "accountsync" or "epicinitiative" to grant rewards to all users. Useful if you have no DB.
- `DEFAULT_PATREON_ID` - Set the dummy Patreon user id when running with `DEFAULT_ACCOUNT_LEVEL` set.
- `DB_CONNECTION_STRING` - Provide a DB connection string for session and user account storage. In memory Mongo DB will be used otherwise, which is cleared on app restart.
- `METRICS_DB_CONNECTION_STRING` - Provide a DB connection string to write metrics to.
- `PATREON_URL`, `PATREON_CLIENT_ID`, `PATREON_CLIENT_SECRET` - Configuration for Patreon integration
- `GOOGLE_ANALYTICS_ID` - GA4 measurement ID used by the browser tag and Measurement Protocol events.
- `GOOGLE_ANALYTICS_API_SECRET` - GA4 Measurement Protocol API secret used for server-side Patreon subscription events.

### Docker

Running Improved Initiative within Docker is possible, but completely optional and currently experimental. Proceed with caution and when in doubt, refer to the [Docker documentation](https://docs.docker.com/).

#### Building the Docker Image

To build the docker image with a development build, run:

`docker build -t improved-initiative:latest .`

To build the image with a production build, run:

`docker build --build-arg NODE_ENV=production -t improved-initiative:prod .`

#### Running the App in a Docker Container

To start the application within the container, run:

`docker run -p80:80 --name improved-initiative improved-initiative:latest`

Or, to run the production build:

`docker run -p80:80 --name improved-initiative improved-initiative:prod`

#### Stopping and Removing the Container

Assuming you started the container with the name `improved-initiative` as shown above, the following commands will stop the container and then remove it:

`docker stop improved-initiative`

`docker rm improved-initiative`

## License

The Improved Initiative app is made available under the [MIT](license) license.
