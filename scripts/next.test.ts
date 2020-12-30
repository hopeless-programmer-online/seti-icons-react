import * as path from 'path'
import { Readable } from 'stream'
import { spawn } from 'child_process'
import puppeteer from 'puppeteer'
import kill from 'kill-with-style'
import { toMatchImageSnapshot } from 'jest-image-snapshot'

expect.extend({ toMatchImageSnapshot });

async function wait(stream : Readable, sequence : string) {
    return new Promise<void>(resolve => {
        let length = 0

        function listener(data : string) {
            data = String(data)

            for (const x of data) {
                if (x !== sequence[length]) {
                    length = 0

                    continue
                }

                ++length

                if (length >= sequence.length) {
                    stream.removeListener('data', listener)
                    resolve()
                }
            }
        }

        stream.addListener('data', listener)
    })
}

it('Should be compatible with next.js', async () => {
    const port = 3001
    const test = JSON.stringify(path.join(__dirname, '../test'))
    const next = JSON.stringify(path.join(__dirname, '../node_modules/.bin/next'))
    const server = spawn(`cd ${test} && ${next} start -p ${port}`, { shell : true })

    // server.stdin.addListener('data', x => console.log(`in : ${x.toString('utf8')}`))
    // server.stdout.addListener('data', x => console.log(`out : ${x.toString('utf8')}`))
    // server.stderr.addListener('data', x => console.error(`error : ${x.toString('utf8')}`))

    const exit = new Promise<void>(resolve => server.on('exit', resolve))
    const close = new Promise<void>(resolve => server.on('close', resolve))

    await wait(server.stdout, `ready - started server on http://localhost:${port}`)

    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    await page.goto(`http://localhost:${port}`)

    const screenshot = await page.screenshot({ fullPage : true })

    await browser.close()

    expect(screenshot).toMatchImageSnapshot()

    await new Promise(resolve => kill(server.pid, {}, resolve))

    await exit
    await close
}, 60*1000)
