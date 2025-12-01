import pc from 'picocolors'
import { formatFileSize } from './utils'

interface LogSizeType {
    fileName: string
    webpName?: string
    logName?: string
    originSize: number
    compressSize: number
}

export const logSize: LogSizeType[] = []

function roundTo(num: number, decimals: number): number {
    const factor = Math.pow(10, decimals)
    return Math.round(num * factor) / factor
}

export function printLog() {
    logSize.forEach((item) => {
        const { webpName, fileName } = item
        item.logName = webpName ? fileName + ' ---> ' + webpName : fileName
    })

    const maxLen = logSize.reduce(
        (prev, cur) => Math.max(prev, cur.logName?.length || 0),
        0
    )

    console.log(
        pc.greenBright(
            '-------------- vite-plugin-images-tool log start --------------'
        )
    )
    let totalSize = 0
    let compressedSize = 0
    logSize.forEach(({ fileName, originSize, compressSize, logName }) => {
        totalSize += originSize
        compressedSize += compressSize
        const spaceNum = Math.abs(maxLen - (logName?.length || 0))
        let name = logName
        for (let index = 0; index < spaceNum; index++) {
            name += ' '
        }
        name += '   '
        const origin = pc.bold(formatFileSize(originSize))
        const compress = pc.bold(formatFileSize(compressSize))
        const rate = roundTo(
            ((originSize - compressSize) / originSize) * 100,
            2
        )

        console.log(
            `${pc.cyan(name)} ${origin} ---> ${compress} | ${pc.yellow('rate:')} ${rate > 0 ? pc.green(rate + '%↓') : pc.red(Math.abs(rate) + '%↑')}` // Compression rate
        )
    })
    const totalRate = roundTo(
        ((totalSize - compressedSize) / totalSize) * 100,
        2
    )
    console.log(
        pc.bold(
            `compress images total size: ${pc.bold(formatFileSize(totalSize))} ---> ${pc.bold(formatFileSize(compressedSize))} | ${totalRate > 0 ? pc.green(totalRate + '%↓') : pc.red(Math.abs(totalRate) + '%↑')}`
        )
    )
    console.log(
        pc.greenBright(
            '-------------- vite-plugin-images-tool log end --------------'
        )
    )
}
