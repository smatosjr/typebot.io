import {
  useDisclosure,
  Flex,
  Popover,
  Input,
  PopoverContent,
  Button,
  InputProps,
  IconButton,
  HStack,
  useColorModeValue,
  PopoverAnchor,
  Portal,
  Tag,
  Text,
  FormControl,
  FormLabel,
  FormHelperText,
  Stack,
} from '@chakra-ui/react'
import { EditIcon, PlusIcon, TrashIcon } from '@/components/icons'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
// import { GlobalVariable } from '@typebot.io/schemas'
import React, {
  useState,
  useRef,
  ChangeEvent,
  ReactNode,
  useEffect,
} from 'react'
import { isDefined, isNotDefined } from '@typebot.io/lib'
import { useOutsideClick } from '@/hooks/useOutsideClick'
import { useParentModal } from '@/features/graph/providers/ParentModalProvider'
import { MoreInfoTooltip } from '../MoreInfoTooltip'
import { useTranslate } from '@tolgee/react'

type Props = {
  initialVariableId: string | undefined
  autoFocus?: boolean
  onSelectVariable: (variable: {
    name: string | undefined
    value: string
  }) => void
  label?: string
  placeholder?: string
  helperText?: ReactNode
  moreInfoTooltip?: string
  direction?: 'row' | 'column'
  width?: 'full'
} & Omit<InputProps, 'placeholder'>

