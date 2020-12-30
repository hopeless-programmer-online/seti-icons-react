import { execSync } from 'child_process'

execSync('cd test && npx next build').toString('utf8')
