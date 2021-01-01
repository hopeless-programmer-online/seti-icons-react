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

const br = '\r\n'
const xmlns = {
    'xmlns' : 'http://www.w3.org/2000/svg',
    'xmlns:xlink' : 'http://www.w3.org/1999/xlink',
}
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
    const xml2 = JSON.parse(JSON.stringify(xml))

    xml.elements[0].attributes = { ...attributes, ...xmlns }
    xml2.elements[0].attributes = {}

    const fills = findFills(name)

    const component = ''
        + 'import React, { ComponentProps, SVGProps } from "react"' + br
        + '' + br
        + 'const theme = {' + br
        + (
            Object.entries(fills).map(([ name, color ]) =>
                `    ${ JSON.stringify(name) } : ${ JSON.stringify(color) },${br}`
            ).join('')
        )
        + '}' + br
        + 'type Theme = keyof typeof theme | null' + br
        + 'type Render = "svg" | "css"' + br
        + 'type Props = ComponentProps<"svg"> & {' + br
        + '    theme? : Theme,' + br
        + '    render? : Render,' + br
        + '}' + br
        + '' + br
        + 'export default class Component extends React.Component<Props> {' + br
        + `    public static theme = theme` + br
        + '    public static defaultProps = {' + br
        + `        theme : null,` + br
        + `        render : "svg",` + br
        + '    }' + br
        + '' + br
        + '    public render() {' + br
        + '        const { render, theme } = this.props' + br
        + '' + br
        + '        if (render === "css") {' + br
        + '            const { backgroundSize } = this.props.style || {}' + br
        + '            const width = this.props.width != undefined ? this.props.width : backgroundSize' + br
        + '            const height = this.props.height != undefined ? this.props.height : backgroundSize' + br
        + `            const backgroundImage = \`url(\${ JSON.stringify(\`data:image/svg+xml,${
            js2xml(xml)
        }\`) })\`` + br
        // + '                .replace(/<svg/, `<svg fill=${ JSON.stringify(Component.theme[theme] || "") }`)' + br
        + '' + br
        + '            return (' + br
        + '                <span' + br
        + '                    style={{' + br
        + '                        width,' + br
        + '                        height,' + br
        + '                        backgroundImage,' + br
        + '                        backgroundRepeat : "no-repeat",' + br
        + '                        backgroundPosition : "center",' + br
        + '                        display : "inline-block",' + br
        + '                        ...this.props as ComponentProps<"span">,' + br
        + '                    }}' + br
        + '                />' + br
        + '            )' + br
        + '        }' + br
        + '' + br
        + '        const props : SVGProps<SVGSVGElement> | { [key: string] : string } = {' + br
        + '            ...this.props,' + br
        +(
            Object.entries(attributes)
                .map(([ key, value ]) => `            ${ JSON.stringify(key) }: ${ JSON.stringify(value) },${br}`)
                .join('')
        )
        + '        }' + br
        + '' + br
        + '        if (theme) props.fill = Component.theme[theme]' + br
        + '' + br
        + '        return (' + br
        + (
            '            ' +
            js2xml(xml2, { spaces : 4 })
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
