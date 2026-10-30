import React, { useState } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  ArrowUpDown,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  ShieldX,
  Trash2,
} from 'lucide-react-native';
import { AppHeader } from '@/components/layout/Header';
import { AppButton } from '@/components/ui/Button';
import { AppModal } from '@/components/ui/Modal';
import { AppInput } from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { PaginationBar } from '@/components/ui/PaginationBar';
import { AppCard } from '@/components/ui/Card';
import { PermissionPicker } from '@/components/ui/PermissionPicker';
import {
  useProfiles,
  useCreateProfile,
  useUpdateProfile,
  useDeleteProfile,
} from '@/hooks/useProfiles';
import { usePermissionsCatalog, useUserPermissions } from '@/hooks/usePermissions';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { createProfileSchema } from '@/schemas/profile.schema';
import type { Profile } from '@/types/profile';
import type { SortDirection } from '@/types/api';
import { ACTION_LABELS, DEFAULT_PAGE_SIZE, MODULE_LABELS } from '@/utils/constants';
import { getApiErrorMessage } from '@/utils/errors';
import { confirmAction, showAlert } from '@/utils/confirm';
import { listStyles as styles } from '@/styles/lists';

type ProfileFormValues = {
  name: string;
  description: string;
  permissions: number[];
};

const EMPTY_FORM: ProfileFormValues = {
  name: '',
  description: '',
  permissions: [],
};

function permissionLabel(module: string, action: string): string {
  return `${MODULE_LABELS[module] ?? module} · ${ACTION_LABELS[action] ?? action}`;
}

interface ProfileRowProps {
  profile: Profile;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (profile: Profile) => void;
  onDelete: (profile: Profile) => void;
}

