import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { ApiDataModal } from '@/components/whatsapp/api-data-modal';
import { DeleteConfirmationModal } from '@/components/whatsapp/delete-confirmation-modal';
import { FormConnectionModal } from '@/components/whatsapp/form-connection-modal';
import { QRCodeDisplayModal } from '@/components/whatsapp/qrcode-display-modal';
import { WebhookManagementModal } from '@/components/whatsapp/webhook-management-modal';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type WhatsAppConnection } from '@/types';
import { Head, router } from '@inertiajs/react';
import { IconApi, IconBrandWhatsapp, IconEdit, IconLoader2, IconPlus, IconQrcode, IconTrash, IconWebhook } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface WhatsAppIndexProps {
    connections: WhatsAppConnection[];
    maxConnections: number;
    currentConnections: number;
    canCreateMore: boolean;
    modalType?: 'create' | 'edit';
    editConnection?: WhatsAppConnection;
}

export default function WhatsAppIndex({
    connections,
    maxConnections,
    currentConnections,
    canCreateMore,
    modalType,
    editConnection,
}: WhatsAppIndexProps) {
    const { t } = useTranslation();

    // Estados dos modais de QR Code
    const [qrDisplayModalOpen, setQrDisplayModalOpen] = useState(false);
    const [selectedConnectionId, setSelectedConnectionId] = useState<number | null>(null);
    const [qrCodeData, setQrCodeData] = useState<{ instance?: { name?: string; qrcode?: string; status?: string } } | null>(null);
    const [isGeneratingQR, setIsGeneratingQR] = useState(false);
    const [isPollingStatus, setIsPollingStatus] = useState(false);

    // Estados do modal de dados da API
    const [apiDataModalOpen, setApiDataModalOpen] = useState(false);
    const [selectedConnection, setSelectedConnection] = useState<WhatsAppConnection | null>(null);

    // Estados do modal de webhooks
    const [webhookModalOpen, setWebhookModalOpen] = useState(false);
    const [selectedWebhookConnection, setSelectedWebhookConnection] = useState<WhatsAppConnection | null>(null);

    // Estados do modal de confirmação de exclusão
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [connectionToDelete, setConnectionToDelete] = useState<number | null>(null);
    const [isDeletingConnection, setIsDeletingConnection] = useState(false);

    // Ref para controlar o interval do polling
    const statusPollingRef = useRef<NodeJS.Timeout | null>(null);

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
        setConnectionToDelete(connectionId);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!connectionToDelete) return;

        setIsDeletingConnection(true);
        router.delete(`/whatsapp/${connectionToDelete}`, {
            onStart: () => setIsDeletingConnection(true),
            onFinish: () => {
                setIsDeletingConnection(false);
                setDeleteModalOpen(false);
                setConnectionToDelete(null);
            },
            onSuccess: () => {
                // Redirect handled by controller
            },
        });
    };

    const cancelDelete = () => {
        setDeleteModalOpen(false);
        setConnectionToDelete(null);
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

    const handleShowApiData = (connectionId: number) => {
        const connection = connections.find((c) => c.id === connectionId);
        if (connection) {
            setSelectedConnection(connection);
            setApiDataModalOpen(true);
        }
    };

    const handleCloseApiDataModal = () => {
        setApiDataModalOpen(false);
        setSelectedConnection(null);
    };

    const handleShowWebhooks = (connectionId: number) => {
        router.visit(`/whatsapp/${connectionId}/webhooks-page`);
    };

    const handleCloseWebhookModal = () => {
        setWebhookModalOpen(false);
        setSelectedWebhookConnection(null);
    };

    const getInstanceStatus = async (connectionId: number) => {
        try {
            const response = await fetch(`/whatsapp/${connectionId}/status`);
            const data = await response.json();

            console.log(`Status check for connection ${connectionId}:`, data);

            if (data.success && data.status === 'connected') {
                console.log(`Connection ${connectionId} is now connected! Updating database...`);

                // Atualizar o status no banco de dados
                await fetch(`/whatsapp/${connectionId}/update-status`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({
                        status: 'connected',
                    }),
                });

                // Parar o polling
                stopStatusPolling();

                // Fechar o modal de exibição do QR Code
                handleCloseQRDisplayModal();

                // Recarregar a página para mostrar o status atualizado
                router.reload();

                return true; // Conectado
            }

            return false; // Ainda não conectado
        } catch (error) {
            console.error(`Error checking status for connection ${connectionId}:`, error);
            return false;
        }
    };

    const startStatusPolling = (connectionId: number) => {
        console.log(`Starting status polling for connection ${connectionId}...`);
        setIsPollingStatus(true);

        statusPollingRef.current = setInterval(async () => {
            const isConnected = await getInstanceStatus(connectionId);
            if (isConnected) {
                stopStatusPolling();
            }
        }, 5000); // 5 segundos
    };

    const stopStatusPolling = () => {
        if (statusPollingRef.current) {
            console.log('Stopping status polling...');
            clearInterval(statusPollingRef.current);
            statusPollingRef.current = null;
            setIsPollingStatus(false);
        }
    };

    // Cleanup do polling quando o componente for desmontado
    useEffect(() => {
        return () => {
            stopStatusPolling();
        };
    }, []);

    const handleQRCode = async (connectionId: number) => {
        const connection = connections.find((c) => c.id === connectionId);

        // Se já estiver conectado, apenas abrir o modal
        if (connection?.status === 'connected') {
            setSelectedConnectionId(connectionId);
            setQrDisplayModalOpen(true);
            return;
        }

        setIsGeneratingQR(true);
        setSelectedConnectionId(connectionId);

        try {
            const response = await fetch(`/whatsapp/${connectionId}/qrcode`);
            const data = await response.json();

            if (data.success) {
                console.log(data);

                setQrCodeData(data.qrcode);
                setQrDisplayModalOpen(true);

                // Iniciar o polling do status após gerar o QR code
                console.log(`QR Code generated for connection ${connectionId}. Starting status polling...`);
                startStatusPolling(connectionId);
            } else {
                toast.error(data.message || 'Erro ao gerar QR code', {
                    duration: 5000,
                    description: data.attempts ? `Tentativas realizadas: ${data.attempts}` : undefined,
                });
            }
        } catch (error) {
            console.error('Erro ao gerar QR code:', error);
            toast.error('Erro ao gerar QR code', {
                duration: 5000,
                description: error instanceof Error ? error.message : 'Erro desconhecido',
            });
        } finally {
            setIsGeneratingQR(false);
        }
    };

    const handleDisconnect = async () => {
        if (!selectedConnectionId) return;

        try {
            const response = await fetch(`/whatsapp/${selectedConnectionId}/disconnect`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();

            if (data.success) {
                console.log('Instance disconnected successfully, showing new QR code...');

                // Atualizar com o novo QR code
                setQrCodeData(data.qrcode);

                // Iniciar o polling novamente
                startStatusPolling(selectedConnectionId);

                // Recarregar a página para atualizar a lista de conexões
                setTimeout(() => {
                    router.reload();
                }, 1000);
            } else {
                toast.error(data.message || 'Erro ao desconectar instância', {
                    duration: 5000,
                });
            }
        } catch (error) {
            console.error('Erro ao desconectar instância:', error);
            toast.error('Erro ao desconectar instância', {
                duration: 5000,
                description: error instanceof Error ? error.message : 'Erro desconhecido',
            });
        }
    };

    const handleCloseQRDisplayModal = () => {
        setQrDisplayModalOpen(false);
        setQrCodeData(null);
        setSelectedConnectionId(null);

        // Parar o polling se estiver ativo (usuário fechou o modal antes de conectar)
        if (isPollingStatus) {
            console.log('QR Modal closed, stopping status polling...');
            stopStatusPolling();
        }
    };

    const isModalOpen = modalType === 'create' || modalType === 'edit';

    const columns: ColumnDef<WhatsAppConnection>[] = [
        {
            accessorKey: 'name',
            header: t('whatsapp.connectionName'),
        },
        {
            accessorKey: 'system_name',
            header: t('whatsapp.systemName'),
        },
        {
            accessorKey: 'admin_field_1',
            header: t('whatsapp.adminField1'),
            cell: ({ row }) => {
                const value = row.getValue('admin_field_1') as string;
                return value || '-';
            },
        },
        {
            accessorKey: 'admin_field_2',
            header: t('whatsapp.adminField2'),
            cell: ({ row }) => {
                const value = row.getValue('admin_field_2') as string;
                return value || '-';
            },
        },
        {
            accessorKey: 'phone',
            header: t('whatsapp.phone'),
            cell: ({ row }) => {
                const value = row.getValue('phone') as string;
                return value || '-';
            },
        },
        {
            accessorKey: 'status',
            header: t('whatsapp.status'),
            cell: ({ row }) => {
                const status = row.getValue('status') as string;
                if (!status) {
                    return <Badge variant="secondary">-</Badge>;
                }

                const getStatusTranslation = (status: string) => {
                    const translations: Record<string, string> = {
                        creating: t('whatsapp.statusCreating'),
                        created: t('whatsapp.statusCreated'),
                        connecting: t('whatsapp.statusConnecting'),
                        connected: t('whatsapp.statusConnected'),
                        disconnected: t('whatsapp.statusDisconnected'),
                        error: t('whatsapp.statusError'),
                    };
                    return translations[status] || status;
                };

                const getStatusVariant = (status: string) => {
                    switch (status) {
                        case 'connected':
                            return 'default'; // Verde
                        case 'creating':
                        case 'connecting':
                            return 'secondary'; // Azul/Cinza
                        case 'error':
                            return 'destructive'; // Vermelho
                        case 'disconnected':
                            return 'outline'; // Borda
                        default:
                            return 'secondary';
                    }
                };

                return (
                    <Badge variant={getStatusVariant(status) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                        {getStatusTranslation(status)}
                    </Badge>
                );
            },
        },
        {
            id: 'actions',
            header: t('whatsapp.actions'),
            cell: ({ row }) => {
                const connection = row.original;
                return (
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditClick(connection.id)}>
                            <IconEdit className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQRCode(connection.id)}
                            disabled={isGeneratingQR && selectedConnectionId === connection.id}
                            title={t('whatsapp.generateQRCode')}
                        >
                            {isGeneratingQR && selectedConnectionId === connection.id ? (
                                <IconLoader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <IconQrcode className="h-4 w-4" />
                            )}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleShowApiData(connection.id)} title={t('whatsapp.apiData')}>
                            <IconApi className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleShowWebhooks(connection.id)} title={t('whatsapp.webhooks')}>
                            <IconWebhook className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(connection.id)}>
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
                        <h1 className="flex items-center gap-2 text-2xl font-bold">
                            <IconBrandWhatsapp className="h-6 w-6 text-green-600" />
                            {t('whatsapp.myConnections')}
                        </h1>
                        <p className="mt-1 text-gray-600">
                            {t('whatsapp.connectionsUsed')}: {currentConnections} / {maxConnections}
                        </p>
                    </div>

                    {canCreateMore && (
                        <Button className="flex items-center gap-2" onClick={handleCreateClick}>
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
                            <div className="py-8 text-center">
                                <IconBrandWhatsapp className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                                <h3 className="mb-2 text-lg font-medium text-gray-900">{t('whatsapp.noConnections')}</h3>
                                <p className="mb-4 text-gray-600">{t('whatsapp.createFirstConnection')}</p>
                                {canCreateMore && (
                                    <Button onClick={handleCreateClick}>
                                        <IconPlus className="mr-2 h-4 w-4" />
                                        {t('whatsapp.createConnection')}
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <DataTable columns={columns} data={connections} searchKey="name" searchPlaceholder={t('whatsapp.connectionName')} />
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Modal de Formulário */}
            <FormConnectionModal open={isModalOpen} onClose={handleCloseModal} connection={modalType === 'edit' ? editConnection : undefined} />

            {/* Modal para exibir QR Code */}
            <QRCodeDisplayModal
                open={qrDisplayModalOpen}
                onClose={handleCloseQRDisplayModal}
                qrCodeData={qrCodeData ?? { instance: undefined }}
                isPollingStatus={isPollingStatus}
                connectionStatus={connections.find((c) => c.id === selectedConnectionId)?.status || undefined}
                onDisconnect={handleDisconnect}
            />

            {/* Modal para exibir dados da API */}
            <ApiDataModal open={apiDataModalOpen} onClose={handleCloseApiDataModal} connection={selectedConnection} />

            {/* Modal de Gestão de Webhooks */}
            <WebhookManagementModal open={webhookModalOpen} onClose={handleCloseWebhookModal} connection={selectedWebhookConnection} />

            {/* Modal de Confirmação de Exclusão */}
            <DeleteConfirmationModal
                open={deleteModalOpen}
                onClose={cancelDelete}
                onConfirm={confirmDelete}
                title={t('whatsapp.confirmDelete')}
                description={t('whatsapp.deleteWarning')}
                confirmButtonText={t('whatsapp.delete')}
                cancelButtonText={t('common.cancel')}
                isLoading={isDeletingConnection}
            />

            {/* Overlay de Loading para geração de QR Code */}
            {isGeneratingQR && (
                <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="flex flex-col items-center gap-4 rounded-lg bg-white p-6 shadow-lg">
                        <IconLoader2 className="h-8 w-8 animate-spin text-blue-600" />
                        <p className="font-medium text-gray-700">{t('whatsapp.generatingQRCode', 'Gerando QR Code...')}</p>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
