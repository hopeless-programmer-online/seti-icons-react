import * as path from 'path'
import * as fs from 'fs'
import { js2xml, xml2js, Element, ElementCompact } from 'xml-js'
import svgs from 'seti-icons/lib/icons.json'
import definitions from 'seti-icons/lib/definitions.json'
import { default as colorsMapping } from './colors.json'
import { default as namesMapping } from './names.json'
import convert from 'react-attr-converter'

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
            for (const name in attributes) {
                let value = attributes[name]

                // workarounds for code-search icon
                if (name === 'stroke-linecap' && value === 'null') value = 'inherit'
                if (name === 'stroke-linejoin' && value === 'null') value = 'inherit'

                delete attributes[name]

                attributes[convert(name)] = value
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
function buildComponent(fills : Fills) {
    const component = ''
        + 'import React from "react"' + br
        + 'import Icon from "./icon"' + br
        + '' + br
        + 'const fill = {' + br
        + (
            Object.entries(fills).map(([ name, color ]) =>
                `    ${JSON.stringify(name)} : ${JSON.stringify(color)},${br}`
            ).join('')
        )
        + '}' + br
        + 'type Fill = keyof typeof fill' + br
        + 'type Props = {' + br
        + '    fill? : Fill,' + br
        + '}' + br
        + '' + br
        + `export default class Component extends React.Component<Props> {` + br
        + `    public static fill = fill` + br
        + `    public static defaultProps = {` + br
        + `        fill : "default",` + br
        + `    }` + br
        + `` + br
        + `    public render() {` + br
        + `        return (` + br
        + `            <Icon fill={fill[this.props.fill]}/>` + br
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
            for (const name in attributes) {
                let value = attributes[name]

                // workarounds for code-search icon
                if (name === 'stroke-linecap' && value === 'null') value = 'inherit'
                if (name === 'stroke-linejoin' && value === 'null') value = 'inherit'

                delete attributes[name]

                attributes[convert(name)] = value
            }
        }
    }

    iterate(xml)

    const { attributes } = xml.elements[0]

    xml.elements[0].attributes = {}

    const fills = findFills(name)

    const component = ''
        + 'import React, { ComponentProps, SVGProps } from "react"' + br
        + '' + br
        + 'const theme = {' + br
        + (
            Object.entries(fills).map(([ name, color ]) =>
                `    ${JSON.stringify(name)} : ${JSON.stringify(color)},${br}`
            ).join('')
        )
        + '}' + br
        + 'type Theme = keyof typeof theme | null' + br
        + 'type Props = ComponentProps<"svg"> & {' + br
        + '    theme? : Theme,' + br
        + '}' + br
        + '' + br
        + 'export default class Component extends React.Component<Props> {' + br
        + `    public static theme = theme` + br
        + '    public static defaultProps = {' + br
        + `        theme : null,` + br
        + '    }' + br
        + '' + br
        + '    public render() {' + br
        + '        const props : SVGProps<SVGSVGElement> | { [key: string] : string } = {' + br
        + '            ...this.props,' + br
        +(
            Object.entries(attributes)
                .map(([ key, value ]) => `            ${JSON.stringify(key)}: ${JSON.stringify(value)},${br}`)
                .join('')
        )
        + '        }' + br
        + '        ' + br
        + '        const { theme } = this.props' + br
        + '        ' + br
        + '        if (theme) props.fill = Component.theme[theme]' + br
        + '        ' + br
        + '        return (' + br
        + (
            '            ' +
            js2xml(xml, { spaces : 4 })
                .replace(/^<svg>/, '<svg {...props}>')
                .replace(/\n/g, '\n            ')
        ) + br
        + '        )' + br
        + '    }' + br
        + '}' + br

    const file = path.join(src, name, `component.tsx`)
    const folder = path.dirname(file)

    fs.mkdirSync(folder, { recursive : true })
    fs.writeFileSync(file, component)
}

fs.writeFileSync(path.join(src, 'index.ts'),
    Object.keys(svgs).map(name =>
        `export { default as ${namesMapping[name] || name} } from ${JSON.stringify(`./${name}/component`)}${br}`
    ).join('')
)