export const GlobalVariableSearchInput = ({
  initialVariableId,
  onSelectVariable,
  autoFocus,
  placeholder,
  label,
  helperText,
  moreInfoTooltip,
  direction = 'column',
  isRequired,
  width,
  ...inputProps
}: Props) => {
  const focusedItemBgColor = useColorModeValue('gray.200', 'gray.700')
  const { onOpen, onClose, isOpen } = useDisclosure({
    defaultIsOpen: autoFocus,
  })
  const {
    createGlobalVariable,
    deleteGlobalVariable,
    globalStateVariables,
    updateGlobalVariable,
  } = useTypebot()
  const getGlobalStateVariables = globalStateVariables ?? {}
  const variables =
    Object.keys(getGlobalStateVariables).map((item) => {
      return { name: item, value: getGlobalStateVariables[item] }
    }) ?? []
  const [inputValue, setInputValue] = useState(initialVariableId)
  const [filteredItems, setFilteredItems] = useState(variables)
  const [keyboardFocusIndex, setKeyboardFocusIndex] = useState<
    number | undefined
  >()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const createVariableItemRef = useRef<HTMLButtonElement | null>(null)
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([])
  const { ref: parentModalRef } = useParentModal()
  const { t } = useTranslate()

  useEffect(() => {
    const variables =
      Object.keys(getGlobalStateVariables).map((item) => {
        return { name: item, value: getGlobalStateVariables[item] }
      }) ?? []
    setFilteredItems(variables)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalStateVariables])

  useOutsideClick({
    ref: dropdownRef,
    handler: () => {
      onClose()
      // onSelectVariable({
      //   value:
      //     variables.find((item) => item.name === initialVariableId)?.value ??
      //     '',
      //   name: initialVariableId,
      // })
    },
    isEnabled: isOpen,
  })

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    if (e.target.value === '') {
      if (inputValue) {
        onSelectVariable({
          value:
            variables.find((item) => item.name === initialVariableId)?.value ??
            '',
          name: initialVariableId,
        })
      }
      setFilteredItems([...variables.slice(0, 50)])
      return
    }
    setFilteredItems([
      ...variables
        .filter((item) =>
          item.name.toLowerCase().includes((e.target.value ?? '').toLowerCase())
        )
        .slice(0, 50),
    ])
  }

  const handleVariableNameClick =
    (variable: { name: string; value: string }) => () => {
      setInputValue(variable.name)
      onSelectVariable({ name: variable.name, value: variable.value })
      setKeyboardFocusIndex(undefined)
      inputRef.current?.blur()
      onClose()
    }

  const handleCreateNewVariableClick = () => {
    if (!inputValue || inputValue === '') return
    onSelectVariable({
      value: variables.find((item) => item.name === inputValue)?.value ?? '',
      name: inputValue ?? '',
    })
    createGlobalVariable({ key: inputValue, value: '' })
    inputRef.current?.blur()
    onClose()
  }

  const handleDeleteVariableClick =
    (variable: { name: string; value: string }) => (e: React.MouseEvent) => {
      e.stopPropagation()
      deleteGlobalVariable(variable.name)
      setFilteredItems(
        filteredItems.filter(
          (item: { name: string; value: string }) => item.name !== variable.name
        )
      )
      if (variable.value === inputValue) {
        setInputValue('')
      }
    }

  const handleRenameVariableClick =
    (variable: { name: string; value: string }) => (e: React.MouseEvent) => {
      e.stopPropagation()
      const name = prompt(t('variables.rename'), variable.name)
      if (!name) return

      const oldVersion = {
        key: initialVariableId ?? '',
        value:
          variables.find((item) => item.name === initialVariableId)?.value ??
          '',
      }
      const newVersion = {
        key: name ?? '',
        value: variable.value ?? '',
      }
      updateGlobalVariable(oldVersion, newVersion)
      setFilteredItems(
        filteredItems.map((item: { name: string; value: string }) =>
          item.name === variable.name ? { ...item, name: name } : item
        )
      )
    }

  const isCreateVariableButtonDisplayed =
    (inputValue?.length ?? 0) > 0 &&
    isNotDefined(variables.find((v) => v.name === inputValue))

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isDefined(keyboardFocusIndex)) {
      if (keyboardFocusIndex === 0 && isCreateVariableButtonDisplayed)
        handleCreateNewVariableClick()
      else
        handleVariableNameClick(
          filteredItems[
            keyboardFocusIndex - (isCreateVariableButtonDisplayed ? 1 : 0)
          ]
        )()
      return setKeyboardFocusIndex(undefined)
    }
    if (e.key === 'ArrowDown') {
      if (keyboardFocusIndex === undefined) return setKeyboardFocusIndex(0)
      if (keyboardFocusIndex >= filteredItems.length) return
      itemsRef.current[keyboardFocusIndex + 1]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
      return setKeyboardFocusIndex(keyboardFocusIndex + 1)
    }
    if (e.key === 'ArrowUp') {
      if (keyboardFocusIndex === undefined) return
      if (keyboardFocusIndex <= 0) return setKeyboardFocusIndex(undefined)
      itemsRef.current[keyboardFocusIndex - 1]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
      return setKeyboardFocusIndex(keyboardFocusIndex - 1)
    }
    return setKeyboardFocusIndex(undefined)
  }

  const openDropdown = () => {
    if (inputValue === '') setFilteredItems(variables)
    onOpen()
  }

  return (
    <FormControl
      isRequired={isRequired}
      as={direction === 'column' ? Stack : HStack}
      justifyContent="space-between"
      width={label || width === 'full' ? 'full' : 'auto'}
      spacing={direction === 'column' ? 2 : 3}
    >
      {label && (
        <FormLabel display="flex" flexShrink={0} gap="1" mb="0" mr="0">
          {label}{' '}
          {moreInfoTooltip && (
            <MoreInfoTooltip>{moreInfoTooltip}</MoreInfoTooltip>
          )}
        </FormLabel>
      )}
      <Flex ref={dropdownRef} w="full">
        <Popover
          isOpen={isOpen}
          initialFocusRef={inputRef}
          isLazy
          offset={[0, 2]}
          placement="bottom-start"
        >
          <PopoverAnchor>
            <Input
              data-testid="variables-input"
              ref={inputRef}
              value={inputValue}
              onChange={onInputChange}
              onFocus={openDropdown}
              onKeyDown={handleKeyUp}
              placeholder={placeholder ?? t('variables.select')}
              autoComplete="off"
              {...inputProps}
            />
          </PopoverAnchor>
          <Portal containerRef={parentModalRef}>
            <PopoverContent
              maxH="35vh"
              maxW="35vw"
              overflowY="auto"
              role="menu"
              w="inherit"
              shadow="lg"
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              minW="250px"
            >
              {isCreateVariableButtonDisplayed && (
                <Button
                  as="li"
                  ref={createVariableItemRef}
                  role="menuitem"
                  minH="40px"
                  onClick={handleCreateNewVariableClick}
                  fontSize="16px"
                  fontWeight="normal"
                  rounded="none"
                  colorScheme="gray"
                  variant="ghost"
                  justifyContent="flex-start"
                  leftIcon={<PlusIcon />}
                  bgColor={
                    keyboardFocusIndex === 0
                      ? focusedItemBgColor
                      : 'transparent'
                  }
                >
                  {t('create')}
                  <Tag colorScheme="orange" ml="1">
                    <Text noOfLines={0} display="block">
                      {inputValue}
                    </Text>
                  </Tag>
                </Button>
              )}
              {filteredItems.length > 0 && (
                <>
                  {filteredItems.map((item, idx) => {
                    const indexInList = isCreateVariableButtonDisplayed
                      ? idx + 1
                      : idx
                    return (
                      <Button
                        as="li"
                        cursor="pointer"
                        ref={(el) => (itemsRef.current[idx] = el)}
                        role="menuitem"
                        minH="40px"
                        key={idx}
                        onClick={handleVariableNameClick(item)}
                        fontSize="16px"
                        fontWeight="normal"
                        rounded="none"
                        colorScheme="gray"
                        variant="ghost"
                        justifyContent="space-between"
                        bgColor={
                          keyboardFocusIndex === indexInList
                            ? focusedItemBgColor
                            : 'transparent'
                        }
                        transition="none"
                      >
                        <Text noOfLines={0} display="block" pr="2">
                          {item.name}
                        </Text>

                        <HStack>
                          <IconButton
                            icon={<EditIcon />}
                            aria-label={t('variables.rename')}
                            size="xs"
                            onClick={handleRenameVariableClick(item)}
                          />
                          <IconButton
                            icon={<TrashIcon />}
                            aria-label={t('variables.remove')}
                            size="xs"
                            onClick={handleDeleteVariableClick(item)}
                          />
                        </HStack>
                      </Button>
                    )
                  })}
                </>
              )}
            </PopoverContent>
          </Portal>
        </Popover>
      </Flex>
      {helperText && <FormHelperText mt="0">{helperText}</FormHelperText>}
    </FormControl>
  )
}
