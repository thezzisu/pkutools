import 'reflect-metadata'
import { Child } from './base.js'
import { PKUIts } from './its.js'
import { PKUPortal } from './portal/index.js'
import { PKUPractice } from './practice/index.js'

export class PKU {
  @Child() its
  @Child() portal
  @Child() practice

  constructor() {
    this.its = new PKUIts()
    this.portal = new PKUPortal()
    this.practice = new PKUPractice()
  }
}

export * from './base.js'
export * from './its.js'
