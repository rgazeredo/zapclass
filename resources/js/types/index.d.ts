import { InertiaLinkProps } from '@inertiajs/react';
import { TablerIcon } from '@tabler/icons-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: TablerIcon | null;
    isActive?: boolean;
    items?: NavItem[];
    target?: string;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface WhatsAppConnection {
    id: number;
    tenant_id: number;
    name: string;
    system_name: string;
    admin_field_1?: string | null;
    admin_field_2?: string | null;
    phone?: string | null;
    token?: string | null;
    instance_id?: string | null;
    status?: string | null;
    api_key?: string | null;
    api_enabled?: boolean | null;
    api_rate_limit?: number | null;
    api_last_used_at?: string | null;
    api_usage_count?: number | null;
    created_at: string;
    updated_at: string;
}
