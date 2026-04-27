import { Artwork } from '@/hooks/useArtworks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

interface PriceAndDetailsSectionProps {
  artwork: Artwork;
  onEdit?: () => void;
  readOnly?: boolean;
}

export default function PriceAndDetailsSection({
  artwork,
  onEdit,
  readOnly = true,
}: PriceAndDetailsSectionProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="border-gray-200">
      <CardHeader className="border-b border-gray-200 pb-4 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg font-semibold">Price & Details</CardTitle>
        {!readOnly && onEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="gap-2"
          >
            <Edit size={16} />
            Edit
          </Button>
        )}
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Status & Quantity Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-600">Status</p>
              <p className="text-base font-medium text-gray-900">
                {artwork.status || 'For Sale'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Quantity</p>
              <p className="text-base font-medium text-gray-900">
                {artwork.quantity || 1}
              </p>
            </div>
          </div>
          <div className="border-b border-gray-200" />
        </div>

        {/* Price Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            Price
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">Artwork Price</p>
              <p className="text-base font-semibold text-gray-900">
                {formatPrice(artwork.price)}
              </p>
            </div>
          </div>
          <div className="border-b border-gray-200" />
        </div>

        {/* Weight & Packaging Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            Weight & Packaging
          </h3>
          <div className="space-y-3">
            {artwork.packaging_type && (
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">Packaging Type</p>
                <p className="text-base font-medium text-gray-900">
                  {artwork.packaging_type}
                </p>
              </div>
            )}
            {artwork.shipping_weight !== undefined && artwork.shipping_weight > 0 && (
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">Shipping Weight</p>
                <p className="text-base font-medium text-gray-900">
                  {artwork.shipping_weight} g
                </p>
              </div>
            )}
          </div>
          {(artwork.packaging_type || (artwork.shipping_weight && artwork.shipping_weight > 0)) && (
            <div className="border-b border-gray-200" />
          )}
        </div>

        {/* Additional Details Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            Additional Details
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">Number of Panels</p>
              <p className="text-base font-medium text-gray-900">
                {artwork.number_of_panels || 1}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">Ready to Hang</p>
              <p className="text-base font-medium text-gray-900">
                {artwork.ready_to_hang ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
          <div className="border-b border-gray-200" />
        </div>

        {/* Support Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            Support
          </h3>
          <p className="text-sm text-gray-600">
            If you have any questions or issues with this painting, please contact us:
          </p>
          <a
            href="mailto:support@sarojprakashbandi.com"
            className="text-sm font-medium text-accent hover:text-accent/80 transition-colors"
          >
            support@sarojprakashbandi.com
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
