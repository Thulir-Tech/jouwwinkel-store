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
  import { getCategories, getVariants } from '@/lib/firestore';
  import { CategoryForm } from './category-form';
  import { VariantForm } from './variant-form';
import { Separator } from '@/components/ui/separator';
  
  export default async function CategoriesAndVariantsPage() {
    const [categories, variants] = await Promise.all([
      getCategories({ activeOnly: false }),
      getVariants()
    ]);
  
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Categories & Variants</h1>
        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Manage Categories</CardTitle>
              <CardDescription>Add, edit, and organize your product categories.</CardDescription>
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
          
          <Separator />

          <Card>
             <CardHeader>
              <CardTitle>Manage Variants</CardTitle>
              <CardDescription>Create and manage product variants like Size or Color.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-8">
               <div>
                <VariantForm />
              </div>
              <div>
                <h3 className="font-semibold mb-4">Existing Variants</h3>
                <div className="border rounded-md">
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Options</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {variants.map((variant) => (
                        <TableRow key={variant.id}>
                            <TableCell className="font-medium">{variant.name}</TableCell>
                            <TableCell>
                                <div className="flex flex-wrap gap-1">
                                    {variant.options.map(option => (
                                        <Badge key={option} variant="secondary">{option}</Badge>
                                    ))}
                                </div>
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
  
