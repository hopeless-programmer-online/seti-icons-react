import * as path from 'path'
import * as fs from 'fs'
import { js2xml, xml2js, Element, ElementCompact } from 'xml-js'
import * as svgs from 'seti-icons/lib/icons.json'
import * as definitions from 'seti-icons/lib/definitions.json'
import * as colorsMapping from './colors.json'

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
function buildComponent(fills : Fills) {
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
        + '    fill : Fill,' + br
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
        + 'export default class Component extends React.Component<Props> {' + br
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
    const component = buildComponent(fills)

    fs.writeFileSync(path.join(folder, 'component.tsx'), component)
}
