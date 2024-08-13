import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="container mx-auto py-4">
          <h1 className="text-3xl font-bold">Fleet Management System</h1>
        </div>
      </header>

      <main className="flex-grow container mx-auto py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome to Our Fleet Management System</CardTitle>
            <CardDescription>
              Efficiently manage your fleet of vehicles and drivers with our comprehensive solution.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Key Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {[
                  "Driver Creation and Management",
                  "Vehicle-Driver Assignment",
                  "Time-based Scheduling",
                  "Driver Assignment Requests",
                  "Location-based Driver Search"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Choose Your Role</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full" variant="default">
                <Link href="/driver/requests">I&apos;m a Driver</Link>
              </Button>
              <Button asChild className="w-full" variant="secondary">
                <Link href="/admin">I&apos;m a Fleet Manager</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t">
        <div className="container mx-auto py-4 text-center text-muted-foreground">
          &copy; 2024 Fleet Management System. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default HomePage;