
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCombos } from '@/lib/firestore';
import { formatCurrency } from '@/lib/format';
import type { Combo } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function CombosPageSkeleton() {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-4 w-48 mt-2" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>
            </CardHeader>
            <CardContent>
                 <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-40 w-full" />
                </div>
            </CardContent>
        </Card>
    )
}

export default function CombosAdminPage() {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
        try {
            const combosData = await getCombos();
            setCombos(combosData);
        } catch (error) {
            console.error("Failed to fetch combos:", error);
        } finally {
            setLoading(false);
        }
    }
    fetchData();
  }, []);

  if (loading) {
      return <CombosPageSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Combos</CardTitle>
            <CardDescription>Manage your product combos.</CardDescription>
          </div>
          <Button asChild>
            <Link href="/admin/combos/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Combo
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Image</span>
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="hidden md:table-cell">Created at</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {combos.map(combo => (
              <TableRow key={combo.id}>
                <TableCell className="hidden sm:table-cell">
                  <Image
                    alt={combo.title}
                    className="aspect-square rounded-md object-cover"
                    height="64"
                    src={combo.images?.[0] || 'https://placehold.co/64x64.png'}
                    width="64"
                    data-ai-hint="combo image"
                  />
                </TableCell>
                <TableCell className="font-medium">{combo.title}</TableCell>
                <TableCell>
                  <Badge variant={combo.active ? 'default' : 'outline'}>
                    {combo.active ? 'Active' : 'Draft'}
                  </Badge>
                </TableCell>
                <TableCell className="font-sans">₹{formatCurrency(combo.price)}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {new Date(combo.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/combos/${combo.id}/edit`}>Edit</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
         {combos.length === 0 && (
            <div className="text-center text-muted-foreground p-8">
                No combos found.
            </div>
        )}
      </CardContent>
    </Card>
  );
}
