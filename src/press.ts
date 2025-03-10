import { join, parse } from 'path'
import { IMG_FORMATS, IMG_FORMATS_ENUM } from './constants'
import { formatBytes } from './utils'
import sharp from 'sharp'
import { readdirSync, readFileSync, statSync, writeFile } from 'fs'
import type { PluginOptionsType } from '.'

export async function pressImage({
    filePath,
    outputPath,
    opt,
}: {
    filePath: string
    outputPath: string
    opt: PluginOptionsType
}) {
    const { ext, base } = parse(filePath)
    const output = outputPath || filePath
    if (!IMG_FORMATS.includes(ext)) {
        return
    }

    const buffer = readFileSync(filePath)
    let image = sharp(buffer)

    if (
        ext.includes(IMG_FORMATS_ENUM.jpeg) ||
        ext.includes(IMG_FORMATS_ENUM.jpg)
    ) {
        image = image.jpeg(opt.jpgOptions)
    } else {
        const format = ext.split('.')[ext.split('.').length - 1]
        image = image[format](opt[`${format.toLocaleLowerCase()}Options`])
    }

    const compressedBuffer = await image.toBuffer()
    console.log(
        `${base}：${formatBytes(buffer.length)} ============> ${formatBytes(
            compressedBuffer.length
        )}`
    )
    return new Promise((resolve, reject) => {
        writeFile(output, compressedBuffer, (err) => {
            if (err) {
                reject(err)
                return
            }
            resolve(output)
        })
    })
}

export async function getDirFilePath(dir: string) {
    const pathList: string[] = []
    const files = readdirSync(dir)

    for (let index = 0; index < files.length; index++) {
        const path = join(dir, files[index])
        const isFile = await statSync(path).isFile()
        if (isFile) {
            pathList.push(path)
        } else {
            const list = await getDirFilePath(path)
            pathList.push(...list)
        }
    }

    return pathList
}

export async function pressDirImage(dir: string, opt: PluginOptionsType) {
    const pathList: string[] = await getDirFilePath(dir)

    return await Promise.all(
        pathList
            .filter((path) => IMG_FORMATS.includes(parse(path).ext))
            .map((path) => {
                return pressImage({
                    filePath: path,
                    outputPath: path,
                    opt,
                })
            })
    )
}
