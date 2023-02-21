import { execSync, spawnSync } from 'child_process'
import fetch from 'node-fetch'
import { dirSync } from 'tmp'
import ProgressBar from 'progress'
import { writeFileSync } from 'fs'
import { Collection, Method } from '../base.js'
import { join } from 'path'

function getImageMagickName() {
  if (process.platform === 'win32') {
    return 'magick'
  }
  return 'convert'
}

const MAGICK = getImageMagickName()

function checkImageMagick() {
  try {
    execSync(`${MAGICK} -version`)
  } catch (e) {
    console.error('ImageMagick is not installed')
    console.error('For windows users:')
    console.error('  winget install -e --id ImageMagick.ImageMagick')
    console.error('For mac users:')
    console.error('  brew install imagemagick')
    process.exit(1)
  }
}

@Collection('中华数字书苑下载')
export class PKULibraryApabi {
  @Method('Download')
  async download(info: string) {
    checkImageMagick()
    const data = JSON.parse(Buffer.from(info, 'base64url').toString('utf8'))
    const { total, target } = data
    const dir = dirSync()
    const tmp = dir.name

    const url = new URL(target)
    const bar = new ProgressBar(':bar', { total })
    const cmd = []
    for (let i = 1; i <= total; i++) {
      url.searchParams.set('page', '' + i)
      const resp = await fetch(url.toString())
      const buffer = await resp.arrayBuffer()
      const dist = join(tmp, `${i}.jpg`)
      writeFileSync(dist, Buffer.from(buffer))
      cmd.push(dist)
      bar.tick()
    }
    cmd.push('-quality', '60', 'output.pdf')
    const { status } = spawnSync(MAGICK, cmd, { stdio: 'inherit' })
    console.log('done with status ' + status)
  }
}
