import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  ArrowUpDown,
  Mail,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  ShieldX,
  Trash2,
  User as UserIcon,
  Users,
} from 'lucide-react-native';
import { AppHeader, UserAvatar } from '@/components/layout/Header';
import { AppButton } from '@/components/ui/Button';
import { AppModal } from '@/components/ui/Modal';
import { AppInput } from '@/components/ui/Input';
import { AppSelector } from '@/components/ui/Selector';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { PaginationBar } from '@/components/ui/PaginationBar';
import { AppCard } from '@/components/ui/Card';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '@/hooks/useUsers';
import { useProfiles } from '@/hooks/useProfiles';
import { useSecretariats } from '@/hooks/useSecretariats';
import { useUserPermissions } from '@/hooks/usePermissions';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { createUserSchema, updateUserSchema } from '@/schemas/user.schema';
import type { SortDirection } from '@/types/api';
import type {
  CreateUserPayload,
  GetUsersParams,
  UpdateUserPayload,
  User,
} from '@/types/user';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';
import { getApiErrorMessage } from '@/utils/errors';
import { confirmAction, showAlert } from '@/utils/confirm';
import { listStyles as styles } from '@/styles/lists';

type UserFormValues = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  profile_id: number;
  secretariat_id: number;
};

const EMPTY_FORM: UserFormValues = {
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  profile_id: 0,
  secretariat_id: 0,
};

