import { Child } from '../base.js'
import { PKULibraryApabi } from './apabi.js'

export class PKULibrary {
  @Child() apabi

  constructor() {
    this.apabi = new PKULibraryApabi()
  }
}
