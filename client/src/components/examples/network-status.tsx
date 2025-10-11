import { NetworkStatus } from '../network-status'

export default function NetworkStatusExample() {
  return (
    <div className="flex gap-2">
      <NetworkStatus isConnected={true} />
      <NetworkStatus isConnected={false} />
    </div>
  )
}
