# Contributing to Improved Initiative

Thanks for your interest in contributing to Improved Initiative! It means a lot to me that you'd like to spend your time to help me build this project, and I'd be happy to review any issues or pull requests you'd like to submit.

If this is your first time contributing to an open source project, don't sweat it. It's my first time maintaining an open source project. We'll learn together- look over [this article](https://opensource.guide/how-to-contribute/) for some general advice.

## Guidelines
Here is a short list of coding guidelines (adapted from [TypeScript Coding Guidelines](https://github.com/Microsoft/TypeScript/wiki/Coding-guidelines)). This is not an exhaustive guide, so please be willing to make requested modifications to your code.

### General
* Open pull requests against the `development` branch.
* Link your pull request to an open [issue](https://github.com/cynicaloptimist/improved-initiative/labels/help%20wanted) with the `help wanted` tag.
* If there is no open issue for your PR, open one first for discussion and approval before submitting any code.
* Include at least one test for your code.
* When appropriate, encapsulate your code in its own class, in its own file.
* Don't add any game content that isn't covered by the [Open-Gaming License](http://dnd.wizards.com/articles/features/systems-reference-document-srd).
* Ensure your PR is deploy-ready, as `development` auto-deploys to the [public dev server](http://improved-initiative-dev.azurewebsites.net/)

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
