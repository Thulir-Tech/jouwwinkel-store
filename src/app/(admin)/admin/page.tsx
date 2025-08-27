import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function AdminPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>Welcome to your Dashboard!</CardTitle>
          <CardDescription>
            This is your central hub for managing your e-commerce store.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            From here, you can manage products, view orders, and configure
            your store settings. Use the navigation on the left to get started.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
