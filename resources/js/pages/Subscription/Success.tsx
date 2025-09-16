import { Head, Link } from '@inertiajs/react';
import { IconCheck, IconArrowRight } from '@tabler/icons-react';

interface SuccessProps {
    tenant: {
        name: string;
        plan_metadata?: {
            name: string;
            description: string;
            price: number;
            currency: string;
            interval: string;
            features?: string[];
        };
    };
    subscription: {
        id: string;
        status: string;
    };
}

export default function Success({ tenant, subscription }: SuccessProps) {
    return (
        <>
            <Head title="Assinatura Confirmada" />

            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    {/* Success Icon */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                            <IconCheck className="w-10 h-10 text-green-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Pagamento Confirmado!
                        </h1>
                        <p className="text-gray-600">
                            Sua assinatura foi ativada com sucesso
                        </p>
                    </div>

                    {/* Success Card */}
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                        <div className="border-b border-gray-200 pb-4 mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Bem-vindo ao ZapClass!
                            </h2>
                            <p className="text-sm text-gray-600">
                                Empresa: <strong>{tenant.name}</strong>
                            </p>
                        </div>

                        {tenant.plan_metadata && (
                            <div className="mb-4">
                                <h3 className="font-medium text-gray-900 mb-2">
                                    Plano Ativo: {tenant.plan_metadata.name}
                                </h3>
                                <p className="text-sm text-gray-600 mb-3">
                                    {tenant.plan_metadata.description}
                                </p>

                                <div className="bg-gray-50 rounded-md p-3">
                                    <p className="text-xs text-gray-700 mb-2">
                                        <strong>Recursos inclusos:</strong>
                                    </p>
                                    <ul className="text-xs text-gray-600 space-y-1">
                                        {(tenant.plan_metadata?.features || [
                                            'Conexão WhatsApp',
                                            'Dashboard completo',
                                            'Mensagens ilimitadas',
                                            'Suporte técnico'
                                        ]).map((feature, index) => (
                                            <li key={index} className="flex items-start">
                                                <IconCheck className="w-3 h-3 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        <div className="bg-green-50 rounded-md p-3 mb-4">
                            <p className="text-xs text-green-800">
                                <strong>ID da Assinatura:</strong> {subscription.id}
                            </p>
                            <p className="text-xs text-green-800">
                                <strong>Status:</strong> {subscription.status === 'active' ? 'Ativa' : subscription.status}
                            </p>
                        </div>

                        <div className="text-center">
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center justify-center w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
                            >
                                Acessar Dashboard
                                <IconArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <p className="text-sm text-blue-800">
                            <strong>Próximos passos:</strong> Explore o dashboard e comece a configurar
                            sua conta. Se precisar de ajuda, nossa equipe está pronta para auxiliá-lo.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}