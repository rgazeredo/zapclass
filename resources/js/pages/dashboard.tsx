import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type User } from '@/types';
import { Head } from '@inertiajs/react';
import {
    IconBuilding,
    IconUsers,
    IconTrendingUp,
    IconCalendar,
    IconBook,
    IconUser,
    IconHeadphones,
    IconSettings,
    IconUsersGroup,
    IconChartBar,
    IconCash,
    IconShield
} from '@tabler/icons-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface DashboardProps {
    auth: {
        user: User & {
            tenant?: {
                id: number;
                name: string;
                slug: string;
                settings: Record<string, any>;
            };
        };
    };
}

function ClientDashboard({ tenant }: { tenant?: DashboardProps['auth']['user']['tenant'] }) {
    return (
        <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
            {tenant && (
                <Card className="mb-4">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <IconBuilding className="h-5 w-5" />
                            {tenant.name}
                        </CardTitle>
                        <CardDescription>
                            Painel da sua organização
                        </CardDescription>
                    </CardHeader>
                </Card>
            )}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Minhas Aulas</CardTitle>
                        <CardDescription>
                            Acompanhe suas aulas matriculadas
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                            5
                        </div>
                        <p className="text-sm text-gray-600">
                            Aulas ativas
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Progresso</CardTitle>
                        <CardDescription>
                            Seu progresso geral
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600 mb-2">
                            75%
                        </div>
                        <p className="text-sm text-gray-600">
                            Completado
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Próxima Aula</CardTitle>
                        <CardDescription>
                            Sua próxima atividade
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-semibold text-gray-900 mb-1">
                            Matemática
                        </div>
                        <p className="text-sm text-gray-600">
                            Hoje, 14:00
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Aulas Recentes</CardTitle>
                        <CardDescription>
                            Suas últimas atividades
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <h4 className="font-medium">Português</h4>
                                    <p className="text-sm text-gray-600">Aula 15 - Gramática</p>
                                </div>
                                <Badge variant="secondary">Concluída</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <h4 className="font-medium">História</h4>
                                    <p className="text-sm text-gray-600">Aula 8 - Idade Média</p>
                                </div>
                                <Badge variant="secondary">Concluída</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                <div>
                                    <h4 className="font-medium">Matemática</h4>
                                    <p className="text-sm text-gray-600">Aula 12 - Álgebra</p>
                                </div>
                                <Badge>Em andamento</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Ações Rápidas</CardTitle>
                        <CardDescription>
                            Acesso rápido às principais funcionalidades
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <Button className="h-20 flex-col gap-2">
                                <IconBook className="h-5 w-5" />
                                <div className="text-center">
                                    <span className="text-sm">Ver</span>
                                    <br />
                                    <span className="font-semibold">Aulas</span>
                                </div>
                            </Button>
                            <Button variant="outline" className="h-20 flex-col gap-2">
                                <IconUser className="h-5 w-5" />
                                <div className="text-center">
                                    <span className="text-sm">Meu</span>
                                    <br />
                                    <span className="font-semibold">Perfil</span>
                                </div>
                            </Button>
                            <Button variant="outline" className="h-20 flex-col gap-2">
                                <IconHeadphones className="h-5 w-5" />
                                <div className="text-center">
                                    <span className="text-sm">Suporte</span>
                                    <br />
                                    <span className="font-semibold">Contato</span>
                                </div>
                            </Button>
                            <Button variant="outline" className="h-20 flex-col gap-2">
                                <IconSettings className="h-5 w-5" />
                                <span className="font-semibold">Configurações</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function AdminDashboard({ allTenants }: { allTenants?: Array<{ id: number; name: string; slug: string; users_count: number; is_active: boolean }> }) {
    return (
        <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
            <Card className="mb-4">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <IconShield className="h-5 w-5" />
                        Administração Global
                    </CardTitle>
                    <CardDescription>
                        Painel de administração de todos os tenants
                    </CardDescription>
                </CardHeader>
            </Card>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Total Tenants</CardTitle>
                        <CardDescription>
                            Organizações ativas
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-600 mb-1">
                            {allTenants?.filter(t => t.is_active).length || 0}
                        </div>
                        <p className="text-sm text-gray-600">
                            Organizações ativas
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Total Usuários</CardTitle>
                        <CardDescription>
                            Usuários em todos os tenants
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600 mb-1">
                            {allTenants?.reduce((acc, tenant) => acc + tenant.users_count, 0) || 0}
                        </div>
                        <p className="text-sm text-green-600">
                            Todos os tenants
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Maior Tenant</CardTitle>
                        <CardDescription>
                            Organização com mais usuários
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold text-purple-600 mb-1">
                            {allTenants?.reduce((max, tenant) =>
                                tenant.users_count > (max?.users_count || 0) ? tenant : max,
                                allTenants[0]
                            )?.name || 'N/A'}
                        </div>
                        <p className="text-sm text-gray-600">
                            {allTenants?.reduce((max, tenant) =>
                                tenant.users_count > (max?.users_count || 0) ? tenant : max,
                                allTenants[0]
                            )?.users_count || 0} usuários
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Sistema</CardTitle>
                        <CardDescription>
                            Status geral
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold text-green-600 mb-1">
                            Operacional
                        </div>
                        <p className="text-sm text-green-600">
                            Todos os sistemas
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Tenants Ativos</CardTitle>
                        <CardDescription>
                            Organizações registradas na plataforma
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {allTenants?.map((tenant) => (
                                <div key={tenant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <h4 className="font-medium">{tenant.name}</h4>
                                        <p className="text-sm text-gray-600">{tenant.users_count} usuário(s)</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Badge variant={tenant.is_active ? 'default' : 'secondary'}>
                                            {tenant.is_active ? 'Ativo' : 'Inativo'}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                            {!allTenants?.length && (
                                <p className="text-gray-500 text-center py-4">Nenhum tenant encontrado</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Ações Admin</CardTitle>
                        <CardDescription>
                            Gerenciamento da plataforma
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <Button className="w-full justify-start gap-2">
                                <IconUsersGroup className="h-4 w-4" />
                                Gerenciar Tenants
                            </Button>
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <IconBuilding className="h-4 w-4" />
                                Criar Novo Tenant
                            </Button>
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <IconChartBar className="h-4 w-4" />
                                Relatórios Globais
                            </Button>
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <IconSettings className="h-4 w-4" />
                                Configurações Sistema
                            </Button>
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <IconCalendar className="h-4 w-4" />
                                Logs de Atividade
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Atividade Recente</CardTitle>
                        <CardDescription>
                            Últimas ações no sistema
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="border-l-4 border-blue-500 pl-4 py-2">
                                <p className="text-sm font-medium">Novo usuário cadastrado</p>
                                <p className="text-xs text-gray-600">há 2 minutos</p>
                            </div>
                            <div className="border-l-4 border-green-500 pl-4 py-2">
                                <p className="text-sm font-medium">Aula criada por Prof. Maria</p>
                                <p className="text-xs text-gray-600">há 15 minutos</p>
                            </div>
                            <div className="border-l-4 border-orange-500 pl-4 py-2">
                                <p className="text-sm font-medium">Pagamento processado</p>
                                <p className="text-xs text-gray-600">há 1 hora</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Alertas do Sistema</CardTitle>
                        <CardDescription>
                            Notificações importantes
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <p className="text-sm font-medium text-yellow-800">
                                    Backup agendado para hoje às 23:00
                                </p>
                            </div>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <p className="text-sm font-medium text-green-800">
                                    Sistema funcionando normalmente
                                </p>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-sm font-medium text-blue-800">
                                    Atualização disponível v2.1.0
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function Dashboard({ auth, tenants }: DashboardProps & { tenants?: Array<{ id: number; name: string; slug: string; users_count: number; is_active: boolean }> }) {
    const isAdmin = auth.user.role === 'admin';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Dashboard ${isAdmin ? '- Administração' : auth.user.tenant ? `- ${auth.user.tenant.name}` : '- Cliente'}`} />
            {isAdmin ? <AdminDashboard allTenants={tenants} /> : <ClientDashboard tenant={auth.user.tenant} />}
        </AppLayout>
    );
}
