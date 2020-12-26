import * as path from 'path'
import * as fs from 'fs'
import * as fse from 'fs-extra'
import * as icons from '../dist/index'

const br = '\r\n'
const test = path.join(__dirname, '../test')
const root = path.join(test, '/node_modules/seti-icons-react')

if (fs.existsSync(root)) fs.rmSync(root, { recursive : true })

fs.mkdirSync(root, { recursive : true })

fse.copySync(path.join(__dirname, '../package.json'), path.join(root, 'package.json'), { recursive : true })
fse.copySync(path.join(__dirname, '../dist'), path.join(root, 'dist'), { recursive : true })

const index = ''
    + 'import React from "react"' + br
    + (
        Object.keys(icons)
            .map(name => name !== 'React'
                ? `import { ${name} } from "seti-icons-react"${br}`
                : `import { ${name} as ReactIcon } from "seti-icons-react"${br}`
            )
            .join('')
    )
    + '' + br
    + 'export default class Index extends React.Component {' + br
    + '    public render() {' + br
    + '        return (' + br
    + '            <table>' + br
    + '                <caption>ICONS</caption>' + br
    + '                <tbody>' + br
    + (
        Object.keys(icons)
            .map(name => name !== 'React' ? name : 'ReactIcon')
            .map(name => (''
                + '                    <tr>' + br
                + `                        <td>${name}</td>` + br
                + `                        <td style={{ width : "32pt" }}><${name}/></td>` + br
                + '                    </tr>' + br
            ))
            .join('')
    )
    + '                </tbody>' + br
    + '            </table>' + br
    + '        )' + br
    + '    }' + br
    + '}' + br
    + '' + br

fs.writeFileSync(path.join(test, 'pages/index.tsx'), index)
