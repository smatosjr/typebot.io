import { ButtonProps } from '@chakra-ui/react'
import { Select } from '@chakra-ui/react'
type Props = {
  items: {
    id: string
    label: string
  }[]
  onTableHeaderFilterChange: (val: string) => void
} & ButtonProps

export const ColumnTableFilterDropdown = ({
  items,
  onTableHeaderFilterChange,
}: Props) => {
  const showItems = items
    .map(({ id, label }) => ({
      label,
      value: id,
    }))
    .slice(1, items.length)
  return (
    <Select
      placeholder="Filtrar por coluna"
      onChange={(val) => onTableHeaderFilterChange(val.target.value)}
    >
      {showItems.map((item) => (
        <option value={item.value} key={item.value}>
          {item.label}
        </option>
      ))}
    </Select>
  )
}
