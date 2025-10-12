import { Head, Link } from '@inertiajs/react';
import { IconArrowRight, IconCheck } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface SuccessProps {
    tenant: {
        name: string;
        plan_name: string;
        description: string;
        features?: string[];
    };
    subscription: {
        id: string;
        status: string;
    };
}

export default function Success({ tenant, subscription }: SuccessProps) {
    const { t } = useTranslation();

    return (
        <>
            <Head title={t('subscription.success.pageTitle')} />

            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
                <div className="w-full max-w-md">
                    {/* Success Icon */}
                    <div className="mb-8 text-center">
                        <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                            <IconCheck className="h-10 w-10 text-green-600" />
                        </div>
                        <h1 className="mb-2 text-3xl font-bold text-gray-900">{t('subscription.success.title')}</h1>
                        <p className="text-gray-600">{t('subscription.success.description')}</p>
                    </div>

                    {/* Success Card */}
                    <div className="mb-6 rounded-lg bg-white p-6 shadow-lg">
                        <div className="mb-4 border-b border-gray-200 pb-4">
                            <h2 className="text-lg font-semibold text-gray-900">{t('subscription.success.welcomeToZapClass')}</h2>
                            <p className="text-sm text-gray-600">
                                {t('subscription.success.company')} <strong>{tenant.name}</strong>
                            </p>
                        </div>

                        {tenant && (
                            <div className="mb-4">
                                <h3 className="mb-2 font-medium text-gray-900">{t('subscription.success.activePlan', { name: tenant.plan_name })}</h3>
                                <p className="mb-3 text-sm text-gray-600">{tenant.description}</p>

                                <div className="rounded-md bg-gray-50 p-3">
                                    <p className="mb-2 text-xs text-gray-700">
                                        <strong>{t('subscription.success.includedFeatures')}</strong>
                                    </p>
                                    <ul className="space-y-1 text-xs text-gray-600">
                                        {(
                                            tenant.features || [
                                                t('subscription.success.defaultFeatures.whatsappConnection'),
                                                t('subscription.success.defaultFeatures.completeDashboard'),
                                                t('subscription.success.defaultFeatures.unlimitedMessages'),
                                                t('subscription.success.defaultFeatures.technicalSupport')
                                            ]
                                        ).map((feature, index) => (
                                            <li key={index} className="flex items-start">
                                                <IconCheck className="mt-0.5 mr-1 h-3 w-3 flex-shrink-0 text-green-500" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        <div className="mb-4 rounded-md bg-green-50 p-3">
                            <p className="text-xs text-green-800">
                                <strong>{t('subscription.success.subscriptionId')}</strong> {subscription.id}
                            </p>
                            <p className="text-xs text-green-800">
                                <strong>{t('subscription.success.status')}</strong> {subscription.status === 'active' ? t('subscription.success.statusActive') : subscription.status}
                            </p>
                        </div>

                        <div className="text-center">
                            <Link
                                href="/dashboard"
                                className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700"
                            >
                                {t('subscription.success.accessDashboard')}
                                <IconArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="rounded-lg bg-blue-50 p-4 text-center">
                        <p className="text-sm text-blue-800">
                            <strong>{t('subscription.success.nextSteps')}</strong> {t('subscription.success.nextStepsDescription')}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
