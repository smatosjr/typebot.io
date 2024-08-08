import {
  PublicTypebot,
  PublicTypebotV6,
  TypebotV6,
  typebotV6Schema,
} from '@typebot.io/schemas'
import { Router } from 'next/router'
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { isDefined, omit } from '@typebot.io/lib'
import { edgesAction, EdgesActions } from './typebotActions/edges'
import { itemsAction, ItemsActions } from './typebotActions/items'
import { GroupsActions, groupsActions } from './typebotActions/groups'
import { blocksAction, BlocksActions } from './typebotActions/blocks'
import { variablesAction, VariablesActions } from './typebotActions/variables'
import { dequal } from 'dequal'
import { useToast } from '@/hooks/useToast'
import { useUndo } from '../hooks/useUndo'
import { useAutoSave } from '@/hooks/useAutoSave'
import { preventUserFromRefreshing } from '@/helpers/preventUserFromRefreshing'
import { areTypebotsEqual } from '@/features/publish/helpers/areTypebotsEqual'
import { isPublished as isPublishedHelper } from '@/features/publish/helpers/isPublished'
import { convertPublicTypebotToTypebot } from '@/features/publish/helpers/convertPublicTypebotToTypebot'
import { trpc } from '@/lib/trpc'
import { EventsActions, eventsActions } from './typebotActions/events'
import { useGroupsStore } from '@/features/graph/hooks/useGroupsStore'

const autoSaveTimeout = 15000

type UpdateTypebotPayload = Partial<
  Pick<
    TypebotV6,
    | 'theme'
    | 'selectedThemeTemplateId'
    | 'settings'
    | 'publicId'
    | 'name'
    | 'icon'
    | 'customDomain'
    | 'resultsTablePreferences'
    | 'isClosed'
    | 'whatsAppCredentialsId'
    | 'riskLevel'
  >
>

export type SetTypebot = (
  newPresent: TypebotV6 | ((current: TypebotV6) => TypebotV6)
) => void

export type SetGlobalVariable = {
  key: string
  value: string
}

const typebotContext = createContext<
  {
    typebot?: TypebotV6
    publishedTypebot?: PublicTypebotV6
    publishedTypebotVersion?: PublicTypebot['version']
    globalStateVariables: { [key: string]: string }
    createGlobalVariable: (param: SetGlobalVariable) => void
    deleteGlobalVariable: (param: string) => void
    updateGlobalVariable: (
      oldVersion: {
        key: string
        value: string
      },
      newVersion: {
        key: string
        value: string
      }
    ) => void
    currentUserMode: 'guest' | 'read' | 'write'
    is404: boolean
    isPublished: boolean
    isSavingLoading: boolean
    save: () => Promise<void>
    undo: () => void
    redo: () => void
    canRedo: boolean
    canUndo: boolean
    updateTypebot: (props: {
      updates: UpdateTypebotPayload
      save?: boolean
    }) => Promise<TypebotV6 | undefined>
    restorePublishedTypebot: () => void
  } & GroupsActions &
    BlocksActions &
    ItemsActions &
    VariablesActions &
    EdgesActions &
    EventsActions
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
>({})

