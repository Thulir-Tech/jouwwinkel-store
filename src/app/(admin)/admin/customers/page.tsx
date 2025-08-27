
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
  } from '@/components/ui/card';
import { getUsers } from '@/lib/firestore.admin';
import { CustomerActions } from './customer-actions';
  
export default async function CustomersPage() {
    const users = await getUsers();
  
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customers</CardTitle>
          <CardDescription>View and manage your registered users.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Registered On</TableHead>
                <TableHead>
                    <span className="sr-only">Actions</span>
                </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map((user) => (
                <TableRow key={user.uid}>
                    <TableCell className="font-medium">{user.displayName || 'N/A'}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell className="text-right">
                        <CustomerActions user={user} />
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
             {users.length === 0 && (
                <div className="text-center text-muted-foreground p-8">
                    No customers found.
                </div>
            )}
        </CardContent>
      </Card>
    );
}
