# seti-icons-react

![GitHub Workflow Status](https://img.shields.io/github/workflow/status/hopeless-programmer-online/seti-icons-react/Node.js%20CI)
![GitHub package.json version (branch)](https://img.shields.io/github/package-json/v/hopeless-programmer-online/seti-icons-react)

[React](https://github.com/facebook/react)/[TypeScript](https://github.com/microsoft/TypeScript) version of [seti-icons](https://www.npmjs.com/package/seti-icons) used in [Monako](https://github.com/Microsoft/monaco-editor) editor which powers [Visual Studio Code](https://github.com/Microsoft/vscode).

## Usage

Install the package from GitHub:

```
npm i seti-icons-react
```

Then import required icons from it:

```tsx
import { TypeScript } from 'seti-icons-react'

class MyComponent extends React.Component {
    render() {
        return (
            <figure>
                <figcaption>
                    Hello, TypeScript!
                </figcaption>

                <TypeScript theme="extension/.ts"/>
            </figure>
        )
    }
}
```

## Development

Run `npm run build` to generate TypeScript source code and transpile it to JavaScript.
