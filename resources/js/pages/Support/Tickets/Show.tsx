import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { IconArrowLeft, IconSend } from '@tabler/icons-react';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Message {
    id: number;
    message: string;
    created_at: string;
    is_internal: boolean;
    user: User;
}

interface Ticket {
    id: number;
    ticket_number: string;
    subject: string;
    description: string;
    status: string;
    priority: string;
    created_at: string;
    user: User;
    category: {
        name: string;
    } | null;
    messages: Message[];
}

interface Props {
    ticket: Ticket;
    admins?: User[] | null;
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

export default function Show({ ticket, admins }: Props) {
    const { t } = useTranslation();
    const { data, setData, post, processing, reset } = useForm({
        message: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/support/tickets/${ticket.id}/messages`, {
            onSuccess: () => reset('message'),
        });
    };

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

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <AppLayout>
            <Head title={`Ticket ${ticket.ticket_number}`} />

            <div className="container mx-auto py-8 px-4 max-w-5xl">
                <div className="mb-6">
                    <Button variant="ghost" asChild className="mb-4">
                        <Link href="/support/tickets">
                            <IconArrowLeft className="mr-2 h-4 w-4" />
                            Voltar para tickets
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-sm text-muted-foreground font-mono">
                                                {ticket.ticket_number}
                                            </span>
                                            <Badge className={statusColors[ticket.status as keyof typeof statusColors]}>
                                                {getStatusLabel(ticket.status)}
                                            </Badge>
                                            <Badge className={priorityColors[ticket.priority as keyof typeof priorityColors]}>
                                                {getPriorityLabel(ticket.priority)}
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-2xl">{ticket.subject}</CardTitle>
                                        <CardDescription className="mt-2">
                                            Criado em {new Date(ticket.created_at).toLocaleString('pt-BR')}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="prose dark:prose-invert max-w-none">
                                    <p className="whitespace-pre-wrap">{ticket.description}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Conversa</CardTitle>
                                <CardDescription>
                                    {ticket.messages.length} mensagem(ns)
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {ticket.messages.map((message) => (
                                    <div key={message.id} className="flex gap-4">
                                        <Avatar>
                                            <AvatarFallback>
                                                {getInitials(message.user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-baseline gap-2">
                                                <span className="font-semibold">{message.user.name}</span>
                                                <span className="text-sm text-muted-foreground">
                                                    {new Date(message.created_at).toLocaleString('pt-BR')}
                                                </span>
                                                {message.is_internal && (
                                                    <Badge variant="outline" className="text-xs">
                                                        Interna
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="mt-2 whitespace-pre-wrap text-sm">
                                                {message.message}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {ticket.messages.length === 0 && (
                                    <p className="text-center text-muted-foreground py-8">
                                        Nenhuma mensagem ainda. Seja o primeiro a responder!
                                    </p>
                                )}

                                <Separator className="my-6" />

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="message">Adicionar Resposta</Label>
                                        <Textarea
                                            id="message"
                                            value={data.message}
                                            onChange={(e) => setData('message', e.target.value)}
                                            placeholder="Digite sua mensagem..."
                                            rows={4}
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={processing || !data.message.trim()}>
                                            <IconSend className="mr-2 h-4 w-4" />
                                            {processing ? 'Enviando...' : 'Enviar Mensagem'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Detalhes</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-muted-foreground">Categoria</Label>
                                    <p className="mt-1">{ticket.category?.name || 'Não definida'}</p>
                                </div>
                                <Separator />
                                <div>
                                    <Label className="text-muted-foreground">Criado por</Label>
                                    <p className="mt-1">{ticket.user.name}</p>
                                    <p className="text-sm text-muted-foreground">{ticket.user.email}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
