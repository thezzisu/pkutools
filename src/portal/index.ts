import { Child } from '../base.js'
import { PKUPortalPublicSearch } from './publicsearch.js'

export class PKUPortal {
  @Child() publicsearch

  constructor() {
    this.publicsearch = new PKUPortalPublicSearch()
  }
}
