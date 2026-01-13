import { Card, CardContent } from '@/components/ui/card';
import { CopyButton } from '@/components/copy-button';
import { Skeleton } from '@/components/ui/skeleton';

interface OutputListProps {
  items: string[];
  isLoading?: boolean;
  count?: number; 
}

export function OutputList({ items, isLoading, count = 3 }: OutputListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
      {items.map((item, index) => (
        <Card key={index} className="flex items-center justify-between p-4 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm mr-4 flex-1">{item}</p>
          <CopyButton textToCopy={item} />
        </Card>
      ))}
    </div>
  );
}