export const TypebotProvider = ({
  children,
  typebotId,
}: {
  children: ReactNode
  typebotId?: string
}) => {
  const { showToast } = useToast()
  const [is404, setIs404] = useState(false)
  const [globalStateVariables, setGlobalStateVariables] = useState<{
    [key: string]: string
  }>({})
  const setGroupsCoordinates = useGroupsStore(
    (state) => state.setGroupsCoordinates
  )

  const { isFetching: isFetchingVariables, data: dataVariables } =
    trpc.typebot.getGlobalVariables.useQuery({})
  const { mutateAsync: deleteGlobalVariables } =
    trpc.typebot.deleteGlobalVariables.useMutation({})
  const { mutateAsync: updateGlobalVariables } =
    trpc.typebot.updateGlobalVariables.useMutation({})

  const {
    data: typebotData,
    isLoading: isFetchingTypebot,
    refetch: refetchTypebot,
  } = trpc.typebot.getTypebot.useQuery(
    { typebotId: typebotId as string, migrateToLatestVersion: true },
    {
      enabled: isDefined(typebotId),
      retry: 0,
      onError: (error) => {
        if (error.data?.httpStatus === 404) {
          setIs404(true)
          return
        }
        setIs404(false)
        showToast({
          title: 'Could not fetch typebot',
          description: error.message,
          details: {
            content: JSON.stringify(error.data?.zodError?.fieldErrors, null, 2),
            lang: 'json',
          },
        })
      },
      onSuccess: () => {
        setIs404(false)
      },
    }
  )

  const { data: publishedTypebotData } =
    trpc.typebot.getPublishedTypebot.useQuery(
      { typebotId: typebotId as string, migrateToLatestVersion: true },
      {
        enabled:
          isDefined(typebotId) &&
          (typebotData?.currentUserMode === 'read' ||
            typebotData?.currentUserMode === 'write'),
        onError: (error) => {
          showToast({
            title: 'Could not fetch published typebot',
            description: error.message,
            details: {
              content: JSON.stringify(
                error.data?.zodError?.fieldErrors,
                null,
                2
              ),
              lang: 'json',
            },
          })
        },
      }
    )

  const { mutateAsync: updateTypebot, isLoading: isSaving } =
    trpc.typebot.updateTypebot.useMutation({
      onError: (error) =>
        showToast({
          title: 'Error while updating typebot',
          description: error.message,
        }),
      onSuccess: () => {
        if (!typebotId) return
        refetchTypebot()
      },
    })

  const { mutateAsync: createGlobalVariables } =
    trpc.typebot.createGlobalVariables.useMutation({
      onError: (error) =>
        showToast({
          title: 'Erro ao criar variavel',
          description: error.message,
        }),
      onSuccess: () => {
        showToast({
          title: 'Variavel criada',
          description: 'success',
        })
      },
    })

  const createGlobalVariable = async (newContent: SetGlobalVariable) => {
    await createGlobalVariables({
      key: newContent.key,
      value: newContent.value,
    })

    setGlobalStateVariables({
      ...globalStateVariables,
      [newContent.key]: newContent.value,
    })
  }

  const deleteGlobalVariable = async (key: string) => {
    deleteGlobalVariables({
      key: key,
    })

    setGlobalStateVariables({
      ...removeKey(globalStateVariables, key),
    })
  }

  const updateGlobalVariable = async (
    oldVersion: {
      key: string
      value: string
    },
    newVersion: {
      key: string
      value: string
    }
  ) => {
    updateGlobalVariables({ oldVersion, newVersion })

    setGlobalStateVariables({
      ...removeKey(globalStateVariables, oldVersion.key),
      [newVersion.key]: newVersion.value,
    })
  }

  const removeKey = <T extends object, K extends keyof T>(
    obj: T,
    key: K
  ): Omit<T, K> => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [key]: _, ...rest } = obj
    return rest
  }

  const typebot = typebotData?.typebot as TypebotV6
  const publishedTypebot = (publishedTypebotData?.publishedTypebot ??
    undefined) as PublicTypebotV6 | undefined
  const isReadOnly =
    typebotData &&
    ['read', 'guest'].includes(typebotData?.currentUserMode ?? 'guest')

  const [
    localTypebot,
    {
      redo,
      undo,
      flush,
      canRedo,
      canUndo,
      set: setLocalTypebot,
      setUpdateDate,
    },
  ] = useUndo<TypebotV6>(undefined, {
    isReadOnly,
    onUndo: (t) => {
      setGroupsCoordinates(t.groups)
    },
    onRedo: (t) => {
      setGroupsCoordinates(t.groups)
    },
  })

  useEffect(() => {
    if (!isFetchingVariables) {
      const spreadData = dataVariables ?? {}
      setGlobalStateVariables({ ...globalStateVariables, ...spreadData })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetchingVariables])

  useEffect(() => {
    if (!typebot && isDefined(localTypebot)) {
      setLocalTypebot(undefined)
      setGroupsCoordinates(undefined)
    }
    if (isFetchingTypebot || !typebot) return
    if (
      typebot.id !== localTypebot?.id ||
      new Date(typebot.updatedAt).getTime() >
        new Date(localTypebot.updatedAt).getTime()
    ) {
      setLocalTypebot({ ...typebot })
      setGroupsCoordinates(typebot.groups)
      flush()
    }
  }, [
    flush,
    isFetchingTypebot,
    localTypebot,
    setGroupsCoordinates,
    setLocalTypebot,
    showToast,
    typebot,
  ])

  const saveTypebot = useCallback(
    async (updates?: Partial<TypebotV6>) => {
      if (!localTypebot || !typebot || isReadOnly) return
      const typebotToSave = {
        ...localTypebot,
        ...updates,
      }
      if (
        dequal(
          JSON.parse(JSON.stringify(omit(typebot, 'updatedAt'))),
          JSON.parse(JSON.stringify(omit(typebotToSave, 'updatedAt')))
        )
      )
        return
      const newParsedTypebot = typebotV6Schema.parse({ ...typebotToSave })
      setLocalTypebot(newParsedTypebot)
      try {
        const {
          typebot: { updatedAt },
        } = await updateTypebot({
          typebotId: newParsedTypebot.id,
          typebot: newParsedTypebot,
        })
        setUpdateDate(updatedAt)
      } catch {
        setLocalTypebot({
          ...localTypebot,
        })
      }
    },
    [
      isReadOnly,
      localTypebot,
      setLocalTypebot,
      setUpdateDate,
      typebot,
      updateTypebot,
    ]
  )

  useAutoSave(
    {
      handler: saveTypebot,
      item: localTypebot,
      debounceTimeout: autoSaveTimeout,
    },
    [saveTypebot, localTypebot]
  )

  useEffect(() => {
    const handleSaveTypebot = () => {
      saveTypebot()
    }
    Router.events.on('routeChangeStart', handleSaveTypebot)
    return () => {
      Router.events.off('routeChangeStart', handleSaveTypebot)
    }
  }, [saveTypebot])

  const isPublished = useMemo(
    () =>
      isDefined(localTypebot) &&
      isDefined(localTypebot.publicId) &&
      isDefined(publishedTypebot) &&
      isPublishedHelper(localTypebot, publishedTypebot),
    [localTypebot, publishedTypebot]
  )

  useEffect(() => {
    if (!localTypebot || !typebot || isReadOnly) return
    if (!areTypebotsEqual(localTypebot, typebot)) {
      window.addEventListener('beforeunload', preventUserFromRefreshing)
    }

    return () => {
      window.removeEventListener('beforeunload', preventUserFromRefreshing)
    }
  }, [localTypebot, typebot, isReadOnly])

  const updateLocalTypebot = async ({
    updates,
    save,
  }: {
    updates: UpdateTypebotPayload
    save?: boolean
  }) => {
    if (!localTypebot || isReadOnly) return
    const newTypebot = { ...localTypebot, ...updates }
    setLocalTypebot(newTypebot)
    if (save) await saveTypebot(newTypebot)
    return newTypebot
  }

  const restorePublishedTypebot = () => {
    if (!publishedTypebot || !localTypebot) return
    setLocalTypebot(
      convertPublicTypebotToTypebot(publishedTypebot, localTypebot)
    )
  }

  return (
    <typebotContext.Provider
      value={{
        typebot: localTypebot,
        publishedTypebot,
        publishedTypebotVersion: publishedTypebotData?.version,
        currentUserMode: typebotData?.currentUserMode ?? 'guest',
        isSavingLoading: isSaving,
        is404,
        save: saveTypebot,
        undo,
        redo,
        canUndo,
        canRedo,
        isPublished,
        globalStateVariables,
        createGlobalVariable,
        deleteGlobalVariable,
        updateGlobalVariable,
        updateTypebot: updateLocalTypebot,
        restorePublishedTypebot,
        ...groupsActions(setLocalTypebot as SetTypebot),
        ...blocksAction(setLocalTypebot as SetTypebot),
        ...variablesAction(setLocalTypebot as SetTypebot),
        ...edgesAction(setLocalTypebot as SetTypebot),
        ...itemsAction(setLocalTypebot as SetTypebot),
        ...eventsActions(setLocalTypebot as SetTypebot),
      }}
    >
      {children}
    </typebotContext.Provider>
  )
}

export const useTypebot = () => useContext(typebotContext)
