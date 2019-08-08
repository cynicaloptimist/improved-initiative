# Contributing to Improved Initiative

Thanks for your interest in contributing to Improved Initiative! It means a lot to me that you'd like to spend your time to help me build this project, and I'd be happy to review any issues or pull requests you'd like to submit.

If this is your first time contributing to an open source project, don't sweat it. It's my first time maintaining an open source project. We'll learn together- look over [this article](https://opensource.guide/how-to-contribute/) for some general advice.

## Getting Started
Evan uses and recommends [Visual Studio Code](https://code.visualstudio.com/) when developing Improved Initiative. You can hit F5 and accept the default Node.js environment to get the server running. You can set environment variables as described in the README in this default launch.json.

Most of the Typescript code for the frontend lives in `/client/`. Everything is in the process of gradually being migrated to React, so use React components in .tsx files when possible.

The backend lives in `/server/`. It's also Typescript, but it has its own build step. The server must be restarted to take new builds.

Shared data structures are located in `/common/`. Any interfaces in this folder are saved to localstorage or databases, so only make additive, backwards-compatible changes to them and consider backwards compatability when handling them.

## Guidelines
Here is a short list of coding guidelines (adapted from [TypeScript Coding Guidelines](https://github.com/Microsoft/TypeScript/wiki/Coding-guidelines)). This is not an exhaustive guide, so please be willing to make requested modifications to your code.

### General
* Open pull requests against the `development` branch.
* Link your pull request to an open [issue](https://github.com/cynicaloptimist/improved-initiative/labels/help%20wanted) with the `help wanted` tag.
* Include at least one test for your code.
* Don't add any game content that isn't covered by the [Open-Gaming License](http://dnd.wizards.com/articles/features/systems-reference-document-srd).

**I'm happy to provide guidance on how to approach any open issue.**

### Names
* Use whole words, not abbreviations, in names.
* Use PascalCase for type names and public methods.
* Do not use "I" as a prefix for interface names.
* Use camelCase for local variables and private properties.
* Do not use "_" as a prefix for private properties.

## Epic Initiative
While Improved Initiative is open source, the MIT license allows anyone to use this code to make a profit. I've chosen to make a subset of the app's features available as rewards to [Patreon](https://www.patreon.com/improvedinitiative) subscribers as "Epic Initiative". At the time of this writing, this mainly covers cosmetic benefits associated with the Player View such as custom CSS. As the license indicates, you are always free to run your own instance of Improved Initiative and modify this functionality to meet your needs.

### thanks.ts
Epic Initiative is also granted to the app's GitHub contributors. If you contribute a substantial pull request, please add your name/alias, Github URL, and Patreon ID to `thanks.ts`. Patreon doesn't surface your Patreon Id anywhere in their UI as far as I can tell, but you can find it by inspecting any Patreon link to your profile.
