import React, { useState } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  ArrowUpDown,
  Building2,
  Pencil,
  Plus,
  Search,
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
import {
  useSecretariats,
  useCreateSecretariat,
  useUpdateSecretariat,
  useDeleteSecretariat,
} from '@/hooks/useSecretariats';
import { useUserPermissions } from '@/hooks/usePermissions';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { createSecretariatSchema } from '@/schemas/secretariat.schema';
import type { Secretariat } from '@/types/secretariat';
import type { SortDirection } from '@/types/api';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';
import { getApiErrorMessage } from '@/utils/errors';
import { confirmAction, showAlert } from '@/utils/confirm';
import { listStyles as styles } from '@/styles/lists';

type SecretariatFormValues = {
  name: string;
  acronym: string;
};

const EMPTY_FORM: SecretariatFormValues = {
  name: '',
  acronym: '',
};

interface SecretariatRowProps {
  secretariat: Secretariat;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (secretariat: Secretariat) => void;
  onDelete: (secretariat: Secretariat) => void;
}

const SecretariatRow = ({
  secretariat,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: SecretariatRowProps) => {
  const theme = useTheme();

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
          <Building2 size={22} color={theme.colors.secondary} />
        </View>

        <View style={styles.itemInfo}>
          <Text style={[styles.itemTitle, { color: theme.colors.onSurface }]} numberOfLines={1}>
            {secretariat.name}
          </Text>
          <Text style={[styles.itemSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            Sigla: {secretariat.acronym}
          </Text>
          <Text style={[styles.itemSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            Criada em {secretariat.created_at}
          </Text>
        </View>

        {(canEdit || canDelete) && (
          <View style={styles.itemActions}>
            {canEdit && (
              <IconButton
                icon={<Pencil size={17} color={theme.colors.onSurface} />}
                label={`Editar ${secretariat.name}`}
                onPress={() => onEdit(secretariat)}
                size={38}
              />
            )}
            {canDelete && (
              <IconButton
                icon={<Trash2 size={17} color={theme.colors.error} />}
                label={`Excluir ${secretariat.name}`}
                onPress={() => onDelete(secretariat)}
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

export default function SecretariatsScreen() {
  const theme = useTheme();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 400);
  const [page, setPage] = useState(1);
  const [order, setOrder] = useState<SortDirection>('asc');
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Secretariat | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const permissions = useUserPermissions();
  const canView = permissions.can('secretariats', 'view');
  const canCreate = permissions.can('secretariats', 'create');
  const canUpdate = permissions.can('secretariats', 'update');
  const canDelete = permissions.can('secretariats', 'delete');

  const secretariatsQuery = useSecretariats(
    {
      page,
      per_page: DEFAULT_PAGE_SIZE,
      search: debouncedSearch || undefined,
      sort: 'name',
      order,
    },
    canView,
  );

  const createSecretariat = useCreateSecretariat();
  const updateSecretariat = useUpdateSecretariat();
  const deleteSecretariat = useDeleteSecretariat();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SecretariatFormValues>({
    resolver: zodResolver(createSecretariatSchema) as unknown as Resolver<SecretariatFormValues>,
    defaultValues: EMPTY_FORM,
  });

  const openCreate = () => {
    setEditing(null);
    setFormError(null);
    reset(EMPTY_FORM);
    setModalVisible(true);
  };

  const openEdit = (secretariat: Secretariat) => {
    setEditing(secretariat);
    setFormError(null);
    reset({ name: secretariat.name, acronym: secretariat.acronym });
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
      acronym: values.acronym.trim(),
    };

    try {
      if (editing) {
        await updateSecretariat.mutateAsync({ id: editing.id, data: payload });
      } else {
        await createSecretariat.mutateAsync(payload);
      }
      closeModal();
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  });

  const confirmDelete = (secretariat: Secretariat) => {
    confirmAction({
      title: 'Excluir secretaria',
      message: `Deseja excluir "${secretariat.name}"? Esta ação não pode ser desfeita.`,
      confirmLabel: 'Excluir',
      onConfirm: () => {
        void deleteSecretariat.mutateAsync(secretariat.id).catch((error) => {
          showAlert('Erro ao excluir', getApiErrorMessage(error));
        });
      },
    });
  };

  const secretariats = secretariatsQuery.data?.items ?? [];
  const pagination = secretariatsQuery.data?.pagination;
  const totalEntries = pagination?.totalEntries ?? 0;

  const renderContent = () => {
    if (permissions.isLoading) {
      return <Loading label="Verificando permissões..." />;
    }

    if (!canView) {
      return (
        <EmptyState
          icon={<ShieldX size={34} color={theme.colors.onSurfaceVariant} />}
          title="Acesso restrito"
          description="Você não tem permissão para visualizar secretarias."
        />
      );
    }

    if (secretariatsQuery.isLoading) {
      return <Loading label="Carregando secretarias..." />;
    }

    if (secretariatsQuery.isError) {
      return (
        <EmptyState
          icon={<AlertCircle size={34} color={theme.colors.error} />}
          title="Não foi possível carregar"
          description={getApiErrorMessage(secretariatsQuery.error)}
          actionTitle="Tentar novamente"
          onAction={() => void secretariatsQuery.refetch()}
        />
      );
    }

    return (
      <FlatList
        data={secretariats}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[
          styles.listContent,
          secretariats.length === 0 ? styles.listContentEmpty : undefined,
        ]}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={secretariatsQuery.isRefetching && !secretariatsQuery.isLoading}
            onRefresh={() => void secretariatsQuery.refetch()}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        renderItem={({ item }) => (
          <SecretariatRow
            secretariat={item}
            canEdit={canUpdate}
            canDelete={canDelete}
            onEdit={openEdit}
            onDelete={confirmDelete}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon={<Building2 size={34} color={theme.colors.onSurfaceVariant} />}
            title={
              debouncedSearch ? 'Nenhuma secretaria encontrada' : 'Nenhuma secretaria cadastrada'
            }
            description={
              debouncedSearch
                ? 'Tente buscar por outro nome ou sigla.'
                : 'Cadastre a primeira secretaria para vincular usuários.'
            }
            actionTitle={canCreate && !debouncedSearch ? 'Nova secretaria' : undefined}
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
        title="Secretarias"
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
            placeholder="Buscar por nome ou sigla"
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
              label="Nova secretaria"
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
        title={editing ? 'Editar secretaria' : 'Nova secretaria'}
        size="default"
      >
        <AppInput<SecretariatFormValues>
          control={control}
          name="name"
          label="Nome da secretaria"
          placeholder="Ex.: Secretaria de Educação"
          autoCapitalize="words"
          leftIcon={<Building2 size={18} color={theme.colors.onSurfaceVariant} />}
          error={errors.name?.message}
        />

        <AppInput<SecretariatFormValues>
          control={control}
          name="acronym"
          label="Sigla"
          placeholder="Ex.: SEDUC"
          autoCapitalize="characters"
          maxLength={16}
          error={errors.acronym?.message}
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
            title={editing ? 'Salvar alterações' : 'Criar secretaria'}
            onPress={onSubmit}
            loading={createSecretariat.isPending || updateSecretariat.isPending}
            style={styles.footerButton}
          />
        </View>
      </AppModal>
    </View>
  );
}
