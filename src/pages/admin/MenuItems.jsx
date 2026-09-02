import React, { useEffect, useMemo, useState } from 'react'
import MediaSelector from '../../components/MediaSelector'
import {
  COLOUR_SWATCHES,
  ICON_OPTIONS,
  ITEM_TYPES,
  LOOK_SWATCHES,
  SWATCH_PRESETS,
  formatSizeDimension,
  getColourSwatch,
  sizeQueryValue,
} from '../../utils/menuConfig'

const emptyItem = {
  label: '',
  href: '',
  swatch: '',
  dimension: '',
  icon: 'Package',
  extraIcon: '',
  image: '',
}

const emptyColumn = {
  title: '',
  itemType: 'look',
  items: [],
}

const emptyMenu = {
  id: '',
  label: '',
  href: '',
  mobileHref: '',
  filterBase: '',
  flatten: false,
  buttonClass: '',
  dropdownClass: '',
  columns: [],
}

const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const itemDisplayName = (item) => item.label || item.dimension || 'Untitled item'

const AdminMenuItems = () => {
  const [menus, setMenus] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeMenuId, setActiveMenuId] = useState('')
  const [expandedColumns, setExpandedColumns] = useState({})
  const [showItemModal, setShowItemModal] = useState(false)
  const [showColumnModal, setShowColumnModal] = useState(false)
  const [showMenuModal, setShowMenuModal] = useState(false)
  const [editingMenu, setEditingMenu] = useState(null)
  const [editingColumnIndex, setEditingColumnIndex] = useState(null)
  const [editingItemIndex, setEditingItemIndex] = useState(null)
  const [itemForm, setItemForm] = useState(emptyItem)
  const [columnForm, setColumnForm] = useState(emptyColumn)
  const [menuForm, setMenuForm] = useState(emptyMenu)

  const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/admin-menu-items.php`

  useEffect(() => {
    fetchMenus()
  }, [])

  const fetchMenus = async () => {
    try {
      setLoading(true)
      let nextMenus = []
      let loadedFromApi = false

      try {
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        })
        const data = await response.json()
        if (data.success && Array.isArray(data.menus)) {
          nextMenus = data.menus
          loadedFromApi = true
        }
      } catch (error) {
        console.error('Error fetching menu items from API:', error)
      }

      if (!loadedFromApi || nextMenus.length === 0) {
        const localResponse = await fetch('/data/menu-items.json')
        const localData = await localResponse.json()
        if (Array.isArray(localData.menus) && localData.menus.length > 0) {
          nextMenus = localData.menus
        }
      }

      setMenus(nextMenus)
      setActiveMenuId((current) => current || nextMenus[0]?.id || '')
      setExpandedColumns(
        nextMenus.reduce((acc, menu) => {
          acc[menu.id] = 0
          return acc
        }, {})
      )
    } catch (error) {
      console.error('Error loading menu items:', error)
      setMenus([])
    } finally {
      setLoading(false)
    }
  }

  const persistMenus = async (nextMenus, successMessage) => {
    try {
      setSaving(true)
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ menus: nextMenus }),
      })
      const result = await response.json()

      if (result.success) {
        setMenus(nextMenus)
        if (successMessage) alert(successMessage)
        return true
      }

      alert('Error saving menu items: ' + (result.error || 'Unknown error'))
      return false
    } catch (error) {
      console.error('Error saving menu items:', error)
      setMenus(nextMenus)
      if (successMessage) alert(successMessage)
      else alert('Could not reach the menu API. Changes are shown here but will not persist until the API is deployed.')
      return true
    } finally {
      setSaving(false)
    }
  }

  const activeMenu = menus.find((menu) => menu.id === activeMenuId) || menus[0]
  const activeMenuIndex = menus.findIndex((menu) => menu.id === activeMenu?.id)

  const filteredItemsByColumn = useMemo(() => {
    if (!activeMenu) return []
    const term = searchTerm.toLowerCase()
    return (activeMenu.columns || []).map((column) => ({
      ...column,
      items: (column.items || []).filter((item) => {
        if (!term) return true
        return [item.label, item.href, item.dimension, item.icon]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term))
      }),
    }))
  }, [activeMenu, searchTerm])

  const updateMenuAt = (menuIndex, updater) => {
    const nextMenus = menus.map((menu, index) =>
      index === menuIndex ? updater(menu) : menu
    )
    return persistMenus(nextMenus)
  }

  const handleMenuSettingsSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      ...menuForm,
      id: menuForm.id || slugify(menuForm.label),
      buttonClass: menuForm.buttonClass || `${slugify(menuForm.label)}-button`,
      dropdownClass: menuForm.dropdownClass || `${slugify(menuForm.label)}-dropdown`,
      columns: editingMenu ? editingMenu.columns || [] : [],
    }

    if (editingMenu) {
      const saved = await updateMenuAt(activeMenuIndex, () => payload)
      if (saved) {
        setActiveMenuId(payload.id)
        setShowMenuModal(false)
        setEditingMenu(null)
        setMenuForm(emptyMenu)
      }
      return
    }

    const saved = await persistMenus([...menus, payload], 'Menu created successfully')
    if (saved) {
      setActiveMenuId(payload.id)
      setShowMenuModal(false)
      setMenuForm(emptyMenu)
    }
  }

  const handleDeleteMenu = async () => {
    if (!activeMenu) return
    if (!window.confirm(`Delete the "${activeMenu.label}" menu and all of its items?`)) return
    const nextMenus = menus.filter((menu) => menu.id !== activeMenu.id)
    const saved = await persistMenus(nextMenus, 'Menu deleted successfully')
    if (saved) {
      setActiveMenuId(nextMenus[0]?.id || '')
    }
  }

  const handleColumnSubmit = async (e) => {
    e.preventDefault()
    const nextColumn = {
      title: columnForm.title,
      itemType: columnForm.itemType,
      items: editingColumnIndex !== null
        ? activeMenu.columns[editingColumnIndex].items || []
        : [],
    }

    const nextColumns = [...(activeMenu.columns || [])]
    if (editingColumnIndex !== null) {
      nextColumns[editingColumnIndex] = nextColumn
    } else {
      nextColumns.push(nextColumn)
    }

    const saved = await updateMenuAt(activeMenuIndex, (menu) => ({
      ...menu,
      columns: nextColumns,
    }))
    if (saved) {
      setExpandedColumns((prev) => ({
        ...prev,
        [activeMenu.id]: editingColumnIndex !== null ? editingColumnIndex : nextColumns.length - 1,
      }))
      setShowColumnModal(false)
      setEditingColumnIndex(null)
      setColumnForm(emptyColumn)
    }
  }

  const handleDeleteColumn = async (columnIndex) => {
    const column = activeMenu.columns[columnIndex]
    if (!window.confirm(`Delete the column "${column.title}"?`)) return
    const nextColumns = activeMenu.columns.filter((_, index) => index !== columnIndex)
    await updateMenuAt(activeMenuIndex, (menu) => ({ ...menu, columns: nextColumns }))
  }

  const moveColumn = async (columnIndex, direction) => {
    const targetIndex = columnIndex + direction
    if (targetIndex < 0 || targetIndex >= activeMenu.columns.length) return
    const nextColumns = [...activeMenu.columns]
    const [moved] = nextColumns.splice(columnIndex, 1)
    nextColumns.splice(targetIndex, 0, moved)
    await updateMenuAt(activeMenuIndex, (menu) => ({ ...menu, columns: nextColumns }))
    setExpandedColumns((prev) => ({ ...prev, [activeMenu.id]: targetIndex }))
  }

  const openItemModal = (columnIndex, itemIndex = null) => {
    const column = activeMenu.columns[columnIndex]
    setEditingColumnIndex(columnIndex)
    setEditingItemIndex(itemIndex)
    if (itemIndex !== null) {
      setItemForm({ ...emptyItem, ...column.items[itemIndex] })
    } else {
      const defaults = { ...emptyItem }
      if (column.itemType === 'colour') defaults.swatch = 'bg-gray-400'
      if (column.itemType === 'look') defaults.swatch = LOOK_SWATCHES.Stone
      setItemForm(defaults)
    }
    setShowItemModal(true)
  }

  const handleItemSubmit = async (e) => {
    e.preventDefault()
    const column = activeMenu.columns[editingColumnIndex]
    const nextItem = { href: itemForm.href }

    if (column.itemType === 'size') {
      nextItem.label = itemForm.label || ''
      nextItem.dimension = itemForm.dimension
    } else {
      nextItem.label = itemForm.label
    }

    if (column.itemType === 'look' || column.itemType === 'colour') {
      nextItem.swatch = itemForm.swatch
    }
    if (column.itemType === 'icon') {
      nextItem.icon = itemForm.icon
      if (itemForm.extraIcon) nextItem.extraIcon = itemForm.extraIcon
    }
    if (column.itemType === 'image') {
      nextItem.image = itemForm.image
    }

    const nextItems = [...(column.items || [])]
    if (editingItemIndex !== null) {
      nextItems[editingItemIndex] = nextItem
    } else {
      nextItems.push(nextItem)
    }

    const nextColumns = activeMenu.columns.map((col, index) =>
      index === editingColumnIndex ? { ...col, items: nextItems } : col
    )
    const saved = await updateMenuAt(activeMenuIndex, (menu) => ({
      ...menu,
      columns: nextColumns,
    }))
    if (saved) {
      setShowItemModal(false)
      setEditingItemIndex(null)
      setItemForm(emptyItem)
    }
  }

  const handleDeleteItem = async (columnIndex, itemIndex) => {
    const item = activeMenu.columns[columnIndex].items[itemIndex]
    if (!window.confirm(`Delete "${itemDisplayName(item)}"?`)) return
    const nextColumns = activeMenu.columns.map((column, index) => {
      if (index !== columnIndex) return column
      return {
        ...column,
        items: column.items.filter((_, current) => current !== itemIndex),
      }
    })
    await updateMenuAt(activeMenuIndex, (menu) => ({ ...menu, columns: nextColumns }))
  }

  const moveItem = async (columnIndex, itemIndex, direction) => {
    const items = [...activeMenu.columns[columnIndex].items]
    const targetIndex = itemIndex + direction
    if (targetIndex < 0 || targetIndex >= items.length) return
    const [moved] = items.splice(itemIndex, 1)
    items.splice(targetIndex, 0, moved)
    const nextColumns = activeMenu.columns.map((column, index) =>
      index === columnIndex ? { ...column, items } : column
    )
    await updateMenuAt(activeMenuIndex, (menu) => ({ ...menu, columns: nextColumns }))
  }

  const syncColumnFromUnique = async (columnIndex, type) => {
    const column = activeMenu.columns[columnIndex]
    const base = activeMenu.filterBase || activeMenu.href

    try {
      setSaving(true)
      if (type === 'colour') {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/unique-colours.php`)
        const data = await response.json()
        const colours = data.colours || []
        const existingByLabel = new Map(
          (column.items || []).map((item) => [String(item.label || '').toLowerCase(), item])
        )
        const nextItems = colours.map((colour) => {
          const name = colour.name || colour.colour
          const existing = existingByLabel.get(String(name).toLowerCase())
          return {
            label: name,
            href: `${base}?colours=${encodeURIComponent(String(name).toLowerCase())}`,
            swatch: existing?.swatch || getColourSwatch(name),
          }
        })
        const nextColumns = activeMenu.columns.map((col, index) =>
          index === columnIndex ? { ...col, items: nextItems } : col
        )
        await persistMenus(
          menus.map((menu, index) =>
            index === activeMenuIndex ? { ...menu, columns: nextColumns } : menu
          ),
          `Synced ${nextItems.length} colours into "${column.title}"`
        )
      }

      if (type === 'size') {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/unique-sizes.php`)
        const data = await response.json()
        const sizes = data.sizes || []
        const nextItems = sizes.map((size) => {
          const name = size.name || size.size
          const query = sizeQueryValue(name)
          return {
            label: '',
            href: `${base}?sizes=${encodeURIComponent(query)}`,
            dimension: formatSizeDimension(name),
          }
        })
        const nextColumns = activeMenu.columns.map((col, index) =>
          index === columnIndex ? { ...col, items: nextItems } : col
        )
        await persistMenus(
          menus.map((menu, index) =>
            index === activeMenuIndex ? { ...menu, columns: nextColumns } : menu
          ),
          `Synced ${nextItems.length} sizes into "${column.title}"`
        )
      }
    } catch (error) {
      console.error('Error syncing unique data:', error)
      alert('Error syncing unique data')
    } finally {
      setSaving(false)
    }
  }

  const handleItemInputChange = (e) => {
    const { name, value } = e.target
    setItemForm((prev) => {
      const next = { ...prev, [name]: value }
      if (name === 'label' && (activeMenu.columns[editingColumnIndex]?.itemType === 'colour')) {
        next.swatch = COLOUR_SWATCHES[value.toLowerCase()] || prev.swatch
      }
      if (name === 'label' && (activeMenu.columns[editingColumnIndex]?.itemType === 'look')) {
        next.swatch = LOOK_SWATCHES[value] || prev.swatch
      }
      if (name === 'dimension' && !prev.href && activeMenu.filterBase) {
        next.href = `${activeMenu.filterBase}?sizes=${encodeURIComponent(sizeQueryValue(value))}`
      }
      return next
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 pt-6">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Items</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage every navbar mega menu. Changes populate the live menu on the site.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditingMenu(null)
              setMenuForm(emptyMenu)
              setShowMenuModal(true)
            }}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
          >
            Add Menu
          </button>
          {activeMenu && (
            <button
              onClick={() => {
                setEditingMenu(activeMenu)
                setMenuForm({
                  ...emptyMenu,
                  ...activeMenu,
                  flatten: Boolean(activeMenu.flatten),
                })
                setShowMenuModal(true)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Edit Menu Settings
            </button>
          )}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {menus.map((menu) => (
            <button
              key={menu.id}
              onClick={() => setActiveMenuId(menu.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeMenu?.id === menu.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {menu.label}
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search items in this menu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">
              Clear
            </button>
          )}
        </div>
      </div>

      {!activeMenu ? (
        <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">
          No menus found. Add a menu to get started.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white shadow rounded-lg p-4 text-sm text-gray-600 flex flex-wrap gap-x-6 gap-y-1">
            <p><span className="font-medium text-gray-900">Label:</span> {activeMenu.label}</p>
            <p><span className="font-medium text-gray-900">Link:</span> {activeMenu.href}</p>
            <p><span className="font-medium text-gray-900">Filter base:</span> {activeMenu.filterBase || activeMenu.href}</p>
            <p><span className="font-medium text-gray-900">Columns:</span> {(activeMenu.columns || []).length}</p>
            {saving && <p className="text-blue-600">Saving...</p>}
            <button onClick={handleDeleteMenu} className="ml-auto text-red-600 hover:text-red-800 text-sm font-medium">
              Delete menu
            </button>
          </div>

          {(filteredItemsByColumn || []).map((column, columnIndex) => (
            <div key={`${column.title}-${columnIndex}`} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap items-center gap-3">
                <button
                  onClick={() =>
                    setExpandedColumns((prev) => ({
                      ...prev,
                      [activeMenu.id]: prev[activeMenu.id] === columnIndex ? -1 : columnIndex,
                    }))
                  }
                  className="text-left flex-1"
                >
                  <h3 className="text-lg font-medium text-gray-900">{column.title}</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    {column.itemType} · {column.items.length} item{column.items.length === 1 ? '' : 's'}
                    {searchTerm && column.items.length !== (activeMenu.columns[columnIndex].items || []).length
                      ? ` (filtered)`
                      : ''}
                  </p>
                </button>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => moveColumn(columnIndex, -1)} className="text-sm text-gray-500 hover:text-gray-800">Up</button>
                  <button onClick={() => moveColumn(columnIndex, 1)} className="text-sm text-gray-500 hover:text-gray-800">Down</button>
                  {column.itemType === 'colour' && (
                    <button
                      onClick={() => syncColumnFromUnique(columnIndex, 'colour')}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Sync colours
                    </button>
                  )}
                  {column.itemType === 'size' && (
                    <button
                      onClick={() => syncColumnFromUnique(columnIndex, 'size')}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Sync sizes
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setEditingColumnIndex(columnIndex)
                      setColumnForm({ title: column.title, itemType: column.itemType, items: [] })
                      setShowColumnModal(true)
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Edit column
                  </button>
                  <button
                    onClick={() => handleDeleteColumn(columnIndex)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => openItemModal(columnIndex)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm font-medium"
                  >
                    Add item
                  </button>
                </div>
              </div>

              {expandedColumns[activeMenu.id] !== -1 && (
                column.items.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-500">
                    {searchTerm ? 'No items match your search in this column.' : 'No items in this column.'}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preview</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Label</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {column.items.map((item, itemIndex) => {
                          const originalIndex = (activeMenu.columns[columnIndex].items || []).findIndex(
                            (original) => original === item || (
                              original.href === item.href &&
                              original.label === item.label &&
                              original.dimension === item.dimension
                            )
                          )
                          return (
                            <tr key={`${item.href}-${item.label}-${item.dimension}-${itemIndex}`} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                {column.itemType === 'image' && item.image ? (
                                  <img src={item.image} alt={item.label} className="h-10 w-10 object-contain" />
                                ) : column.itemType === 'size' ? (
                                  <span className="inline-flex h-8 w-8 items-center justify-center text-[8px] font-semibold border border-gray-200 bg-gray-50">
                                    {item.dimension}
                                  </span>
                                ) : column.itemType === 'icon' ? (
                                  <span className="text-xs text-gray-500">{item.icon}{item.extraIcon ? ` + ${item.extraIcon}` : ''}</span>
                                ) : (
                                  <div className={`h-6 w-6 rotate-45 ${item.swatch || 'bg-gray-200'}`} />
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                {itemDisplayName(item)}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">{item.href}</td>
                              <td className="px-6 py-4 text-sm font-medium">
                                <div className="flex space-x-3">
                                  <button onClick={() => moveItem(columnIndex, originalIndex, -1)} className="text-gray-500 hover:text-gray-800">Up</button>
                                  <button onClick={() => moveItem(columnIndex, originalIndex, 1)} className="text-gray-500 hover:text-gray-800">Down</button>
                                  <button onClick={() => openItemModal(columnIndex, originalIndex)} className="text-blue-600 hover:text-blue-900">Edit</button>
                                  <button onClick={() => handleDeleteItem(columnIndex, originalIndex)} className="text-red-600 hover:text-red-900">Delete</button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )
              )}
            </div>
          ))}

          <button
            onClick={() => {
              setEditingColumnIndex(null)
              setColumnForm(emptyColumn)
              setShowColumnModal(true)
            }}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg py-4 text-sm font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600"
          >
            Add column
          </button>
        </div>
      )}

      {showMenuModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingMenu ? 'Edit Menu Settings' : 'Add Menu'}
              </h3>
              <button onClick={() => setShowMenuModal(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
            </div>
            <form onSubmit={handleMenuSettingsSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Label *</label>
                <input
                  name="label"
                  value={menuForm.label}
                  onChange={(e) => setMenuForm((prev) => ({ ...prev, label: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Desktop link *</label>
                <input
                  name="href"
                  value={menuForm.href}
                  onChange={(e) => setMenuForm((prev) => ({ ...prev, href: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile link</label>
                <input
                  name="mobileHref"
                  value={menuForm.mobileHref}
                  onChange={(e) => setMenuForm((prev) => ({ ...prev, mobileHref: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter base URL</label>
                <input
                  name="filterBase"
                  value={menuForm.filterBase}
                  onChange={(e) => setMenuForm((prev) => ({ ...prev, filterBase: e.target.value }))}
                  placeholder="/product-category/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">Used when syncing colours and sizes.</p>
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={menuForm.flatten}
                  onChange={(e) => setMenuForm((prev) => ({ ...prev, flatten: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                Flatten items in the mobile menu
              </label>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowMenuModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                  {editingMenu ? 'Save settings' : 'Add menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showColumnModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingColumnIndex !== null ? 'Edit Column' : 'Add Column'}
              </h3>
              <button onClick={() => setShowColumnModal(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
            </div>
            <form onSubmit={handleColumnSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Column title *</label>
                <input
                  value={columnForm.title}
                  onChange={(e) => setColumnForm((prev) => ({ ...prev, title: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item type *</label>
                <select
                  value={columnForm.itemType}
                  onChange={(e) => setColumnForm((prev) => ({ ...prev, itemType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ITEM_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowColumnModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                  {editingColumnIndex !== null ? 'Update column' : 'Add column'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showItemModal && activeMenu && editingColumnIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingItemIndex !== null ? 'Edit Item' : 'Add Item'}
              </h3>
              <button onClick={() => setShowItemModal(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
            </div>
            <form onSubmit={handleItemSubmit} className="p-6 space-y-4">
              {activeMenu.columns[editingColumnIndex].itemType !== 'size' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Label *</label>
                  <input
                    name="label"
                    value={itemForm.label}
                    onChange={handleItemInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              {activeMenu.columns[editingColumnIndex].itemType === 'size' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dimension *</label>
                    <input
                      name="dimension"
                      value={itemForm.dimension}
                      onChange={handleItemInputChange}
                      required
                      placeholder="600×1200"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Optional label</label>
                    <input
                      name="label"
                      value={itemForm.label}
                      onChange={handleItemInputChange}
                      placeholder="Smaller Sizes"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link *</label>
                <input
                  name="href"
                  value={itemForm.href}
                  onChange={handleItemInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {(activeMenu.columns[editingColumnIndex].itemType === 'look' ||
                activeMenu.columns[editingColumnIndex].itemType === 'colour') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Swatch</label>
                  <select
                    name="swatch"
                    value={itemForm.swatch}
                    onChange={handleItemInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  >
                    <option value="">Custom</option>
                    {SWATCH_PRESETS.map((preset) => (
                      <option key={`${preset.name}-${preset.swatch}`} value={preset.swatch}>
                        {preset.name}
                      </option>
                    ))}
                  </select>
                  <input
                    name="swatch"
                    value={itemForm.swatch}
                    onChange={handleItemInputChange}
                    placeholder="Tailwind classes, e.g. bg-gray-400"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {itemForm.swatch && (
                    <div className="mt-2 flex items-center gap-3">
                      <div className={`h-8 w-8 rotate-45 ${itemForm.swatch}`} />
                      <span className="text-xs text-gray-500">Preview</span>
                    </div>
                  )}
                </div>
              )}
              {activeMenu.columns[editingColumnIndex].itemType === 'icon' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Icon *</label>
                    <select
                      name="icon"
                      value={itemForm.icon}
                      onChange={handleItemInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {ICON_OPTIONS.map((icon) => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Extra icon</label>
                    <select
                      name="extraIcon"
                      value={itemForm.extraIcon}
                      onChange={handleItemInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">None</option>
                      {ICON_OPTIONS.map((icon) => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              {activeMenu.columns[editingColumnIndex].itemType === 'image' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                  <MediaSelector
                    value={itemForm.image}
                    onChange={(url) => setItemForm((prev) => ({ ...prev, image: url }))}
                    type="single"
                    accept="images"
                    placeholder="Select menu image..."
                    className="w-full"
                  />
                </div>
              )}
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowItemModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                  {editingItemIndex !== null ? 'Update item' : 'Add item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminMenuItems
