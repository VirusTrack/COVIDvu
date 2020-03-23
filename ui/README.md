# VirusTrack.live Front-End
The VirusTrack.live front end is built with React. It requires the latest stable version of node and npm to be installed.

## Installing Dependencies
From the `ui/` directory run `npm install`. That's it, easy.

## Running the React Front-End
Same as before, from the `ui/` directory. Replace `$env` with the expected environment you'd like to hit, either `prod`, `staging`, or `local`. And if developing
locally, follow the next section so you can run the proxy server along side the UI.

```
REACT_APP_DEPLOY_ENV=$env npm start
```

## Running locally and proxy
Because CORS is not setup for local development, we have a simple proxy server in the `ui/scripts` directory. Install the dependencies by running

```
npm install
```

From that directory. and to run the server you can execute `npm run server`

When running the UI to hit this local proxy server (which hits the prod data), execute it like this:

```
REACT_APP_DEPLOY_ENV=local npm start
```

## Conclusion
Please let us know if you have any questions, or you'd like to tackle expanding this document in any way. We're definitely open for PRs. Thanks!
