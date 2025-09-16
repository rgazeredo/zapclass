import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { FormConnectionModal } from '@/components/whatsapp/form-connection-modal';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type WhatsAppConnection } from '@/types';
import { Head, router } from '@inertiajs/react';
import { IconBrandWhatsapp, IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';

interface WhatsAppIndexProps {
    connections: WhatsAppConnection[];
    maxConnections: number;
    currentConnections: number;
    canCreateMore: boolean;
    modalType?: 'create' | 'edit';
    editConnection?: WhatsAppConnection;
}

export default function WhatsAppIndex({ connections, maxConnections, currentConnections, canCreateMore, modalType, editConnection }: WhatsAppIndexProps) {
    const { t } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('dashboard.title'),
            href: '/dashboard',
        },
        {
            title: t('whatsapp.title'),
            href: '/whatsapp',
        },
    ];

    const handleDelete = (connectionId: number) => {
        if (confirm(t('whatsapp.confirmDelete'))) {
            router.delete(`/whatsapp/${connectionId}`, {
                onSuccess: () => {
                    // Redirect handled by controller
                },
            });
        }
    };

    const handleCreateClick = () => {
        router.visit('/whatsapp/create');
    };

    const handleEditClick = (connectionId: number) => {
        router.visit(`/whatsapp/${connectionId}/edit`);
    };

    const handleCloseModal = () => {
        router.visit('/whatsapp');
    };

    const isModalOpen = modalType === 'create' || modalType === 'edit';

    const columns: ColumnDef<WhatsAppConnection>[] = [
        {
            accessorKey: "name",
            header: t('whatsapp.connectionName'),
        },
        {
            accessorKey: "system_name",
            header: t('whatsapp.systemName'),
        },
        {
            accessorKey: "admin_field_1",
            header: t('whatsapp.adminField1'),
            cell: ({ row }) => {
                const value = row.getValue("admin_field_1") as string;
                return value || "-";
            },
        },
        {
            accessorKey: "admin_field_2",
            header: t('whatsapp.adminField2'),
            cell: ({ row }) => {
                const value = row.getValue("admin_field_2") as string;
                return value || "-";
            },
        },
        {
            accessorKey: "phone",
            header: t('whatsapp.phone'),
            cell: ({ row }) => {
                const value = row.getValue("phone") as string;
                return value || "-";
            },
        },
        {
            accessorKey: "status",
            header: t('whatsapp.status'),
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                return status ? (
                    <Badge variant="default">{status}</Badge>
                ) : (
                    <Badge variant="secondary">-</Badge>
                );
            },
        },
        {
            id: "actions",
            header: t('whatsapp.actions'),
            cell: ({ row }) => {
                const connection = row.original;
                return (
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(connection.id)}
                        >
                            <IconEdit className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(connection.id)}
                        >
                            <IconTrash className="h-4 w-4 text-red-600" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('whatsapp.myConnections')} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <IconBrandWhatsapp className="h-6 w-6 text-green-600" />
                            {t('whatsapp.myConnections')}
                        </h1>
                        <p className="text-gray-600 mt-1">
                            {t('whatsapp.connectionsUsed')}: {currentConnections} / {maxConnections}
                        </p>
                    </div>

                    {canCreateMore && (
                        <Button
                            className="flex items-center gap-2"
                            onClick={handleCreateClick}
                        >
                            <IconPlus className="h-4 w-4" />
                            {t('whatsapp.newConnection')}
                        </Button>
                    )}

                    {!canCreateMore && (
                        <Button disabled className="flex items-center gap-2">
                            <IconPlus className="h-4 w-4" />
                            {t('whatsapp.maxConnectionsReached')}
                        </Button>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('whatsapp.connections')}</CardTitle>
                        <CardDescription>
                            {t('whatsapp.connectionsUsed')}: {currentConnections} / {maxConnections}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {connections.length === 0 ? (
                            <div className="text-center py-8">
                                <IconBrandWhatsapp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {t('whatsapp.noConnections')}
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    {t('whatsapp.createFirstConnection')}
                                </p>
                                {canCreateMore && (
                                    <Button onClick={handleCreateClick}>
                                        <IconPlus className="h-4 w-4 mr-2" />
                                        {t('whatsapp.createConnection')}
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <DataTable
                                columns={columns}
                                data={connections}
                                searchKey="name"
                                searchPlaceholder={t('whatsapp.connectionName')}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Modal de Formulário */}
            <FormConnectionModal
                open={isModalOpen}
                onClose={handleCloseModal}
                connection={modalType === 'edit' ? editConnection : undefined}
            />
        </AppLayout>
    );
}