import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { IconBrandWhatsapp, IconLoader2 } from '@tabler/icons-react';

interface QRCodeDisplayModalProps {
    open: boolean;
    onClose: () => void;
    qrCodeData: {
        instance?: {
            name?: string;
            qrcode?: string;
            status?: string;
        };
    };
    isPollingStatus?: boolean;
    connectionStatus?: string;
    onDisconnect?: () => void;
}

export function QRCodeDisplayModal({ open, onClose, qrCodeData, isPollingStatus, connectionStatus, onDisconnect }: QRCodeDisplayModalProps) {
    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            onClose();
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <IconBrandWhatsapp className="h-5 w-5 text-green-600" />
                        QR Code de Conexão
                    </DialogTitle>
                    <DialogDescription>
                        {qrCodeData?.instance?.name && (
                            <div className="mb-2">
                                <strong>Instância:</strong> {qrCodeData.instance.name}
                            </div>
                        )}
                        Escaneie o código QR com seu WhatsApp para conectar
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 text-center">
                    {/* Se já estiver conectado, mostrar botão de desconectar */}
                    {connectionStatus === 'connected' ? (
                        <div className="rounded-lg border border-green-200 bg-green-50 p-6">
                            <div className="mb-4">
                                <IconBrandWhatsapp className="mx-auto h-12 w-12 text-green-600" />
                                <h3 className="mt-2 text-lg font-medium text-green-800">WhatsApp Conectado!</h3>
                                <p className="text-sm text-green-600">Sua instância está ativa e pronta para uso</p>
                            </div>
                            <Button variant="outline" onClick={onDisconnect} className="border-red-200 text-red-600 hover:bg-red-50">
                                Desconectar
                            </Button>
                        </div>
                    ) : (
                        <>
                            {qrCodeData?.instance?.qrcode ? (
                                <img src={qrCodeData.instance.qrcode} alt="QR Code" className="mx-auto mb-4 max-w-full rounded border" />
                            ) : (
                                <div className="rounded border bg-gray-100 p-8">
                                    <p className="text-gray-500">QR Code não disponível</p>
                                    {qrCodeData?.instance?.status && (
                                        <p className="mt-2 text-sm text-gray-400">Status: {qrCodeData.instance.status}</p>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {/* Só mostrar instruções e status quando não estiver conectado */}
                    {connectionStatus !== 'connected' && (
                        <div className="space-y-3">
                            {/* Status Polling Indicator */}
                            {isPollingStatus && (
                                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                                    <div className="flex items-center gap-2">
                                        <IconLoader2 className="h-4 w-4 animate-spin text-blue-600" />
                                        <p className="text-sm font-medium text-blue-800">Verificando status da conexão...</p>
                                    </div>
                                    <p className="mt-1 text-xs text-blue-600">Aguardando que você escaneie o QR Code</p>
                                </div>
                            )}

                            <div className="space-y-2 text-sm text-gray-600">
                                <p className="font-medium text-gray-800">Como conectar:</p>
                                <p>1. Abra o WhatsApp no seu celular</p>
                                <p>
                                    2. Toque em <strong>Menu</strong> ou <strong>Configurações</strong>
                                </p>
                                <p>
                                    3. Toque em <strong>Aparelhos conectados</strong>
                                </p>
                                <p>
                                    4. Toque em <strong>Conectar um aparelho</strong>
                                </p>
                                <p>5. Escaneie este código QR</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-center pt-4">
                    <Button onClick={() => handleOpenChange(false)}>Fechar</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
