export const uiPort = 8080
export const proxyPort = 3000
export const torProxyPort = 3001
export const bitcoinMountpoint = '/mnt/bitcoin'

export const splitBridgeAddress = (
  address: string,
): { host: string; port: number } => {
  const parsed = new URL(`tcp://${address}`)
  const port = Number(parsed.port)
  if (!parsed.hostname || !Number.isInteger(port) || port < 1) {
    throw new Error(`Invalid dependency bridge address: ${address}`)
  }
  return { host: parsed.hostname, port }
}
