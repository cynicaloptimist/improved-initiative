# improved-initiative

*Combat tracker for Dungeons and Dragons (D&amp;D) 5th Edition*

The official Improved Initiative app lives at https://www.improved-initiative.com

## Local Development

### Requirements

- node.js
- npm

### Setup

- `npm install
- `npm run build`
- `npm run start`

Once the Improved Initiative app is running, the ui can be accessed at <http://localhost>

You can also start the dev build process by running `grunt`. This will automatically rebuild the project when you change any TypeScript or LessCSS files.

Development of Improved Initiative is supported through [Patreon](https://www.patreon.com/improvedinitiative).

Refer to **CONTRIBUTING.md** if you'd like to contribute code.

### Linting

Improved Initiative uses Eslint with prettier to lint the code files.

Linting happens automatically on commit, but you can also run it manually via: `npm run lint`.

### App Settings
You can configure your instance of Improved Initiative with these settings. All are optional, basic functionality should work if you don't specify any.

* `PORT` - Defaults to 80
* `NODE_ENV` - Set to "production" to satisfy react, set to "development" to disable html view caching.
* `BASE_URL` - Used in absolute URLs on client side. Falls back to relative urls if unavailable. This is the canonical URL for Patreon callback and browser localStorage.
* `SESSION_SECRET` - Used to keep session continuity through app restarts or something. Handed to express-session.
* `DEFAULT_ACCOUNT_LEVEL` - Set to "accountsync" or "epicinitiative" to grant rewards to all users. Useful if you have no DB.
* `DEFAULT_PATREON_ID` - Set the dummy Patreon user id when running with `DEFAULT_ACCOUNT_LEVEL` set.
* `DB_CONNECTION_STRING` - Provide a DB connection string for session and user account storage. In memory Mongo DB will be used otherwise, which is cleared on app restart.
* `METRICS_DB_CONNECTION_STRING` - Provide a DB connection string to write metrics to.
* `PATREON_URL`, `PATREON_CLIENT_ID`, `PATREON_CLIENT_SECRET` - Configuration for Patreon integration

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
