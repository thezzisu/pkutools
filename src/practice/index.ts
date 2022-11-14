import { Child, Collection } from '../base.js'
import { PKUNELETCourse } from './nelet.js'

@Collection('思政实践相关')
export class PKUPractice {
  @Child() nelet

  constructor() {
    this.nelet = new PKUNELETCourse()
  }
}
