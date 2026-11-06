import { readdirSync, readFileSync } from 'node:fs'

const REQUIRED = [
    'name', 'namespace', 'version', 'description', 'author', 'match', 'grant',
    'license', 'copyright', 'homepageURL', 'supportURL', 'downloadURL', 'updateURL',
]

const files = readdirSync('.').filter((f) => f.endsWith('.user.js')).sort()
const errors = []

for (const file of files) {
    const text = readFileSync(file, 'utf8')
    const block = text.match(/\/\/ ==UserScript==([\s\S]*?)\/\/ ==\/UserScript==/)
    if (!block) {
        errors.push(`${file}: no ==UserScript== block`)
        continue
    }
    const meta = {}
    for (const [, key, value] of block[1].matchAll(/^\/\/ @(\S+)[ \t]*(.*)$/gm)) {
        ;(meta[key] ??= []).push(value.trim())
    }
    for (const key of REQUIRED) {
        if (!meta[key]?.[0]) errors.push(`${file}: missing @${key}`)
    }
    const expectedName = file.slice(0, -'.user.js'.length)
    if (meta.name && meta.name[0] !== expectedName) {
        errors.push(`${file}: @name "${meta.name[0]}" does not match the file name`)
    }
    for (const key of ['downloadURL', 'updateURL']) {
        const url = meta[key]?.[0]
        if (url && !url.endsWith(`/${encodeURIComponent(file)}`)) errors.push(`${file}: @${key} points to another file`)
    }
}

if (errors.length) {
    console.error(errors.join('\n'))
    process.exit(1)
}
console.log(`Headers OK in ${files.length} scripts`)
