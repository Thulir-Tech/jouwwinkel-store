import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
  import { Badge } from '@/components/ui/badge';
  import { getCategories } from '@/lib/firestore';
  import { CategoryForm } from './category-form';
  
  export default async function SettingsPage() {
    const categories = await getCategories({ activeOnly: false });
  
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Settings</h1>
        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Manage your product categories.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-8">
              <div>
                <CategoryForm />
              </div>
              <div>
                <h3 className="font-semibold mb-4">Existing Categories</h3>
                <div className="border rounded-md">
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.map((cat) => (
                        <TableRow key={cat.id}>
                            <TableCell className="font-medium">{cat.name}</TableCell>
                            <TableCell>
                            <Badge variant={cat.active ? 'default' : 'outline'}>
                                {cat.active ? 'Active' : 'Inactive'}
                            </Badge>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  