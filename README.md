# improved-initiative
*Combat tracker for Dungeons and Dragons (D&amp;D) 5th Edition*

The official Improved Initiative app lives at https://www.improved-initiative.com

To run, install node.js and run the following in the cloned directory:

`npm install`

`npm start`

Once the Improved Initiative app is running, the ui can be accessed at <http://localhost>

You can start the dev build process by running `grunt`. This will automatically rebuild the project when you change any typescript files.

Current todos are located [on Trello](https://trello.com/b/q71xURUt/improved-initiative)

Development of Improved Initiative is supported through [Patreon](https://www.patreon.com/improvedinitiative).

## App Settings
You can configure your instance of Improved Initiative with these settings. All are optional, basic functionality should work if you don't specify any.

* `PORT` - Defaults to 80
* `NODE_ENV` - Set to "production" to satisfy react, set to "development" to disable html view caching.
* `BASE_URL` - Used in absolute URLs on client side. Falls back to relative urls if unavailable.
* `SESSION_SECRET` - Used to keep session continuity through app restarts or something. Handed to express-session.
* `DEFAULT_ACCOUNT_LEVEL` - Set to "accountsync" or "epicinitiative" to grant rewards to all users. Useful if you have no DB.  
* `DB_CONNECTION_STRING` - Requires a mongoDB connection string if you'd like to support user accounts
* `KEEN_API_URL`, `KEEN_PROJECT_ID`, `KEEN_READ_KEY`, `KEEN_WRITE_KEY` - Configuration for metrics pipeline
* `PATREON_URL`, `PATREON_CLIENT_ID`, `PATREON_CLIENT_SECRET` - Configuration for Patreon integration