interface UserRowProps {
  user: User;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

const UserRow = ({ user, canEdit, canDelete, onEdit, onDelete }: UserRowProps) => {
  const theme = useTheme();

  return (
    <AppCard style={styles.itemCard}>
      <View style={styles.itemRow}>
        <UserAvatar name={user.name} size={44} />

        <View style={styles.itemInfo}>
          <Text style={[styles.itemTitle, { color: theme.colors.onSurface }]} numberOfLines={1}>
            {user.name}
          </Text>
          <Text
            style={[styles.itemSubtitle, { color: theme.colors.onSurfaceVariant }]}
            numberOfLines={1}
          >
            {user.email}
          </Text>

          <View style={styles.tagRow}>
            {user.profile && (
              <View style={[styles.tag, { backgroundColor: theme.colors.primaryContainer }]}>
                <Text style={[styles.tagText, { color: theme.colors.onPrimaryContainer }]}>
                  {user.profile.name}
                </Text>
              </View>
            )}
            {user.secretariat && (
              <View style={[styles.tag, { backgroundColor: theme.colors.secondaryContainer }]}>
                <Text style={[styles.tagText, { color: theme.colors.onSecondaryContainer }]}>
                  {user.secretariat.acronym || user.secretariat.name}
                </Text>
              </View>
            )}
          </View>
        </View>

        {(canEdit || canDelete) && (
          <View style={styles.itemActions}>
            {canEdit && (
              <IconButton
                icon={<Pencil size={17} color={theme.colors.onSurface} />}
                label={`Editar ${user.name}`}
                onPress={() => onEdit(user)}
                size={38}
              />
            )}
            {canDelete && (
              <IconButton
                icon={<Trash2 size={17} color={theme.colors.error} />}
                label={`Excluir ${user.name}`}
                onPress={() => onDelete(user)}
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

export default function UsersScreen() {
  const theme = useTheme();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 400);
  const [page, setPage] = useState(1);
  const [order, setOrder] = useState<SortDirection>('asc');
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const permissions = useUserPermissions();
  const canView = permissions.can('users', 'view');
  const canCreate = permissions.can('users', 'create');
  const canUpdate = permissions.can('users', 'update');
  const canDelete = permissions.can('users', 'delete');

  const params: GetUsersParams = {
    page,
    per_page: DEFAULT_PAGE_SIZE,
    search: debouncedSearch || undefined,
    sort: 'name',
    order,
  };

  const usersQuery = useUsers(params, canView);
  const profilesQuery = useProfiles({ page: 1, per_page: 100 }, modalVisible);
  const secretariatsQuery = useSecretariats({ page: 1, per_page: 100 }, modalVisible);

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const createForm = useForm<UserFormValues>({
    resolver: zodResolver(createUserSchema) as unknown as Resolver<UserFormValues>,
    defaultValues: EMPTY_FORM,
  });

  const editForm = useForm<UserFormValues>({
    resolver: zodResolver(updateUserSchema) as unknown as Resolver<UserFormValues>,
    defaultValues: EMPTY_FORM,
  });

  const activeForm = editing ? editForm : createForm;
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = activeForm;

  const openCreate = () => {
    setEditing(null);
    setFormError(null);
    createForm.reset(EMPTY_FORM);
    setModalVisible(true);
  };

  const openEdit = (user: User) => {
    setEditing(user);
    setFormError(null);
    editForm.reset({
      name: user.name,
      email: user.email,
      password: '',
      password_confirmation: '',
      profile_id: user.profile?.id ?? 0,
      secretariat_id: user.secretariat?.id ?? 0,
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

    try {
      if (editing) {
        const payload: UpdateUserPayload = {
          name: values.name.trim(),
          email: values.email.trim(),
          profile_id: values.profile_id,
          secretariat_id: values.secretariat_id,
        };

        if (values.password) {
          payload.password = values.password;
          payload.password_confirmation = values.password_confirmation;
        }

        await updateUser.mutateAsync({ id: editing.id, data: payload });
      } else {
        const payload: CreateUserPayload = {
          name: values.name.trim(),
          email: values.email.trim(),
          password: values.password,
          password_confirmation: values.password_confirmation,
          profile_id: values.profile_id,
          secretariat_id: values.secretariat_id,
        };

        await createUser.mutateAsync(payload);
      }

      closeModal();
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  });

  const confirmDelete = (user: User) => {
    confirmAction({
      title: 'Excluir usuário',
      message: `Deseja excluir "${user.name}"? Esta ação não pode ser desfeita.`,
      confirmLabel: 'Excluir',
      onConfirm: () => {
        void deleteUser.mutateAsync(user.id).catch((error) => {
          showAlert('Erro ao excluir', getApiErrorMessage(error));
        });
      },
    });
  };

  const users = usersQuery.data?.items ?? [];
  const pagination = usersQuery.data?.pagination;
  const totalEntries = pagination?.totalEntries ?? 0;

  const profileOptions = (profilesQuery.data?.items ?? []).map((profile) => ({
    label: profile.name,
    value: profile.id,
  }));

  const secretariatOptions = (secretariatsQuery.data?.items ?? []).map((secretariat) => ({
    label: secretariat.name,
    value: secretariat.id,
  }));

  const renderContent = () => {
    if (permissions.isLoading) {
      return <Loading label="Verificando permissões..." />;
    }

    if (!canView) {
      return (
        <EmptyState
          icon={<ShieldX size={34} color={theme.colors.onSurfaceVariant} />}
          title="Acesso restrito"
          description="Você não tem permissão para visualizar usuários."
        />
      );
    }

    if (usersQuery.isLoading) {
      return <Loading label="Carregando usuários..." />;
    }

    if (usersQuery.isError) {
      return (
        <EmptyState
          icon={<AlertCircle size={34} color={theme.colors.error} />}
          title="Não foi possível carregar"
          description={getApiErrorMessage(usersQuery.error)}
          actionTitle="Tentar novamente"
          onAction={() => void usersQuery.refetch()}
        />
      );
    }

    return (
      <FlatList
        data={users}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[
          styles.listContent,
          users.length === 0 ? styles.listContentEmpty : undefined,
        ]}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={usersQuery.isRefetching && !usersQuery.isLoading}
            onRefresh={() => void usersQuery.refetch()}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        renderItem={({ item }) => (
          <UserRow
            user={item}
            canEdit={canUpdate}
            canDelete={canDelete}
            onEdit={openEdit}
            onDelete={confirmDelete}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon={<Users size={34} color={theme.colors.onSurfaceVariant} />}
            title={debouncedSearch ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
            description={
              debouncedSearch
                ? 'Tente buscar por outro nome ou e-mail.'
                : 'Cadastre o primeiro usuário para começar.'
            }
            actionTitle={canCreate && !debouncedSearch ? 'Novo usuário' : undefined}
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
        title="Usuários"
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
            placeholder="Buscar por nome ou e-mail"
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
              label="Novo usuário"
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
        title={editing ? 'Editar usuário' : 'Novo usuário'}
        size="large"
      >
        <AppInput<UserFormValues>
          control={control}
          name="name"
          label="Nome completo"
          placeholder="Nome do usuário"
          autoCapitalize="words"
          leftIcon={<UserIcon size={18} color={theme.colors.onSurfaceVariant} />}
          error={errors.name?.message}
        />

        <AppInput<UserFormValues>
          control={control}
          name="email"
          label="E-mail"
          placeholder="usuario@instituicao.gov.br"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          leftIcon={<Mail size={18} color={theme.colors.onSurfaceVariant} />}
          error={errors.email?.message}
        />

        <AppSelector<UserFormValues>
          control={control}
          name="profile_id"
          label="Perfil de acesso"
          placeholder={profilesQuery.isLoading ? 'Carregando perfis...' : 'Selecione um perfil'}
          options={profileOptions}
          leftIcon={<ShieldCheck size={18} color={theme.colors.onSurfaceVariant} />}
          error={errors.profile_id?.message}
        />

        <AppSelector<UserFormValues>
          control={control}
          name="secretariat_id"
          label="Secretaria"
          placeholder={
            secretariatsQuery.isLoading ? 'Carregando secretarias...' : 'Selecione uma secretaria'
          }
          options={secretariatOptions}
          leftIcon={<Users size={18} color={theme.colors.onSurfaceVariant} />}
          error={errors.secretariat_id?.message}
        />

        <AppInput<UserFormValues>
          control={control}
          name="password"
          label={editing ? 'Nova senha (opcional)' : 'Senha'}
          placeholder={editing ? 'Deixe em branco para manter' : 'Mínimo de 8 caracteres'}
          autoCapitalize="none"
          autoComplete="new-password"
          secureTextEntry
          secureTextEntryToggle
          error={errors.password?.message}
        />

        <AppInput<UserFormValues>
          control={control}
          name="password_confirmation"
          label="Confirmar senha"
          placeholder="Repita a senha"
          autoCapitalize="none"
          autoComplete="new-password"
          secureTextEntry
          secureTextEntryToggle
          error={errors.password_confirmation?.message}
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
            title={editing ? 'Salvar alterações' : 'Criar usuário'}
            onPress={onSubmit}
            loading={createUser.isPending || updateUser.isPending}
            style={styles.footerButton}
          />
        </View>
      </AppModal>
    </View>
  );
}
