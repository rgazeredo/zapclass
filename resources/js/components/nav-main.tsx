import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    const { t } = useTranslation();

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>{t('navigation.platform', 'Platform')}</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <Collapsible key={item.title} asChild defaultOpen={item.items && page.url.startsWith(typeof item.href === 'string' ? item.href : item.href.url)}>
                        <SidebarMenuItem>
                            {item.items ? (
                                <>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton
                                            isActive={page.url.startsWith(typeof item.href === 'string' ? item.href : item.href.url)}
                                            tooltip={{ children: item.title }}
                                        >
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {item.items.map((subItem) => (
                                                <SidebarMenuSubItem key={subItem.title}>
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={page.url === (typeof subItem.href === 'string' ? subItem.href : subItem.href.url)}
                                                    >
                                                        <Link href={subItem.href} prefetch>
                                                            {subItem.icon && <subItem.icon />}
                                                            <span>{subItem.title}</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </>
                            ) : (
                                <SidebarMenuButton
                                    asChild
                                    isActive={page.url.startsWith(typeof item.href === 'string' ? item.href : item.href.url)}
                                    tooltip={{ children: item.title }}
                                >
                                    <Link href={item.href} prefetch>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            )}
                        </SidebarMenuItem>
                    </Collapsible>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
