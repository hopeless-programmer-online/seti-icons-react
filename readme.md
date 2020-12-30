# seti-icons-react

[React](https://github.com/facebook/react)/[TypeScript](https://github.com/microsoft/TypeScript) version of [seti-icons](https://www.npmjs.com/package/seti-icons) used in [Monako](https://github.com/Microsoft/monaco-editor) editor which powers [Visual Studio Code](https://github.com/Microsoft/vscode).

## Usage

Install the package from GitHub:

```
npm i hopeless-programmer-online/seti-icons-react#development
```

Then import required icons from it:

```typescript
import { TypeScript, ReactIcon } from 'seti-icons-react'

class MyComponent extends React.Component {
    render() {
        return (
            <figure>
                <figcaption>
                    Hello, TypeScript & React!
                </figcaption>

                <TypeScript/>
                <ReactIcon/>
            </figure>
        )
    }
}
```

## Development

Run `npm run build` to generate TypeScript source code and transpile it to JavaScript.
