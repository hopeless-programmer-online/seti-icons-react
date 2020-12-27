import * as path from 'path'
import * as fs from 'fs'
import * as fse from 'fs-extra'

const br = '\r\n'
const test = path.join(__dirname, '../test')
const root = path.join(test, '/node_modules/seti-icons-react')

if (fs.existsSync(root)) fs.rmSync(root, { recursive : true })

fs.mkdirSync(root, { recursive : true })

fse.copySync(path.join(__dirname, '../package.json'), path.join(root, 'package.json'), { recursive : true })
fse.copySync(path.join(__dirname, '../dist'), path.join(root, 'dist'), { recursive : true })
