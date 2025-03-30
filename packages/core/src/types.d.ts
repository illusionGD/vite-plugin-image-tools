export type AnyObject = {
  [key: string | number | symbol]: any
}
export type PluginOptions = {
  quality: number
  enableDev: boolean
  enableDevWebp: boolean
  enableWebP: boolean
  include: string[]
  cacheDir: string
  regExp: string
}
