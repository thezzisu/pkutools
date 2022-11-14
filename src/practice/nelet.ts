/* eslint-disable @typescript-eslint/no-explicit-any */
import chalk from 'chalk'
import fetch from 'node-fetch'
import { Collection, Method, Optional } from '../base.js'
import { ask } from '../utils.js'

export interface NELETOptions {
  cookie: string
  userId: string
  coursePacketClassId: string
  coursePacketId: string
  name: string
}

export async function quickFinish(options: NELETOptions) {
  const COOKIE = options.cookie
  const USER_ID = options.userId
  const COURSE_PACKET_CLASS_ID = options.coursePacketClassId
  const COURSE_PACKET_ID = options.coursePacketId
  const NAME = options.name

  function encode(obj: any) {
    return Object.entries(obj)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
      )
      .join('&')
  }

  function getTime(date = Date.now()) {
    const [, d, t] = <any>/^(.+)T(.+)\./.exec(new Date(date).toISOString())
    return `${d} ${t}`
  }

  async function _invoke(url: string, body: any, method = 'POST') {
    console.log(`${chalk.green('INVOKE')} ${url}`)
    // console.log(
    //   encode(body)
    //     .split('&')
    //     .map((l) => l.split('=').map(decodeURIComponent).join('='))
    //     .map((l) => `${chalk.gray('DEBUG')} ${l}`)
    //     .join('\n')
    // )
    return fetch(url, {
      headers: {
        accept: '*/*',
        'accept-language': 'en,zh-CN;q=0.9,zh-Hans;q=0.8,zh;q=0.7,ja;q=0.6',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'x-requested-with': 'XMLHttpRequest',
        cookie: COOKIE,
        Referer:
          'http://www.pupedu.cn/app/coursepacket/student/toCoursePacketDetail',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      },
      body: body ? encode(body) : body,
      method
    })
  }

  async function invoke(url: string, body: any, method = 'POST'): Promise<any> {
    const res = await _invoke(url, body, method)
    const data: any = await res.json()
    console.log(`${chalk.green('INVOKE RESULT MSG')} ${data?.message ?? 'OK'}`)
    return data
  }

  async function invokeAsText(url: string, body: any, method = 'POST') {
    const res = await _invoke(url, body, method)
    console.log(chalk.green('INVOKE RESULT CODE ') + res.status)
  }

  const { data } = await invoke(
    'http://www.pupedu.cn/app/coursepacket/student/getDirectoryList',
    {
      coursePacketID: COURSE_PACKET_ID,
      parentID: '0',
      sub: '1',
      coursePacketClassId: COURSE_PACKET_CLASS_ID,
      userId: USER_ID
    }
  )
  for (const dir of data) {
    const { cascadeID, coursePacketID, name } = dir
    console.log(`${chalk.blue('INFO')} GROUP ${chalk.whiteBright(name)}`)
    const { data } = await invoke(
      'http://www.pupedu.cn/app/coursepacket/student/getDirectoryResourceList',
      {
        directoryId: cascadeID,
        pageNum: '1',
        pageSize: '1000',
        coursePackId: coursePacketID,
        userId: USER_ID,
        coursePacketClassId: COURSE_PACKET_CLASS_ID
      }
    )
    for (const file of data) {
      const { coursePacketID, directoryCasecadeID, ext, id, name } = file
      console.log(`${chalk.blue('INFO')} ${name}`)
      const viewUrl = `http://www.pupedu.cn/app/coursepacket/student/toCoursePacketResDetail?id=${id}&dirId=${directoryCasecadeID}&pId=${coursePacketID}&cId=${COURSE_PACKET_CLASS_ID}&from=`
      console.log(`${chalk.blue('INFO')} View at ${viewUrl}`)
      try {
        let type = 'UNKNOWN'
        if (['MP4'].includes(ext)) type = 'VIDEO_AUDIO_TYPE'
        if (['PPTX'].includes(ext)) type = 'IMAGES_TYPE'
        if (type === 'UNKNOWN') {
          console.log(`${chalk.yellow('WARN')} Unknown type ${ext}`)
          continue
        }
        const { data } = await invoke(
          'http://www.pupedu.cn/app/coursepacket/courseware/teacher/viewResourceDetails',
          {
            resourceDirectoryId: id,
            coursePacketClassId: COURSE_PACKET_CLASS_ID
          }
        )
        const { resourceDirectory } = data
        const { resourceID } = resourceDirectory
        const length = data.pageView?.pageSize ?? data.resource?.duration
        console.log(`${chalk.blue('INFO')} ID=${chalk.whiteBright(resourceID)}`)

        await invokeAsText('http://www.pupedu.cn/app/click/addClick', {
          objInfo: JSON.stringify({
            clickedObjId: resourceID,
            clickedObjName: name,
            clickedObjType: 0,
            coursePacketId: coursePacketID,
            coursePacketDirId: directoryCasecadeID,
            resourceDirectoryId: id
          }),
          userInfo: JSON.stringify({
            clickUserId: USER_ID,
            clickUserName: NAME,
            clickUserRole: 'student',
            classId: COURSE_PACKET_CLASS_ID
          })
        })
        console.log(`${chalk.blue('INFO')} TYPE=${type} LEN=${length}`)
        await invoke('http://www.pupedu.cn/statis/saveStudyLog', {
          coursePacketId: coursePacketID,
          coursePacketDirId: directoryCasecadeID,
          resourceDirectoryId: id,
          beginTime: getTime(Date.now() - 1000 * 60 * 60 * 2),
          endTime: getTime(),
          userId: USER_ID,
          userName: NAME,
          resourceId: resourceID,
          type,
          resourceLength: length,
          coursePacketClassId: COURSE_PACKET_CLASS_ID,
          ...(type === 'IMAGES_TYPE'
            ? {
                userPageNum: length
              }
            : {}),
          location: length
        })
      } catch (err) {
        console.error(err)
        console.log(`${chalk.red('ERR')} Damn it!`)
      }
    }
  }
}

@Collection('新时代劳动教育理论课')
export class PKUNELETCourse {
  @Method('快速完成学习')
  async quickFinish(
    @Optional() cookie: string,
    @Optional() userId: string,
    @Optional() coursePacketClassId: string,
    @Optional() coursePacketId: string,
    @Optional() name: string
  ) {
    cookie = await ask(cookie, 'text', 'cookie')
    userId = await ask(userId, 'text', 'userId')
    coursePacketClassId = await ask(
      coursePacketClassId,
      'text',
      'coursePacketClassId'
    )
    coursePacketId = await ask(coursePacketId, 'text', 'coursePacketId')
    name = await ask(name, 'text', 'Your Name')
    await quickFinish({
      cookie,
      userId,
      coursePacketClassId,
      coursePacketId,
      name
    })
  }
}
