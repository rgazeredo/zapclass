import { Head, Link } from '@inertiajs/react';
import { IconX, IconArrowLeft, IconRefresh } from '@tabler/icons-react';

interface CancelProps {
    tenant?: {
        name: string;
        plan_metadata?: {
            name: string;
            description: string;
            price: number;
            currency: string;
            interval: string;
            features: string[];
        };
    } | null;
    message: string;
}

export default function Cancel({ tenant, message }: CancelProps) {
    const formatPrice = (price: number, currency: string) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: currency,
        }).format(price);
    };

    return (
        <>
            <Head title="Pagamento Cancelado" />

            <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    {/* Cancel Icon */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                            <IconX className="w-10 h-10 text-red-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Pagamento Cancelado
                        </h1>
                        <p className="text-gray-600">
                            O processo de pagamento foi interrompido
                        </p>
                    </div>

                    {/* Cancel Card */}
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                        <div className="text-center mb-6">
                            <p className="text-gray-700">
                                {message}
                            </p>
                        </div>

                        {tenant && tenant.plan_metadata && (
                            <div className="border-t border-gray-200 pt-4 mb-6">
                                <h3 className="font-medium text-gray-900 mb-2 text-center">
                                    Plano Selecionado: {tenant.plan_metadata.name}
                                </h3>

                                <div className="bg-gray-50 rounded-md p-4 mb-4">
                                    <div className="text-center mb-3">
                                        <div className="text-2xl font-bold text-gray-900">
                                            {formatPrice(tenant.plan_metadata.price, tenant.plan_metadata.currency)}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            por {tenant.plan_metadata.interval === 'month' ? 'mês' : 'ano'}
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-600 text-center mb-3">
                                        {tenant.plan_metadata.description}
                                    </p>

                                    <div className="text-xs text-gray-600">
                                        <p className="font-medium mb-2">Recursos inclusos:</p>
                                        <ul className="space-y-1">
                                            {tenant.plan_metadata.features.slice(0, 3).map((feature, index) => (
                                                <li key={index}>• {feature}</li>
                                            ))}
                                            {tenant.plan_metadata.features.length > 3 && (
                                                <li>• E mais {tenant.plan_metadata.features.length - 3} recursos...</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            {tenant && (
                                <Link
                                    href={`/subscription/retry/${tenant.name}`}
                                    method="post"
                                    className="inline-flex items-center justify-center w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
                                >
                                    <IconRefresh className="w-4 h-4 mr-2" />
                                    Tentar Novamente
                                </Link>
                            )}

                            <Link
                                href="/"
                                className="inline-flex items-center justify-center w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-200 transition-colors font-medium"
                            >
                                <IconArrowLeft className="w-4 h-4 mr-2" />
                                Voltar ao Início
                            </Link>
                        </div>
                    </div>

                    {/* Help Info */}
                    <div className="bg-orange-50 rounded-lg p-4 text-center">
                        <p className="text-sm text-orange-800">
                            <strong>Precisa de ajuda?</strong> Entre em contato conosco pelo WhatsApp
                            ou email. Estamos aqui para auxiliá-lo com qualquer dúvida sobre nossos planos.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}