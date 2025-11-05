import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { IconApi, IconBrandWhatsapp, IconCreditCard, IconLayoutGrid, IconTicket } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { t } = useTranslation();

    const mainNavItems: NavItem[] = [
        {
            title: t('dashboard.title'),
            href: dashboard(),
            icon: IconLayoutGrid,
        },
        {
            title: t('whatsapp.title'),
            href: '/whatsapp',
            icon: IconBrandWhatsapp,
        },
        {
            title: t('billing.title'),
            href: '/billing',
            icon: IconCreditCard,
        },
        {
            title: t('support.title'),
            href: '/support/tickets',
            icon: IconTicket,
        },
        {
            title: t('api.title'),
            href: 'https://docs.zapclass.com.br',
            icon: IconApi,
            target: '_blank',
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
