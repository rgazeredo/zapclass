import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { IconBrandWhatsapp } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface QRCodeDisplayModalProps {
    open: boolean;
    onClose: () => void;
    qrCodeData: any;
}

export function QRCodeDisplayModal({ open, onClose, qrCodeData }: QRCodeDisplayModalProps) {
    const { t } = useTranslation();

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

                <div className="text-center py-4">
                    {qrCodeData?.instance?.qrcode ? (
                        <img
                            src={qrCodeData.instance.qrcode}
                            alt="QR Code"
                            className="mx-auto mb-4 max-w-full rounded border"
                        />
                    ) : (
                        <div className="bg-gray-100 p-8 rounded border">
                            <p className="text-gray-500">QR Code não disponível</p>
                            {qrCodeData?.instance?.status && (
                                <p className="text-sm text-gray-400 mt-2">
                                    Status: {qrCodeData.instance.status}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="space-y-3">
                        {qrCodeData?.instance?.status && (
                            <div className="bg-blue-50 p-3 rounded-lg">
                                <p className="text-sm font-medium text-blue-800">
                                    Status da Instância:
                                    <span className="ml-1 capitalize">{qrCodeData.instance.status}</span>
                                </p>
                                {qrCodeData.connected && (
                                    <p className="text-xs text-blue-600 mt-1">
                                        Instância conectada e pronta para uso
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="space-y-2 text-sm text-gray-600">
                            <p className="font-medium text-gray-800">Como conectar:</p>
                            <p>1. Abra o WhatsApp no seu celular</p>
                            <p>2. Toque em <strong>Menu</strong> ou <strong>Configurações</strong></p>
                            <p>3. Toque em <strong>Aparelhos conectados</strong></p>
                            <p>4. Toque em <strong>Conectar um aparelho</strong></p>
                            <p>5. Escaneie este código QR</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center pt-4">
                    <Button onClick={() => handleOpenChange(false)}>
                        Fechar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}