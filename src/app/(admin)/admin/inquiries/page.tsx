
'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getInquiries } from '@/lib/firestore';
import type { Inquiry } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Phone, Trash2 } from 'lucide-react';
import { deleteInquiry } from '@/lib/firestore.admin';
import { useToast } from '@/hooks/use-toast';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from "@/components/ui/alert-dialog"

function InquiriesPageSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-4 w-1/2" />
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
  
export default function InquiriesPage() {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [inquiryToDelete, setInquiryToDelete] = useState<Inquiry | null>(null);
    const { toast } = useToast();

    const fetchInquiries = async () => {
        try {
            const data = await getInquiries();
            setInquiries(data);
        } catch (error) {
            console.error("Failed to fetch inquiries:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchInquiries();
    }, []);

    const filteredInquiries = useMemo(() => {
        return inquiries.filter(inquiry =>
            inquiry.name.toLowerCase().includes(filter.toLowerCase()) ||
            inquiry.mobile.includes(filter) ||
            (inquiry.product || '').toLowerCase().includes(filter.toLowerCase())
        );
    }, [inquiries, filter]);

    const handleCall = (mobile: string) => {
        window.location.href = `tel:${mobile}`;
    };

    const handleDelete = async () => {
        if (!inquiryToDelete) return;
        try {
            await deleteInquiry(inquiryToDelete.id);
            setInquiries(inquiries.filter(i => i.id !== inquiryToDelete.id));
            toast({ title: 'Inquiry deleted successfully' });
        } catch (error) {
            console.error('Error deleting inquiry', error);
            toast({ title: 'Error deleting inquiry', variant: 'destructive'});
        } finally {
            setInquiryToDelete(null);
        }
    }

    if (loading) {
        return <InquiriesPageSkeleton />;
    }
  
    return (
        <>
            <AlertDialog open={!!inquiryToDelete} onOpenChange={(open) => !open && setInquiryToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the inquiry from {inquiryToDelete?.name}.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Card>
                <CardHeader>
                <CardTitle>Contact Form Inquiries</CardTitle>
                <CardDescription>View messages submitted through your contact form.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-6">
                        <Input
                            placeholder="Filter by name, mobile, or product..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </div>
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Mobile</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredInquiries.map((inquiry) => (
                        <TableRow key={inquiry.id}>
                            <TableCell className="font-medium">{inquiry.name}</TableCell>
                            <TableCell className="font-mono text-xs">{inquiry.mobile}</TableCell>
                            <TableCell>{inquiry.product || 'General Enquiry'}</TableCell>
                            <TableCell>{new Date(inquiry.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="outline" size="sm" onClick={() => handleCall(inquiry.mobile)}>
                                    <Phone className="mr-2 h-4 w-4" />
                                    Call
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="ml-2 text-destructive hover:text-destructive"
                                    onClick={() => setInquiryToDelete(inquiry)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                    {filteredInquiries.length === 0 && (
                        <div className="text-center text-muted-foreground p-8">
                            No inquiries found.
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    );
}
