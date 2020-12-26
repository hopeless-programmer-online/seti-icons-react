import * as path from 'path'
import * as fs from 'fs'
import { js2xml, xml2js, Element, ElementCompact } from 'xml-js'
import svgs from 'seti-icons/lib/icons.json'
import definitions from 'seti-icons/lib/definitions.json'
import { default as colorsMapping } from './colors.json'
import { default as namesMapping } from './names.json'

type Fills = { [key : string] : string }

function mapColor(color : string) {
    return colorsMapping[color] || 'black'
}
function findFills(name : string) : Fills {
    const extensions = {};

    for (const [ ext, [ svg, color ] ] of Object.entries(definitions.extensions)) {
        if (svg === name) extensions[ext] = mapColor(color)
    }

    const files = {};

    for (const [ file, [ svg, color ] ] of Object.entries(definitions.files)) {
        if (svg === name) files[file] = mapColor(color)
    }

    const partials = {};

    for (const [ partial, [ svg, color ] ] of Object.entries(definitions.files)) {
        if (svg === name) partials[partial] = mapColor(color)
    }

    return {
        ...Object.entries(extensions).reduce((all, [ name, fill ]) => ({ ...all, [`extension/${name}`] : fill }), {}),
        ...Object.entries(files).reduce((all, [ name, fill ]) => ({ ...all, [`file/${name}`] : fill }), {}),
        ...Object.entries(partials).reduce((all, [ name, fill ]) => ({ ...all, [`partial/${name}`] : fill }), {}),
        default : mapColor(definitions.default[1]),
    };
}
function buildIcon(svg : string) {
    const xml = xml2js(svg, { alwaysArray : true })

    function iterate(element : Element | ElementCompact) {
        const { elements, attributes } = element

        if (elements) elements.forEach(element => {
            if (element.type !== 'text') {
                iterate(element)

                return
            }

            element.text = `{${JSON.stringify(element.text)}}`
        })

        if (attributes) {
            if (attributes.class) {
                attributes.className = attributes.class

                delete attributes.class
            }
        }
    }

    iterate(xml)

    xml.elements[0].attributes = {
        ...xml.elements[0].attributes,
        fill : '%FILL%',
    }

    const component = ''
        + 'import React from "react"' + br
        + '' + br
        + 'export type Props = {' + br
        + '    fill? : string,' + br
        + '}' + br
        + '' + br
        + 'export default class Icon extends React.Component<Props> {' + br
        + `    public static defaultProps = {` + br
        + `        fill : undefined,` + br
        + `    }` + br
        + `    ` + br
        + `    public render() {` + br
        + `        const { fill } = this.props` + br
        + `        ` + br
        + `        return (` + br
        + (
            '            // ' + svg + br +
            '            ' +
            js2xml(xml, { spaces : 4 })
                .replace(/\n/g, '\n            ')
                .replace(/"%FILL%"/, '{fill}')
        ) + br
        + `        )` + br
        + `    }` + br
        + '}' + br

    return component
}
function buildComponent(name : string, fills : Fills) {
    let className = namesMapping[name] || name

    if (className === 'React') className = 'ReactIcon'

    const component = ''
        + 'import React from "react"' + br
        + 'import Icon from "./icon"' + br
        + '' + br
        + 'export type Fill =' + br
        + (
            Object.keys(fills).map(fill =>
                `    | ${JSON.stringify(fill)}${br}`
            ).join('')
        )
        + 'export type Props = {' + br
        + '    fill? : Fill,' + br
        + '}' + br
        + '' + br
        + 'export const fillLookup = {' + br
        + (
            Object.entries(fills).map(([ name, color ]) =>
                `    ${JSON.stringify(name)} : ${JSON.stringify(color)},${br}`
            ).join('')
        )
        + '}' + br
        + '' + br
        + `export default class ${className} extends React.Component<Props> {` + br
        + `    public static defaultProps = {` + br
        + `        fill : undefined,` + br
        + `    }` + br
        + `` + br
        + `    public render() {` + br
        + `        const fill = fillLookup[this.props.fill]` + br
        + `        ` + br
        + `        return (` + br
        + `            <Icon fill={fill}/>` + br
        + `        )` + br
        + `    }` + br
        + '}' + br

    return component
}

const br = '\r\n'
const src = path.join(__dirname, '../src')

if (fs.existsSync(src)) fs.rmSync(src, { recursive : true })

fs.mkdirSync(src)

for (const [ name, svg ] of Object.entries(svgs)) {
    const folder = path.join(src, name)

    fs.mkdirSync(folder)

    const icon = buildIcon(svg)

    fs.writeFileSync(path.join(folder, 'icon.tsx'), icon)

    const fills = findFills(name)
    const component = buildComponent(name, fills)

    fs.writeFileSync(path.join(folder, 'component.tsx'), component)
}

fs.writeFileSync(path.join(src, 'index.ts'),
    Object.keys(svgs).map(name =>
        `export { default as ${namesMapping[name] || name} } from ${JSON.stringify(`./${name}/component`)}${br}`
    ).join('')
)
