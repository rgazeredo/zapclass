import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { LayoutGrid } from 'lucide-react';
import { IconBrandWhatsapp, IconApi, IconMessage2, IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { t } = useTranslation();

    const mainNavItems: NavItem[] = [
        {
            title: t('dashboard.title'),
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: t('whatsapp.title'),
            href: '/whatsapp',
            icon: IconBrandWhatsapp,
        },
        {
            title: 'Documentação da API',
            href: '/api-docs',
            icon: IconApi,
            items: [
                {
                    title: 'Enviar Mensagem',
                    href: '/api-docs/send-message',
                    icon: IconMessage2,
                },
                {
                    title: 'Status da Mensagem',
                    href: '/api-docs/message-status',
                    icon: IconInfoCircle,
                },
                {
                    title: 'Informações da Conexão',
                    href: '/api-docs/connection-info',
                    icon: IconApi,
                },
            ],
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
