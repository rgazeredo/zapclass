import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { IconPlus, IconSearch, IconFilter } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Ticket {
    id: number;
    ticket_number: string;
    subject: string;
    status: string;
    priority: string;
    created_at: string;
    user: {
        name: string;
        email: string;
    };
    category: {
        name: string;
    } | null;
}

interface Category {
    id: number;
    name: string;
}

interface Props {
    tickets: {
        data: Ticket[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    categories: Category[];
    filters: {
        status?: string;
        priority?: string;
        category_id?: string;
        search?: string;
    };
}

const statusColors = {
    open: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    waiting_customer: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    waiting_staff: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
};

const priorityColors = {
    low: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

export default function Index({ tickets, categories, filters }: Props) {
    const { t } = useTranslation();

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            open: 'Aberto',
            in_progress: 'Em Andamento',
            waiting_customer: 'Aguardando Cliente',
            waiting_staff: 'Aguardando Suporte',
            resolved: 'Resolvido',
            closed: 'Fechado',
        };
        return labels[status] || status;
    };

    const getPriorityLabel = (priority: string) => {
        const labels: Record<string, string> = {
            low: 'Baixa',
            medium: 'Média',
            high: 'Alta',
            urgent: 'Urgente',
        };
        return labels[priority] || priority;
    };

    return (
        <AppLayout>
            <Head title={t('support.tickets.title')} />

            <div className="container mx-auto py-8 px-4">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">{t('support.tickets.myTickets')}</h1>
                        <p className="text-muted-foreground mt-1">
                            Gerencie suas solicitações de suporte
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/support/tickets/create">
                            <IconPlus className="mr-2 h-4 w-4" />
                            {t('support.tickets.newTicket')}
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filtros</CardTitle>
                        <CardDescription>Filtre os tickets por status, prioridade ou categoria</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <Input
                                    type="text"
                                    placeholder="Buscar por número ou assunto..."
                                    defaultValue={filters.search}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <Select defaultValue={filters.status}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Todos</SelectItem>
                                        <SelectItem value="open">Aberto</SelectItem>
                                        <SelectItem value="in_progress">Em Andamento</SelectItem>
                                        <SelectItem value="waiting_customer">Aguardando Cliente</SelectItem>
                                        <SelectItem value="waiting_staff">Aguardando Suporte</SelectItem>
                                        <SelectItem value="resolved">Resolvido</SelectItem>
                                        <SelectItem value="closed">Fechado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Select defaultValue={filters.priority}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Prioridade" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Todas</SelectItem>
                                        <SelectItem value="low">Baixa</SelectItem>
                                        <SelectItem value="medium">Média</SelectItem>
                                        <SelectItem value="high">Alta</SelectItem>
                                        <SelectItem value="urgent">Urgente</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Select defaultValue={filters.category_id}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Categoria" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Todas</SelectItem>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="mt-6">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Número</TableHead>
                                    <TableHead>Assunto</TableHead>
                                    <TableHead>Categoria</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Prioridade</TableHead>
                                    <TableHead>Criado em</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tickets.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            Nenhum ticket encontrado
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    tickets.data.map((ticket) => (
                                        <TableRow key={ticket.id}>
                                            <TableCell className="font-mono text-sm">
                                                {ticket.ticket_number}
                                            </TableCell>
                                            <TableCell>
                                                <Link
                                                    href={`/support/tickets/${ticket.id}`}
                                                    className="hover:underline font-medium"
                                                >
                                                    {ticket.subject}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                {ticket.category?.name || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={statusColors[ticket.status as keyof typeof statusColors]}>
                                                    {getStatusLabel(ticket.status)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={priorityColors[ticket.priority as keyof typeof priorityColors]}>
                                                    {getPriorityLabel(ticket.priority)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/support/tickets/${ticket.id}`}>
                                                        Ver
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {tickets.last_page > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                        {Array.from({ length: tickets.last_page }, (_, i) => i + 1).map((page) => (
                            <Button
                                key={page}
                                variant={page === tickets.current_page ? 'default' : 'outline'}
                                size="sm"
                                asChild
                            >
                                <Link href={`/support/tickets?page=${page}`}>{page}</Link>
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
