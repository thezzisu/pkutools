#!/usr/bin/env node
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { inspect } from 'util'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import chalk from 'chalk'
import {
  PKU,
  getCollectionDescription,
  getChildren,
  getMethods,
  getMethodDescription,
  getMethodParamTypes
} from './index.js'
import { parseFunctionArgs } from './utils.js'
import type { Argv } from 'yargs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const { version } = JSON.parse(
  readFileSync(join(__dirname, '..', 'package.json'), 'utf8')
)

const pku = new PKU()

// eslint-disable-next-line @typescript-eslint/ban-types
function isSimpleType(meta: Function) {
  return [String, Number, Boolean].some((type) => meta === type)
}

// eslint-disable-next-line @typescript-eslint/ban-types
function getType(meta: Function): 'string' | 'number' | 'boolean' {
  switch (meta) {
    case Number:
      return 'number'
    case Boolean:
      return 'boolean'
  }
  return 'string'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function build(argv: Argv, node: any) {
  const methods = getMethods(node)
  for (const method of methods) {
    const params = parseFunctionArgs(node[method])
    const paramtypes = Reflect.getMetadata('design:paramtypes', node, method)
    const types = getMethodParamTypes(node, method)
    const keys = params.map((_, i) => i)

    argv = argv.command(
      method,
      getMethodDescription(node, method),
      (yargs) =>
        keys.reduce(
          (yargs, key) =>
            yargs.option(params[key], {
              type: getType(paramtypes[key]),
              demandOption: !types[key]?.optional
            }),
          yargs
        ),
      async (argv) => {
        const args = keys.map((key) =>
          isSimpleType(paramtypes[key])
            ? argv[params[key]]
            : JSON.parse(<string>argv[params[key]])
        )
        try {
          const result = await node[method](...args)
          console.log(inspect(result, false, null, true))
          console.log(chalk.greenBright('[+] Success'))
        } catch (e) {
          console.log(e)
          console.log(chalk.redBright(`[!] Failed`))
          process.exit(1)
        }
      }
    )
  }
  const collections = getChildren(node)
  for (const collection of collections) {
    argv = argv.command(
      collection,
      getCollectionDescription(node[collection].constructor),
      (yargs) => build(yargs, node[collection])
    )
  }
  argv = argv.demandCommand()
  return argv
}

const builder = yargs(hideBin(process.argv)).version(version).scriptName('pku')

build(builder, pku).recommendCommands().strict().parse()
