import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function UpgradeLoading() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <div className="h-8 w-56 bg-muted animate-pulse rounded mx-auto" />
        <div className="h-4 w-80 bg-muted animate-pulse rounded mx-auto mt-3" />
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-7 w-20 bg-muted animate-pulse rounded" />
              <div className="h-4 w-36 bg-muted animate-pulse rounded mt-1" />
              <div className="h-10 w-24 bg-muted animate-pulse rounded mt-4" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-muted animate-pulse rounded-full" />
                  <div className="h-4 w-28 bg-muted animate-pulse rounded" />
                </div>
              ))}
              <div className="h-10 w-full bg-muted animate-pulse rounded mt-4" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
