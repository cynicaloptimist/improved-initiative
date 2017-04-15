# Contributing to Improved Initiative

Thanks for your interest in contributing to Improved Initiative! It means a lot to me that you'd like to spend your time to help me build this project, and I'd be happy to review any issues or pull requests you'd like to submit.

If this is your first time contributing to an open source project, don't sweat it. It's my first time maintaining an open source project. We'll learn together- look over [this article](https://opensource.guide/how-to-contribute/) for some general advice.

I'll try to provide a short list of guidelines here (adapted from [TypeScript Coding Guidelines](https://github.com/Microsoft/TypeScript/wiki/Coding-guidelines)). This is not an exhaustive guide, so please be willing to make requested modifications to your code.

## General
* Link your pull request to at least one open issue (ideally exactly one).
* When appropriate, encapsulate your code in its own class, in its own file.
* Don't add any game content that isn't covered by the [Open-Gaming License](http://dnd.wizards.com/articles/features/systems-reference-document-srd).

## Names
* Use PascalCase for type names and public methods.
* Do not use "I" as a prefix for interface names.
* Use camelCase for local variables and private properties.
* Do not use "_" as a prefix for private properties.
* Use whole words in names when possible.

## Style
* Use arrow functions over anonymous function expressions.
* Only surround arrow function parameters when necessary. 
For example, (x) => x + x is wrong but the following are correct:
`x => x + x`
`(x,y) => x + y`
`<T>(x: T, y: T) => x === y`
* Use const whenever possible.
* Always surround loop and conditional bodies with curly braces.
* Open curly braces always go on the same line as whatever necessitates them.
* Parenthesized constructs should have no surrounding whitespace. 
* A single space follows commas, colons, and semicolons in those constructs. For example:
`for (var i = 0, n = str.length; i < 10; i++) { }`
`if (x < 10) { }`
`function f(x: number, y: string): void { }`
* Don't inline code, if you can help it. This includes:
    * Don't use html `style` attributes
    * Put JSON structures in their own file
    * Encapsulate html in templates