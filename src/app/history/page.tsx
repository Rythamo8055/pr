
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History } from "lucide-react";

export default function HistoryPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 bg-gradient-to-br from-background to-secondary/30">
      <Card className="w-full max-w-lg glassmorphism">
        <CardHeader>
          <div className="flex items-center space-x-2 mb-2">
            <History className="h-8 w-8 text-primary" />
            <CardTitle className="font-headline text-3xl">Video History</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10">
            <p className="text-muted-foreground text-lg">
              This is where your video generation history will appear.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              (This feature is currently under development.)
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