const ProfileRow = ({ profile, canEdit, canDelete, onEdit, onDelete }: ProfileRowProps) => {
  const theme = useTheme();
  const permissions = profile.permissions ?? [];
  const visiblePermissions = permissions.slice(0, 4);
  const remaining = permissions.length - visiblePermissions.length;

  return (
    <AppCard style={styles.itemCard}>
      <View style={styles.itemRow}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: theme.colors.secondaryContainer,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ShieldCheck size={22} color={theme.colors.secondary} />
        </View>

        <View style={styles.itemInfo}>
          <Text style={[styles.itemTitle, { color: theme.colors.onSurface }]} numberOfLines={1}>
            {profile.name}
          </Text>
          {profile.description ? (
            <Text
              style={[styles.itemSubtitle, { color: theme.colors.onSurfaceVariant }]}
              numberOfLines={2}
            >
              {profile.description}
            </Text>
          ) : (
            <Text style={[styles.itemSubtitle, { color: theme.colors.onSurfaceVariant }]}>
              Sem descrição
            </Text>
          )}

          <View style={styles.tagRow}>
            {visiblePermissions.map((permission) => (
              <View
                key={permission.id}
                style={[styles.tag, { backgroundColor: theme.colors.primaryContainer }]}
              >
                <Text style={[styles.tagText, { color: theme.colors.onPrimaryContainer }]}>
                  {permissionLabel(String(permission.module), String(permission.action))}
                </Text>
              </View>
            ))}
            {remaining > 0 && (
              <View style={[styles.tag, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Text style={[styles.tagText, { color: theme.colors.onSurfaceVariant }]}>
                  +{remaining}
                </Text>
              </View>
            )}
            {permissions.length === 0 && (
              <Text style={[styles.tagText, { color: theme.colors.onSurfaceVariant }]}>
                Nenhuma permissão
              </Text>
            )}
          </View>
        </View>

        {(canEdit || canDelete) && (
          <View style={styles.itemActions}>
            {canEdit && (
              <IconButton
                icon={<Pencil size={17} color={theme.colors.onSurface} />}
                label={`Editar ${profile.name}`}
                onPress={() => onEdit(profile)}
                size={38}
              />
            )}
            {canDelete && (
              <IconButton
                icon={<Trash2 size={17} color={theme.colors.error} />}
                label={`Excluir ${profile.name}`}
                onPress={() => onDelete(profile)}
                variant="danger"
                size={38}
              />
            )}
          </View>
        )}
      </View>
    </AppCard>
  );
};

export default function ProfilesScreen() {
  const theme = useTheme();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 400);
  const [page, setPage] = useState(1);
  const [order, setOrder] = useState<SortDirection>('asc');
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Profile | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const permissions = useUserPermissions();
  const canView = permissions.can('profiles', 'view');
  const canCreate = permissions.can('profiles', 'create');
  const canUpdate = permissions.can('profiles', 'update');
  const canDelete = permissions.can('profiles', 'delete');

  const profilesQuery = useProfiles(
    {
      page,
      per_page: DEFAULT_PAGE_SIZE,
      search: debouncedSearch || undefined,
      sort: 'name',
      order,
    },
    canView,
  );

  const catalogQuery = usePermissionsCatalog(modalVisible);
  const createProfile = useCreateProfile();
  const updateProfile = useUpdateProfile();
  const deleteProfile = useDeleteProfile();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(createProfileSchema) as unknown as Resolver<ProfileFormValues>,
    defaultValues: EMPTY_FORM,
  });

  const openCreate = () => {
    setEditing(null);
    setFormError(null);
    reset(EMPTY_FORM);
    setModalVisible(true);
  };

  const openEdit = (profile: Profile) => {
    setEditing(profile);
    setFormError(null);
    reset({
      name: profile.name,
      description: profile.description ?? '',
      permissions: profile.permissions?.map((permission) => permission.id) ?? [],
    });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditing(null);
    setFormError(null);
  };

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    const payload = {
      name: values.name.trim(),
      description: values.description.trim(),
      permissions: values.permissions,
    };

    try {
      if (editing) {
        await updateProfile.mutateAsync({ id: editing.id, data: payload });
      } else {
        await createProfile.mutateAsync(payload);
      }
      closeModal();
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  });

  const confirmDelete = (profile: Profile) => {
    confirmAction({
      title: 'Excluir perfil',
      message: `Deseja excluir "${profile.name}"? Usuários vinculados a este perfil podem perder o acesso.`,
      confirmLabel: 'Excluir',
      onConfirm: () => {
        void deleteProfile.mutateAsync(profile.id).catch((error) => {
          showAlert('Erro ao excluir', getApiErrorMessage(error));
        });
      },
    });
  };

  const profiles = profilesQuery.data?.items ?? [];
  const pagination = profilesQuery.data?.pagination;
  const totalEntries = pagination?.totalEntries ?? 0;
  const catalog = catalogQuery.data?.items ?? [];

  const renderContent = () => {
    if (permissions.isLoading) {
      return <Loading label="Verificando permissões..." />;
    }

    if (!canView) {
      return (
        <EmptyState
          icon={<ShieldX size={34} color={theme.colors.onSurfaceVariant} />}
          title="Acesso restrito"
          description="Você não tem permissão para visualizar perfis de acesso."
        />
      );
    }

    if (profilesQuery.isLoading) {
      return <Loading label="Carregando perfis..." />;
    }

    if (profilesQuery.isError) {
      return (
        <EmptyState
          icon={<AlertCircle size={34} color={theme.colors.error} />}
          title="Não foi possível carregar"
          description={getApiErrorMessage(profilesQuery.error)}
          actionTitle="Tentar novamente"
          onAction={() => void profilesQuery.refetch()}
        />
      );
    }

    return (
      <FlatList
        data={profiles}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[
          styles.listContent,
          profiles.length === 0 ? styles.listContentEmpty : undefined,
        ]}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={profilesQuery.isRefetching && !profilesQuery.isLoading}
            onRefresh={() => void profilesQuery.refetch()}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        renderItem={({ item }) => (
          <ProfileRow
            profile={item}
            canEdit={canUpdate}
            canDelete={canDelete}
            onEdit={openEdit}
            onDelete={confirmDelete}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon={<ShieldCheck size={34} color={theme.colors.onSurfaceVariant} />}
            title={debouncedSearch ? 'Nenhum perfil encontrado' : 'Nenhum perfil cadastrado'}
            description={
              debouncedSearch
                ? 'Tente buscar por outro nome.'
                : 'Crie um perfil para agrupar permissões de acesso.'
            }
            actionTitle={canCreate && !debouncedSearch ? 'Novo perfil' : undefined}
            onAction={canCreate ? openCreate : undefined}
          />
        }
        ListFooterComponent={
          <PaginationBar
            page={pagination?.currPage ?? page}
            totalPages={pagination?.totalPages ?? 1}
            totalEntries={totalEntries}
            onPrevious={() => setPage((current) => Math.max(1, current - 1))}
            onNext={() => setPage((current) => current + 1)}
          />
        }
      />
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <AppHeader
        title="Perfis de acesso"
        subtitle={
          canView ? `${totalEntries} ${totalEntries === 1 ? 'registro' : 'registros'}` : undefined
        }
      />

      <View style={[styles.toolbar, { borderBottomColor: theme.colors.outline }]}>
        <View style={styles.searchRow}>
          <AppInput
            value={search}
            onChangeText={(text) => {
              setSearch(text);
              setPage(1);
            }}
            placeholder="Buscar perfil"
            leftIcon={<Search size={18} color={theme.colors.onSurfaceVariant} />}
            style={styles.searchInput}
          />

          <IconButton
            icon={<ArrowUpDown size={19} color={theme.colors.onSurface} />}
            label={order === 'asc' ? 'Ordenar de Z para A' : 'Ordenar de A para Z'}
            onPress={() => {
              setOrder((current) => (current === 'asc' ? 'desc' : 'asc'));
              setPage(1);
            }}
          />

          {canCreate && (
            <IconButton
              icon={<Plus size={21} color={theme.colors.onPrimary} />}
              label="Novo perfil"
              variant="primary"
              onPress={openCreate}
            />
          )}
        </View>
      </View>

      <View style={styles.screen}>{renderContent()}</View>

      <AppModal
        visible={modalVisible}
        onClose={closeModal}
        title={editing ? 'Editar perfil' : 'Novo perfil'}
        size="fullscreen"
      >
        <AppInput<ProfileFormValues>
          control={control}
          name="name"
          label="Nome do perfil"
          placeholder="Ex.: Administrador"
          autoCapitalize="words"
          leftIcon={<ShieldCheck size={18} color={theme.colors.onSurfaceVariant} />}
          error={errors.name?.message}
        />

        <AppInput<ProfileFormValues>
          control={control}
          name="description"
          label="Descrição"
          placeholder="Descreva o propósito deste perfil"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          error={errors.description?.message}
        />

        <PermissionPicker<ProfileFormValues>
          control={control}
          name="permissions"
          permissions={catalog}
          error={errors.permissions?.message}
        />

        {formError && (
          <View style={[styles.errorBox, { backgroundColor: theme.colors.errorContainer }]}>
            <Text style={[styles.errorText, { color: theme.colors.onErrorContainer }]}>
              {formError}
            </Text>
          </View>
        )}

        <View style={styles.modalFooter}>
          <AppButton
            title="Cancelar"
            variant="outlined"
            onPress={closeModal}
            style={styles.footerButton}
          />
          <AppButton
            title={editing ? 'Salvar alterações' : 'Criar perfil'}
            onPress={onSubmit}
            loading={createProfile.isPending || updateProfile.isPending}
            style={styles.footerButton}
          />
        </View>
      </AppModal>
    </View>
  );
}
