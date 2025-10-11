import { NFTBadge } from '../nft-badge'

export default function NFTBadgeExample() {
  return (
    <div className="flex gap-2 flex-wrap">
      <NFTBadge status="available" />
      <NFTBadge status="minted" />
      <NFTBadge status="pending" />
    </div>
  )
}
