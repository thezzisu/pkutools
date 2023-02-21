import 'reflect-metadata'
import { Child } from './base.js'
import { PKUIts } from './its.js'
import { PKULibrary } from './library/index.js'
import { PKUPortal } from './portal/index.js'
import { PKUPractice } from './practice/index.js'

export class PKU {
  @Child() its
  @Child() portal
  @Child() practice
  @Child() library

  constructor() {
    this.its = new PKUIts()
    this.portal = new PKUPortal()
    this.practice = new PKUPractice()
    this.library = new PKULibrary()
  }
}

export * from './base.js'
export * from './its.js'
