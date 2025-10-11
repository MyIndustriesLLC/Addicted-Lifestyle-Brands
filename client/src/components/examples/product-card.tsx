import { ProductCard } from '../product-card'

export default function ProductCardExample() {
  return (
    <div className="max-w-sm">
      <ProductCard
        id="1"
        name="Blockchain Tee"
        price={25}
        image="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop"
        nftStatus="available"
        barcodeId="BC7X9K2M"
      />
    </div>
  )
}
