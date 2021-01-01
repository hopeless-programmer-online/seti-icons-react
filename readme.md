# seti-icons-react

![GitHub Workflow Status](https://img.shields.io/github/workflow/status/hopeless-programmer-online/seti-icons-react/Node.js%20CI)
![GitHub package.json version (branch)](https://img.shields.io/github/package-json/v/hopeless-programmer-online/seti-icons-react)
![GitHub](https://img.shields.io/github/license/hopeless-programmer-online/seti-icons-react)

[React](https://github.com/facebook/react)/[TypeScript](https://github.com/microsoft/TypeScript) version of [seti-icons](https://www.npmjs.com/package/seti-icons) used in [Monaco](https://github.com/Microsoft/monaco-editor) editor which powers [Visual Studio Code](https://github.com/Microsoft/vscode).

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

## Themes

Most of the icons in Monaco are used for several purposes. For instance, `TypeScript` icon has different colors for `.ts` and `.test.ts` extensions.
You can switch between these themes using `theme` prop:

```tsx
import { TypeScript } from 'seti-icons-react'

// fill = rgb(38 139 210)
<TypeScript theme="extension/.ts"/>
// fill = rgb(181 137 0)
<TypeScript theme="extension/.test.ts"/>
```

## CSS Render

You can switch between `svg`, `backgroundImage` and `maskImage` render:

```tsx
import { TypeScript } from 'seti-icons-react'

// always visible
<TypeScript render="svg"/>
// not showing on disabled styles
<TypeScript render="backgroundImage"/>
// not showing on disabled styles + fill can be changed via backgroundColor
<TypeScript render="maskImage"/>
```

This way You can change the size of the icons via `backgroundSize` prop.

## Development

Run `npm run build` to generate TypeScript source code and transpile it to JavaScript.
