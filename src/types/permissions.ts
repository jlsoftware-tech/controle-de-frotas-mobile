import type { Permission, PermissionAction, PermissionModule } from './profile';

export type ModulePermissionMap = Partial<Record<PermissionAction, boolean>>;
export type UserPermissions = Partial<Record<PermissionModule, ModulePermissionMap>> &
  Record<string, ModulePermissionMap | undefined>;

export interface SidebarSubItem {
  icon: string;
  name_sub_menu: string;
  description?: string;
  url: string;
}

export interface SidebarItem {
  icon: string;
  name_menu: string;
  sub_menu: SidebarSubItem[];
}

export interface PermissionsCatalogResponse {
  items: Permission[];
  pagination: {
    numPerPage: number;
    currPage: number;
    totalEntries: number;
    totalPages: number;
  };
}
