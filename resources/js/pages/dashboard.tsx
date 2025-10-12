import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import billing from '@/routes/billing';
import whatsapp from '@/routes/whatsapp';
import { type BreadcrumbItem, type User, type WhatsAppConnection } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    IconBook,
    IconBrandWhatsapp,
    IconBuilding,
    IconCalendar,
    IconChartBar,
    IconCircleCheck,
    IconCircleX,
    IconCreditCard,
    IconFileDescription,
    IconSettings,
    IconShield,
    IconSparkles,
    IconUsersGroup,
    IconWebhook,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface DashboardProps {
    auth: {
        user: User & {
            tenant?: {
                id: number;
                name: string;
                slug: string;
                settings: Record<string, unknown>;
            };
        };
    };
    connections?: WhatsAppConnection[];
    connectionsCount?: number;
    connectedCount?: number;
    subscriptions?: Array<{
        id: string;
        name: string;
        stripe_status: string;
        stripe_price?: string;
        trial_ends_at?: string;
        ends_at?: string;
    }>;
    webhooksCount?: number;
}

function ClientDashboard({
    tenant,
    connections = [],
    connectionsCount = 0,
    connectedCount = 0,
    subscriptions = [],
    webhooksCount = 0,
}: {
    tenant?: DashboardProps['auth']['user']['tenant'];
    connections?: WhatsAppConnection[];
    connectionsCount?: number;
    connectedCount?: number;
    subscriptions?: DashboardProps['subscriptions'];
    webhooksCount?: number;
}) {
    const { t } = useTranslation();

    const activeSubscription = subscriptions?.find((sub) => sub.stripe_status === 'active' || sub.stripe_status === 'trialing');

    return (
        <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
            {tenant && (
                <Card className="mb-4">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <IconBuilding className="h-5 w-5" />
                            {tenant.name}
                        </CardTitle>
                        <CardDescription>{t('dashboard.organizationPanel')}</CardDescription>
                    </CardHeader>
                </Card>
            )}

            {/* Statistics Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <IconBrandWhatsapp className="h-5 w-5" />
                            {t('dashboard.whatsappConnections')}
                        </CardTitle>
                        <CardDescription>{t('dashboard.connectionsOverview')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <div className="text-3xl font-bold text-blue-600">{connectionsCount}</div>
                                <p className="text-sm text-gray-600">{t('dashboard.connectionsContracted')}</p>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-green-600">{connectedCount}</div>
                                <p className="text-sm text-gray-600">{t('dashboard.connectionsActive')}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <IconCreditCard className="h-5 w-5" />
                            {t('dashboard.mySubscriptions')}
                        </CardTitle>
                        <CardDescription>{t('dashboard.activeSubscriptions')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-1 text-lg font-semibold text-gray-900">
                            {activeSubscription ? activeSubscription.name : t('dashboard.noActivePlan')}
                        </div>
                        <p className="text-sm text-gray-600">{activeSubscription ? t('dashboard.activePlan') : ''}</p>
                        <Link href={billing.index().url}>
                            <Button variant="link" className="mt-2 px-0">
                                {t('dashboard.viewSubscriptions')} →
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <IconWebhook className="h-5 w-5" />
                            {t('dashboard.webhooks')}
                        </CardTitle>
                        <CardDescription>{t('dashboard.configuredWebhooks')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-2 text-3xl font-bold text-purple-600">{webhooksCount}</div>
                        <p className="text-sm text-gray-600">{webhooksCount === 1 ? t('dashboard.webhook') : t('dashboard.webhooks_plural')}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* My Connections */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('dashboard.myConnections')}</CardTitle>
                        <CardDescription>{t('dashboard.connectedConnections')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {connections.length > 0 ? (
                                connections.slice(0, 5).map((connection) => (
                                    <div key={connection.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                                        <div className="flex items-center gap-3">
                                            <IconBrandWhatsapp className="h-5 w-5 text-green-600" />
                                            <div>
                                                <h4 className="font-medium">{connection.name}</h4>
                                                <p className="text-sm text-gray-600">{connection.phone || t('whatsapp.notDefined')}</p>
                                            </div>
                                        </div>
                                        <Badge variant={connection.status === 'connected' ? 'default' : 'secondary'}>
                                            {connection.status === 'connected' ? (
                                                <span className="flex items-center gap-1">
                                                    <IconCircleCheck className="h-3 w-3" />
                                                    {t('dashboard.connected')}
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1">
                                                    <IconCircleX className="h-3 w-3" />
                                                    {t('dashboard.disconnected')}
                                                </span>
                                            )}
                                        </Badge>
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center">
                                    <IconBrandWhatsapp className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                                    <p className="mb-2 text-gray-500">{t('dashboard.noConnectionsYet')}</p>
                                    <p className="mb-4 text-sm text-gray-400">{t('dashboard.createYourFirstConnection')}</p>
                                    <Link href={whatsapp.index().url}>
                                        <Button size="sm">{t('dashboard.addConnection')}</Button>
                                    </Link>
                                </div>
                            )}
                            {connections.length > 0 && (
                                <Link href={whatsapp.index().url}>
                                    <Button variant="outline" className="mt-3 w-full">
                                        {t('dashboard.manageConnections')}
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Courses Coming Soon */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <IconBook className="h-5 w-5" />
                            {t('dashboard.courses')}
                        </CardTitle>
                        <CardDescription>{t('dashboard.comingSoon')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="py-8 text-center">
                            <IconSparkles className="mx-auto mb-4 h-16 w-16 text-yellow-500" />
                            <p className="mb-2 text-gray-600">{t('dashboard.coursesDescription')}</p>
                            <p className="text-sm text-gray-500">{t('dashboard.stayTuned')}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Access */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('dashboard.quickAccess')}</CardTitle>
                    <CardDescription>{t('dashboard.accessMainFeatures')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <a href="https://docs.zapclass.com.br" target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" className="h-20 w-full flex-col gap-2">
                                <IconFileDescription className="h-5 w-5" />
                                <span className="text-center font-semibold">{t('dashboard.apiDocumentation')}</span>
                            </Button>
                        </a>
                        <Link href={billing.index().url}>
                            <Button variant="outline" className="h-20 w-full flex-col gap-2">
                                <IconCreditCard className="h-5 w-5" />
                                <span className="text-center font-semibold">{t('dashboard.billing')}</span>
                            </Button>
                        </Link>
                        <Link href={whatsapp.index().url}>
                            <Button variant="outline" className="h-20 w-full flex-col gap-2">
                                <IconBrandWhatsapp className="h-5 w-5" />
                                <span className="text-center font-semibold">{t('whatsapp.connections')}</span>
                            </Button>
                        </Link>
                        <Link href="/settings">
                            <Button variant="outline" className="h-20 w-full flex-col gap-2">
                                <IconSettings className="h-5 w-5" />
                                <span className="text-center font-semibold">{t('dashboard.settings')}</span>
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function AdminDashboard({ allTenants }: { allTenants?: Array<{ id: number; name: string; slug: string; users_count: number; is_active: boolean }> }) {
    const { t } = useTranslation();
    return (
        <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
            <Card className="mb-4">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <IconShield className="h-5 w-5" />
                        {t('dashboard.globalAdministration')}
                    </CardTitle>
                    <CardDescription>{t('dashboard.tenantAdminPanel')}</CardDescription>
                </CardHeader>
            </Card>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{t('dashboard.totalTenants')}</CardTitle>
                        <CardDescription>{t('dashboard.activeOrganizations')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-1 text-3xl font-bold text-blue-600">{allTenants?.filter((t) => t.is_active).length || 0}</div>
                        <p className="text-sm text-gray-600">{t('dashboard.activeOrganizations')}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{t('dashboard.totalUsers')}</CardTitle>
                        <CardDescription>{t('dashboard.usersAllTenants')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-1 text-3xl font-bold text-green-600">
                            {allTenants?.reduce((acc, tenant) => acc + tenant.users_count, 0) || 0}
                        </div>
                        <p className="text-sm text-green-600">{t('dashboard.allTenants')}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{t('dashboard.largestTenant')}</CardTitle>
                        <CardDescription>{t('dashboard.organizationWithMostUsers')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-1 text-lg font-bold text-purple-600">
                            {allTenants?.reduce((max, tenant) => (tenant.users_count > (max?.users_count || 0) ? tenant : max), allTenants[0])
                                ?.name || 'N/A'}
                        </div>
                        <p className="text-sm text-gray-600">
                            {allTenants?.reduce((max, tenant) => (tenant.users_count > (max?.users_count || 0) ? tenant : max), allTenants[0])
                                ?.users_count || 0}{' '}
                            {t('dashboard.users')}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{t('dashboard.system')}</CardTitle>
                        <CardDescription>{t('dashboard.generalStatus')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-1 text-lg font-bold text-green-600">{t('dashboard.operational')}</div>
                        <p className="text-sm text-green-600">{t('dashboard.allSystems')}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>{t('dashboard.activeTenants')}</CardTitle>
                        <CardDescription>{t('dashboard.platformRegisteredOrganizations')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {allTenants?.map((tenant) => (
                                <div key={tenant.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                                    <div>
                                        <h4 className="font-medium">{tenant.name}</h4>
                                        <p className="text-sm text-gray-600">
                                            {tenant.users_count} {t('dashboard.user')}(s)
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Badge variant={tenant.is_active ? 'default' : 'secondary'}>
                                            {tenant.is_active ? t('dashboard.active') : t('dashboard.inactive')}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                            {!allTenants?.length && <p className="py-4 text-center text-gray-500">{t('dashboard.noTenantsFound')}</p>}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('dashboard.adminActions')}</CardTitle>
                        <CardDescription>{t('dashboard.platformManagement')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <Button className="w-full justify-start gap-2">
                                <IconUsersGroup className="h-4 w-4" />
                                {t('dashboard.manageTenants')}
                            </Button>
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <IconBuilding className="h-4 w-4" />
                                {t('dashboard.createNewTenant')}
                            </Button>
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <IconChartBar className="h-4 w-4" />
                                {t('dashboard.globalReports')}
                            </Button>
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <IconSettings className="h-4 w-4" />
                                {t('dashboard.systemSettings')}
                            </Button>
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <IconCalendar className="h-4 w-4" />
                                {t('dashboard.activityLogs')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('dashboard.recentActivity')}</CardTitle>
                        <CardDescription>{t('dashboard.lastSystemActions')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="border-l-4 border-blue-500 py-2 pl-4">
                                <p className="text-sm font-medium">{t('dashboard.newUserRegistered')}</p>
                                <p className="text-xs text-gray-600">há 2 minutos</p>
                            </div>
                            <div className="border-l-4 border-green-500 py-2 pl-4">
                                <p className="text-sm font-medium">{t('dashboard.classCreatedBy', { teacher: 'Prof. Maria' })}</p>
                                <p className="text-xs text-gray-600">há 15 minutos</p>
                            </div>
                            <div className="border-l-4 border-orange-500 py-2 pl-4">
                                <p className="text-sm font-medium">{t('dashboard.paymentProcessed')}</p>
                                <p className="text-xs text-gray-600">há 1 hora</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('dashboard.systemAlerts')}</CardTitle>
                        <CardDescription>{t('dashboard.importantNotifications')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                                <p className="text-sm font-medium text-yellow-800">{t('dashboard.backupScheduled')}</p>
                            </div>
                            <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                                <p className="text-sm font-medium text-green-800">{t('dashboard.systemRunningNormally')}</p>
                            </div>
                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                                <p className="text-sm font-medium text-blue-800">{t('dashboard.updateAvailable')}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function Dashboard({
    auth,
    tenants,
    connections,
    connectionsCount,
    connectedCount,
    subscriptions,
    webhooksCount,
}: DashboardProps & {
    tenants?: Array<{ id: number; name: string; slug: string; users_count: number; is_active: boolean }>;
}) {
    const isAdmin = auth.user.role === 'admin';
    const { t } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('dashboard.title'),
            href: dashboard().url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head
                title={`${t('dashboard.title')} ${isAdmin ? `- ${t('dashboard.administration')}` : auth.user.tenant ? `- ${auth.user.tenant.name}` : `- ${t('dashboard.clientAdmin')}`}`}
            />
            {isAdmin ? (
                <AdminDashboard allTenants={tenants} />
            ) : (
                <ClientDashboard
                    tenant={auth.user.tenant}
                    connections={connections}
                    connectionsCount={connectionsCount}
                    connectedCount={connectedCount}
                    subscriptions={subscriptions}
                    webhooksCount={webhooksCount}
                />
            )}
        </AppLayout>
    );
}
