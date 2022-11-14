import fetch from 'node-fetch'
import { Collection, Method } from './base.js'

@Collection('PKU ITS Utils')
export class PKUIts {
  /**
   * Connect to PKU IP Gateway
   * @param id Student ID or employee ID
   * @param pass The corresponding password
   */
  @Method('Connect to PKU IP Gateway') async connect(id: string, pass: string) {
    // Taken from https://its.pku.edu.cn/download_ipgwclient.jsp
    const url = 'https://its.pku.edu.cn/cas/ITSClient'
    const payload = {
      username: id,
      password: pass,
      iprange: 'free',
      cmd: 'open'
    }
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(payload)
    })
    const data = <Record<string, string>>await resp.json()
    if ('succ' in data) {
      const { SCOPE, CONNECTIONS, BALANCE_EN, IP } = data
      return {
        scope: SCOPE,
        connections: CONNECTIONS,
        balance: BALANCE_EN,
        ip: IP
      }
    }
    throw new Error(data.error ?? 'Failed to connect')
  }

  /**
   * Get the IP address of the current connection
   * @returns The IP address of the current connection
   */
  @Method('Get the IP address of the current connection') async myIP() {
    const url = 'https://its.pku.edu.cn/showMyIP.jsp'
    const resp = await fetch(url)
    const text = await resp.text()
    return text.trim().substring(9)
  }
}
