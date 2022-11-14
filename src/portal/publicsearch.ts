import fetch from 'node-fetch'
import { Collection, Method } from '../base.js'

export interface ICarteenInfoRow {
  name: string
  /** Total seats */
  seat: number
  /** People count */
  ip: number
  warningMsg: string
}

export interface ICarteenInfoResp {
  time: string
  rows: ICarteenInfoRow[]
}

export interface IClassroomInfoRow {
  buildingName: string
  classroomFree: number
  classroomSum: number
}

export interface IClassroomInfoResp {
  success: boolean
  results: number
  rows: IClassroomInfoRow[]
}

@Collection('Portal PublicSearch')
export class PKUPortalPublicSearch {
  @Method('Carteen Infos')
  async carteenInfos() {
    const url = `https://portal.pku.edu.cn/portal2017/publicsearch/canteen/retrCarteenInfos.do`
    const resp = await fetch(url)
    const data = <ICarteenInfoResp>await resp.json()
    return data
  }

  @Method('Classroom Infos')
  async classroomInfos() {
    const url = `https://portal.pku.edu.cn/portal2017/publicsearch/classroom/retrClassRoomInfos.do`
    const resp = await fetch(url)
    const data = <IClassroomInfoResp>await resp.json()
    return data
  }
}
