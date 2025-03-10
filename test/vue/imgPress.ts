import type { Plugin } from 'vite'
import path from 'path'
import fs from 'fs/promises'
import sharp from 'sharp'
import crypto from 'crypto'
import { existsSync } from 'fs'

interface PluginOptionsType {
    quality?: number
    formats?: string[]
    cache?: boolean
    cacheDir?: string
    sharpOptions?: Record<string, any>
    svgoOptions?: Record<string, any>
}

function ViteImageOptimizer(userOptions: PluginOptionsType = {}): Plugin {
    const options: PluginOptionsType = {
        quality: 80,
        formats: ['png', 'jpg', 'jpeg', 'webp', 'avif', 'gif', 'svg'],
        cache: true,
        cacheDir: '.vite_cache/images',
        sharpOptions: {},
        svgoOptions: {},
        ...userOptions,
    }

    const cacheMap = new Map<string, string>() // 记录已缓存的文件路径

    const isImage = (file: string) =>
        options.formats?.some((ext) => file.endsWith(`.${ext}`))

    const getCachePath = (filePath: string) => {
        const hash = crypto.createHash('md5').update(filePath).digest('hex')
        return path.join(options.cacheDir!, `${hash}${path.extname(filePath)}`)
    }

    async function ensureCacheDirExists(cacheDir: string) {
        try {
            await fs.mkdir(cacheDir, { recursive: true })
        } catch (error) {
            console.warn(`Failed to create cache directory: ${cacheDir}`, error)
        }
    }

    async function optimizeImage(
        filePath: string,
        buffer: Buffer,
        cacheDir: string
    ): Promise<Buffer> {
        const ext = path.extname(filePath).toLowerCase()
        let image = sharp(buffer)

        switch (ext) {
            case '.jpg':
            case '.jpeg':
                image = image.jpeg({ quality: 80 })
                break
            case '.png':
                image = image.png({ quality: 80 })
                break
            case '.webp':
                image = image.webp({ quality: 80 })
                break
            case '.avif':
                image = image.avif({ quality: 50 })
                break
            case '.gif':
                return buffer
            default:
                throw new Error(`Unsupported image format: ${ext}`)
        }

        const optimizedBuffer = await image.toBuffer()

        // 计算缓存路径
        const cacheFilePath = path.join(cacheDir, path.basename(filePath))
        await ensureCacheDirExists(cacheDir) // **确保目录存在**
        await fs.writeFile(cacheFilePath, optimizedBuffer)

        return optimizedBuffer
    }

    return {
        name: 'vite:image-optimizer',

        async load(id): Promise<any> {
            if (!options.cache || !isImage(id)) return

            const cachePath = getCachePath(id)
            if (cacheMap.has(id)) return await fs.readFile(cacheMap.get(id)!)

            try {
                await fs.access(cachePath)
                cacheMap.set(id, cachePath)
                return await fs.readFile(cachePath)
            } catch {
                const buffer = await fs.readFile(id)
                const optimizedBuffer = await optimizeImage(
                    id,
                    buffer,
                    options.cacheDir || '.vite_cache/images'
                )
                await fs.mkdir(options.cacheDir!, { recursive: true })
                await fs.writeFile(cachePath, optimizedBuffer)
                cacheMap.set(id, cachePath)
                return optimizedBuffer
            }
        },

        async transform(code, id) {
            if (!id.endsWith('.css')) return null
            console.log('🚀 ~ id:', id)

            const urlRegex = /url\((["']?)(.*?)\1\)/g
            const matches = [...code.matchAll(urlRegex)]

            if (matches.length === 0) return null // 没有图片，无需处理

            const replacements = await Promise.all(
                matches.map(async (match) => {
                    const [fullMatch, url] = match
                    if (!isImage(url)) return fullMatch // 不是图片，跳过

                    // 处理路径（支持 @/assets/...）
                    let filePath = path.resolve(url)
                    if (!existsSync(filePath)) {
                        filePath = path.join(process.cwd(), '', url) // 尝试拼接 src 目录
                    }
                    if (!existsSync(filePath)) {
                        console.warn(`File not found: ${filePath}`)
                        return fullMatch
                    }
                    try {
                        const buffer = await fs.readFile(filePath)
                        const optimizedBuffer = await optimizeImage(
                            filePath,
                            buffer,
                            options.cacheDir || '.vite_cache/images'
                        )
                        const optimizedPath = getCachePath(filePath)
                        const newPath = `/.vite_cache/images/${
                            optimizedPath.split('\\')[2]
                        }`
                        await fs.writeFile(optimizedPath, optimizedBuffer)
                        return `url(${newPath})` // 替换为新路径
                    } catch (err) {
                        console.warn(`Failed to process ${filePath}:`, err)
                        return fullMatch // 失败就返回原始路径
                    }
                })
            )

            // 用新路径替换旧的
            let i = 0
            const transformedCode = code.replace(
                urlRegex,
                () => replacements[i++]
            )

            return transformedCode
        },

        async generateBundle(_, bundle) {
            for (const file of Object.keys(bundle)) {
                console.log('🚀 ~ file:', file)
                if (!isImage(file)) continue
                const filePath = path.join('dist', file)
                const buffer = await fs.readFile(filePath)
                const optimizedBuffer = await optimizeImage(
                    file,
                    buffer,
                    options.cacheDir || '.vite_cache/images'
                )
                await fs.writeFile(filePath, optimizedBuffer)
                console.log(`Optimized: ${file}`)
            }
        },
    }
}

export default ViteImageOptimizer
