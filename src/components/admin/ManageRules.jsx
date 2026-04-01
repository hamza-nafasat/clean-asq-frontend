import { getTableStyles } from '@/data/data';
import { useBranding } from '@/hooks/BrandingContext';
import {
  useCreateFormRuleMutation,
  useDeleteSingleFormRuleMutation,
  useGetAllFormRulesQuery,
  useGetFormRuleFromAiMutation,
  useUpdateSingleFormRuleMutation,
  useUpdateStatusSingleFormRuleMutation,
} from '@/redux/apis/formApis';
import { MoreVertical, PencilIcon, PlusIcon, ToggleRight, Trash, GripVertical } from 'lucide-react';
import React, { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import ConfirmationModal from '../shared/ConfirmationModal';
import Button from '../shared/small/Button';
import CustomLoading from '../shared/small/CustomLoading';
import Modal from '../shared/small/Modal';
import TextField from '../shared/small/TextField';
import { ThreeDotEditViewDelete } from '../shared/ThreeDotViewEditDelete';
import { SelectInputType } from '../shared/small/DynamicField';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimation,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ─── Sortable Row ────────────────────────────────────────────────────────────
const SortableRow = ({ row, actionMenu, setActionMenu, ButtonsForThreeDot }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-gray-100 hover:bg-gray-50 ${isDragging ? 'bg-gray-100 shadow-lg' : 'bg-white'}`}
    >
      {/* Drag Handle — only this cell gets the listeners */}
      <td className="w-48  px-3 py-3 text-center">
        <div
          {...attributes}
          {...listeners}
          className="inline-flex cursor-grab active:cursor-grabbing rounded p-1 hover:bg-gray-200 transition-colors"
          title="Drag to reorder"
        >
          <GripVertical size={18} className="text-gray-400" />
        </div>
      </td>

      {/* Rule ID */}
      <td className="w-24 px-3 py-3">
        <span title={row._id} className="text-textPrimary text-xs truncate block max-w-[80px]">
          {row._id}
        </span>
      </td>

      {/* Order */}
      <td className="w-16 px-3 py-3 text-center">
        <span className="text-textPrimary text-sm">{row.orderNo + 1}</span>
      </td>

      {/* Rule Name */}
      <td className="w-48 px-3 py-3">
        <span className="text-textPrimary font-semibold capitalize text-sm">{row.name}</span>
      </td>

      {/* Rule Prompt */}
      <td className="px-3 py-3">
        <textarea
          value={row.prompt}
          readOnly
          className="text-textPrimary border border-frameColor w-full resize-none rounded-md bg-[#FAFBFF] p-2 text-sm"
          rows={2}
        />
      </td>

      {/* Category */}
      <td className="w-28 px-3 py-3">
        <span className="font-semibold capitalize text-sm">{row.category}</span>
      </td>

      {/* Status */}
      <td className="w-24 px-3 py-3">
        <span
          className={`font-semibold capitalize text-sm ${row.isActive ? 'text-green-600' : 'text-red-500'}`}
        >
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>

      {/* Actions */}
      <td className="w-24 px-3 py-3">
        <div className="relative">
          <button
            onClick={() => setActionMenu((prev) => (prev === row._id ? null : row._id))}
            className="cursor-pointer rounded p-1 hover:bg-gray-100"
            aria-label="Actions"
          >
            <MoreVertical size={18} />
          </button>
          {actionMenu === row._id && (
            <ThreeDotEditViewDelete buttons={ButtonsForThreeDot} row={row} />
          )}
        </div>
      </td>
    </tr>
  );
};

// ─── Drag Overlay ────────────────────────────────────────────────────────────
const DragOverlayRow = ({ row }) => (
  <div className="bg-white shadow-xl rounded-lg border border-blue-200 p-3 min-w-[320px]">
    <div className="flex items-center gap-3">
      <GripVertical size={20} className="text-gray-400" />
      <div className="flex-1">
        <div className="font-semibold text-sm">{row?.name}</div>
        <div className="text-xs text-gray-500">ID: {row?._id?.slice(-6)}</div>
      </div>
      <span className="text-xs text-gray-500">#{row?.orderNo + 1}</span>
    </div>
  </div>
);

// ─── Constants ───────────────────────────────────────────────────────────────
const CATEGORY_OPTIONS = [
  { label: 'Alert', value: 'alert' },
  { label: 'Display', value: 'display' },
];

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

const RULE_FIELDS_GUIDE = [
  { field: 'prompt', description: 'Instruction sent to AI to generate the rule logic.' },
  {
    field: 'handler',
    description: 'JavaScript logic generated by AI. Runs in backend to evaluate the rule.',
  },
  { field: 'formula', description: 'Human-readable logic of the rule.' },
  { field: 'example', description: 'Example showing how the rule works with sample input/output.' },
  { field: 'explanation', description: 'Explanation of why this rule exists and what it detects.' },
];

// ─── Main Component ───────────────────────────────────────────────────────────
const ManageRules = () => {
  const formId = useParams().formId;
  const [actionMenu, setActionMenu] = useState(null);
  const [openCreateRuleModal, setOpenCreateRuleModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [deleteRuleConfirmation, setDeleteRuleConfirmation] = useState(null);
  const [updateStatusRuleConfirmation, setUpdateStatusRuleConfirmation] = useState(null);
  const [updateRuleConfirmation, setUpdateRuleConfirmation] = useState(null);
  const [filters, setFilters] = useState({ name: '', category: '', status: '' });
  const [orderedRules, setOrderedRules] = useState([]);
  const [isOrderChanged, setIsOrderChanged] = useState(false);
  const [activeDragId, setActiveDragId] = useState(null);

  const { data: rules, isLoading, refetch } = useGetAllFormRulesQuery({ formId });
  const [deleteRule, { isLoading: isDeletingRule }] = useDeleteSingleFormRuleMutation();
  const [updateStatusRule, { isLoading: isUpdatingStatusRule }] =
    useUpdateStatusSingleFormRuleMutation();
  console.log('Fetched rules:', orderedRules);
  // Sync server data → local state
  useEffect(() => {
    if (rules?.data) {
      setOrderedRules(rules.data.map((rule, i) => ({ ...rule, orderNo: i })));
      setIsOrderChanged(false);
    }
  }, [rules]);

  // Filtered view
  const filteredRules = useMemo(
    () =>
      orderedRules.filter((rule) => {
        const matchName =
          !filters.name || rule.name?.toLowerCase().includes(filters.name.toLowerCase());
        const matchCategory = !filters.category || rule.category === filters.category;
        const matchStatus =
          !filters.status ||
          (filters.status === 'active' && rule.isActive) ||
          (filters.status === 'inactive' && !rule.isActive);
        return matchName && matchCategory && matchStatus;
      }),
    [orderedRules, filters]
  );

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = useCallback((event) => setActiveDragId(event.active.id), []);

  const handleDragEnd = useCallback(
    ({ active, over }) => {
      setActiveDragId(null);
      if (!over || active.id === over.id) return;

      const oldFilteredIdx = filteredRules.findIndex((r) => r._id === active.id);
      const newFilteredIdx = filteredRules.findIndex((r) => r._id === over.id);
      const oldFullIdx = orderedRules.findIndex((r) => r._id === filteredRules[oldFilteredIdx]._id);
      const newFullIdx = orderedRules.findIndex((r) => r._id === filteredRules[newFilteredIdx]._id);

      const reordered = arrayMove(orderedRules, oldFullIdx, newFullIdx).map((r, i) => ({
        ...r,
        orderNo: i,
      }));

      setOrderedRules(reordered);
      setIsOrderChanged(true);
      toast.success(`Moved from position ${oldFilteredIdx + 1} to ${newFilteredIdx + 1}`);
    },
    [filteredRules, orderedRules]
  );

  const handleDragCancel = useCallback(() => setActiveDragId(null), []);

  const handleSaveOrder = () => {
    toast.info('API integration pending — order saved locally');
    // TODO: call your API here
  };

  const handleCancelOrder = async () => {
    await refetch();
    setIsOrderChanged(false);
    toast.info('Order changes cancelled');
  };

  const handleDeleteRule = async (ruleId) => {
    try {
      const res = await deleteRule({ ruleId }).unwrap();
      if (res?.success) {
        toast.success(res.message || 'Rule deleted successfully');
        await refetch();
        setDeleteRuleConfirmation(null);
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete rule');
    }
  };

  const handleUpdateStatusRule = async (ruleId, isActive) => {
    try {
      const res = await updateStatusRule({ ruleId, isActive: !isActive }).unwrap();
      if (res?.success) {
        toast.success(res.message || 'Rule status updated');
        await refetch();
        setUpdateStatusRuleConfirmation(null);
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update status');
    }
  };

  const ButtonsForThreeDot = useMemo(
    () => [
      {
        name: 'Update Status',
        icon: <ToggleRight size={16} className="mr-2" />,
        onClick: (row) => {
          setSelectedRow(row);
          setActionMenu(null);
          setUpdateStatusRuleConfirmation(true);
        },
      },
      {
        name: 'Update Rule',
        icon: <PencilIcon size={16} className="mr-2" />,
        onClick: (row) => {
          setSelectedRow(row);
          setActionMenu(null);
          setUpdateRuleConfirmation(true);
        },
      },
      {
        name: 'Delete',
        icon: <Trash size={16} className="mr-2" />,
        onClick: (row) => {
          setSelectedRow(row);
          setActionMenu(null);
          setDeleteRuleConfirmation(true);
        },
      },
    ],
    []
  );

  if (isLoading) return <CustomLoading />;

  return (
    <>
      {openCreateRuleModal && (
        <Modal onClose={() => setOpenCreateRuleModal(false)}>
          <CreateRuleModal formId={formId} setModal={setOpenCreateRuleModal} refetch={refetch} />
        </Modal>
      )}
      {updateRuleConfirmation && (
        <Modal onClose={() => setUpdateRuleConfirmation(false)}>
          <UpdateRuleModal
            ruleData={selectedRow}
            setModal={setUpdateRuleConfirmation}
            refetch={refetch}
          />
        </Modal>
      )}

      <ConfirmationModal
        isOpen={!!deleteRuleConfirmation}
        onClose={() => setDeleteRuleConfirmation(null)}
        onConfirm={() => handleDeleteRule(selectedRow?._id)}
        title="Delete Rule"
        message="Are you sure you want to delete this rule?"
        isLoading={isDeletingRule}
        confirmButtonText="Delete"
        confirmButtonClassName="bg-red-500 text-white"
      />
      <ConfirmationModal
        isOpen={!!updateStatusRuleConfirmation}
        onClose={() => setUpdateStatusRuleConfirmation(null)}
        onConfirm={() => handleUpdateStatusRule(selectedRow?._id, selectedRow?.isActive)}
        isLoading={isUpdatingStatusRule}
        title="Update Status Rule"
        message="Are you sure you want to update the status of this rule?"
        confirmButtonText="Update"
        confirmButtonClassName="bg-red-500 text-white"
      />

      <div className="p-4">
        <div className="flex w-full flex-col gap-6">
          {/* Filters */}
          <div className="w-full bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex flex-col gap-4">
              <div className="flex flex-row justify-between items-center gap-4">
                <h3 className="text-textPrimary text-lg font-semibold">Manage Rules</h3>
                {isOrderChanged && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                      Order changed
                    </span>
                    <Button
                      label="Save Order"
                      variant="primary"
                      size="sm"
                      onClick={handleSaveOrder}
                    />
                    <Button
                      label="Cancel"
                      variant="secondary"
                      size="sm"
                      onClick={handleCancelOrder}
                    />
                  </div>
                )}
              </div>
              <div className="flex flex-col md:flex-row gap-4 w-full">
                <div className="flex flex-col w-full md:w-1/3">
                  <label className="text-xs text-gray-500 mb-1">Search</label>
                  <TextField
                    id="search-name"
                    placeholder="Search by rule name..."
                    value={filters.name}
                    onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                  />
                </div>
                <div className="flex flex-col w-full md:w-1/4">
                  <label className="text-xs text-gray-500 mb-1">Category</label>
                  <SelectInputType
                    field={{ options: CATEGORY_OPTIONS, uniqueId: 'category' }}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    form={{ category: { name: 'category', value: filters.category } }}
                  />
                </div>
                <div className="flex flex-col w-full md:w-1/4">
                  <label className="text-xs text-gray-500 mb-1">Status</label>
                  <SelectInputType
                    field={{ options: STATUS_OPTIONS, uniqueId: 'status' }}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    form={{ status: { name: 'status', value: filters.status } }}
                  />
                </div>
                <div className="flex justify-end items-end">
                  <Button
                    icon={PlusIcon}
                    className="w-40 h-13 rounded-lg"
                    label="Create Rule"
                    variant="primary"
                    onClick={() => setOpenCreateRuleModal(true)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Table with DnD */}
          <div className="w-full overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="text-sm text-gray-500 px-4 pt-3 pb-2 flex items-center justify-between border-b border-gray-100">
              <span className="inline-flex items-center gap-1">
                <GripVertical size={14} />
                Drag the handle (⠿) to reorder rules
              </span>
              {activeDragId && (
                <span className="text-xs text-blue-600 animate-pulse">Dragging rule…</span>
              )}
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            >
              <SortableContext
                items={filteredRules.map((r) => r._id)}
                strategy={verticalListSortingStrategy}
              >
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      <th className="w-14 px-3 py-3" />
                      <th className="w-24 px-3 py-3">Rule ID</th>
                      <th className="w-16 px-3 py-3 text-center">Order</th>
                      <th className="w-48 px-3 py-3">Rule Name</th>
                      <th className="px-3 py-3">Rule Prompt</th>
                      <th className="w-28 px-3 py-3">Category</th>
                      <th className="w-24 px-3 py-3">Status</th>
                      <th className="w-24 px-3 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRules.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-12 text-gray-400">
                          No rules found
                        </td>
                      </tr>
                    ) : (
                      filteredRules.map((row) => (
                        <SortableRow
                          key={row._id}
                          row={row}
                          actionMenu={actionMenu}
                          setActionMenu={setActionMenu}
                          ButtonsForThreeDot={ButtonsForThreeDot}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </SortableContext>

              <DragOverlay
                dropAnimation={{
                  ...defaultDropAnimation,
                  duration: 200,
                  easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
                }}
              >
                {activeDragId && (
                  <DragOverlayRow row={filteredRules.find((r) => r._id === activeDragId)} />
                )}
              </DragOverlay>
            </DndContext>
          </div>
        </div>
      </div>
    </>
  );
};

export default ManageRules;

const CreateRuleModal = ({ formId, setModal, refetch }) => {
  const [showRuleFieldsGuide, setShowRuleFieldsGuide] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [handler, setHandler] = useState('');
  const [formula, setFormula] = useState('');
  const [example, setExample] = useState('');
  const [explanation, setExplanation] = useState('');
  const [createRule, { isLoading: isCreatingRule }] = useCreateFormRuleMutation();
  const [getFormRuleFromAi, { isLoading: isGettingFormRuleFromAi }] =
    useGetFormRuleFromAiMutation();

  const createRuleHandler = async () => {
    try {
      if (
        !formId ||
        !prompt ||
        !name ||
        !handler ||
        !formula ||
        !example ||
        !explanation ||
        !category
      )
        return toast.error('Please fill all the fields');
      const data = { formId, prompt, name, category, handler, formula, example, explanation };
      const res = await createRule(data).unwrap();
      if (res?.success) {
        toast?.success(res?.message || 'Rule created successfully');
        await refetch();
        setModal(false);
      }
    } catch (error) {
      console.error('Error creating rule:', error);
      toast.error(error?.data?.message || 'Failed to create rule');
    }
  };

  const getFormRuleFromAiHandler = async () => {
    try {
      if (!formId || !prompt || !name || !category)
        return toast.error('Please fill all the fields');
      const res = await getFormRuleFromAi({ formId, prompt, name, category }).unwrap();
      if (res?.success) {
        setName(res?.data?.name);
        setHandler(res?.data?.handler);
        setFormula(res?.data?.formula);
        setExample(res?.data?.example);
        setExplanation(res?.data?.explanation);
      }
    } catch (error) {
      console.error('Error getting form rule from ai:', error);
      toast.error(error?.data?.message || 'Failed to get form rule from ai');
    }
  };
  return (
    <div className="flex items-center w-full justify-center p-4">
      <div className="flex w-full max-w-3xl flex-col gap-6">
        <h3 className="text-center text-2xl font-semibold text-gray-800">Create Rule</h3>
        <div className="flex flex-col gap-2 w-full">
          <TextField
            label="Rule Name:*"
            id="rule-name"
            placeholder="Enter rule name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <SelectInputType
            field={{
              label: 'Category',
              options: CATEGORY_OPTIONS,
              uniqueId: 'category',
            }}
            onChange={(e) => setCategory(e.target.value)}
            form={{ category: { name: 'category', value: category } }}
          />
          <TextField
            label="Prompt"
            id="prompt"
            type="textarea"
            placeholder="Enter prompt for rule creation"
            value={prompt}
            textAreaHeight="100px"
            onChange={(e) => setPrompt(e.target.value)}
          />

          <div className="flex justify-end  w-full items-end gap-2">
            <Button
              label={showRuleFieldsGuide ? 'Hide Fields Guide' : 'Preview Fields Guide'}
              variant="secondary"
              onClick={() => setShowRuleFieldsGuide((prev) => !prev)}
            />

            <Button
              label="Get Rule from AI"
              variant="primary"
              icon={isGettingFormRuleFromAi && FaSpinner}
              cnLeft="mr-2 w-4 h-4 animate-spin"
              onClick={getFormRuleFromAiHandler}
              disabled={isGettingFormRuleFromAi || !prompt || !name || !category}
            />
          </div>
          {showRuleFieldsGuide && (
            <div className="flex flex-col gap-3 mt-4 border border-gray-200 rounded-xl p-4 bg-[#FAFBFF]">
              <h4 className="text-lg font-semibold text-gray-800">Rule Fields Guide</h4>

              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200 rounded-md overflow-hidden">
                  <thead className="bg-gray-100 text-gray-600">
                    <tr>
                      <th className="text-left px-3 py-2">Field</th>
                      <th className="text-left px-3 py-2">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RULE_FIELDS_GUIDE.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-3 py-2 font-mono text-blue-600">{item.field}</td>
                        <td className="px-3 py-2 text-gray-700">{item.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="text-xs text-gray-500">
                These fields are generated by AI and used to define how your rule works.
              </div>
            </div>
          )}
        </div>

        {formula && example && (
          <div className="flex flex-col gap-4 mt-4 border border-gray-200 rounded-xl p-4 bg-[#FAFBFF]">
            <h4 className="text-lg font-semibold text-gray-800">Rule Preview</h4>
            {explanation && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Explanation</p>
                <div className="text-sm text-gray-800 bg-white border rounded-md p-3">
                  {explanation}
                </div>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Formula</p>
              <div className="text-sm font-mono text-blue-600 bg-white border rounded-md p-3 wrap-break-word">
                {formula}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Example Calculation</p>
              <pre className="text-sm text-gray-800 bg-white border rounded-md p-3 whitespace-pre-wrap">
                {example}
              </pre>
            </div>
            <details className="mt-2">
              <summary className="cursor-pointer text-sm text-gray-500">
                Show technical code
              </summary>
              <pre className="text-xs bg-black text-green-400 p-3 rounded-md mt-2 overflow-x-auto">
                {handler}
              </pre>
            </details>
          </div>
        )}
        <div className="flex w-full justify-end gap-2">
          <Button label="Cancel" variant="secondary" onClick={() => setModal(false)} />
          <Button
            label="Create Rule"
            variant="primary"
            icon={isCreatingRule && FaSpinner}
            cnLeft="mr-2 w-4 h-4 animate-spin"
            onClick={createRuleHandler}
            disabled={
              isCreatingRule ||
              !formId ||
              !prompt ||
              !name ||
              !handler ||
              !formula ||
              !example ||
              !explanation ||
              !category
            }
          />
        </div>
      </div>
    </div>
  );
};
const UpdateRuleModal = ({ ruleData, setModal, refetch }) => {
  const [showRuleFieldsGuide, setShowRuleFieldsGuide] = useState(false);
  const [prompt, setPrompt] = useState(ruleData?.prompt);
  const [name, setName] = useState(ruleData?.name);
  const [category, setCategory] = useState(ruleData?.category);
  const [handler, setHandler] = useState(ruleData?.handler);
  const [formula, setFormula] = useState(ruleData?.formula);
  const [example, setExample] = useState(ruleData?.example);
  const [explanation, setExplanation] = useState(ruleData?.explanation);
  const [updateRule, { isLoading: isUpdatingRule }] = useUpdateSingleFormRuleMutation();
  const [getFormRuleFromAi, { isLoading: isGettingFormRuleFromAi }] =
    useGetFormRuleFromAiMutation();

  const updateRuleHandler = async () => {
    try {
      if (
        !ruleData?._id ||
        !prompt ||
        !name ||
        !handler ||
        !formula ||
        !example ||
        !explanation ||
        !category
      )
        return toast.error('Please fill all the fields');

      const data = {
        formId: ruleData?.formId,
        prompt,
        name,
        category,
        handler,
        formula,
        example,
        explanation,
      };

      const res = await updateRule({ data, ruleId: ruleData?._id }).unwrap();
      if (res?.success) {
        toast?.success(res?.message || 'Rule updated successfully');
        await refetch();
        setModal(false);
      }
    } catch (error) {
      console.error('Error updating rule:', error);
      toast.error(error?.data?.message || 'Failed to update rule');
    }
  };

  const getFormRuleFromAiHandler = async () => {
    try {
      if (!ruleData?.formId || !prompt || !name || !category)
        return toast.error('Please fill all the fields');
      const res = await getFormRuleFromAi({
        formId: ruleData?.formId,
        prompt,
        name,
        category,
      }).unwrap();
      if (res?.success) {
        setName(res?.data?.name);
        setHandler(res?.data?.handler);
        setFormula(res?.data?.formula);
        setExample(res?.data?.example);
        setExplanation(res?.data?.explanation);
        setCategory(res?.data?.category);
      }
    } catch (error) {
      console.error('Error getting form rule from ai:', error);
      toast.error(error?.data?.message || 'Failed to get form rule from ai');
    }
  };
  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <h3 className="text-center text-2xl font-semibold text-gray-800">Update Rule</h3>
        <div className="flex flex-col gap-2 w-full">
          <TextField
            label="Rule Name:*"
            id="rule-name"
            placeholder="Enter rule name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <SelectInputType
            field={{
              label: 'Category',
              options: CATEGORY_OPTIONS,
              uniqueId: 'category',
            }}
            onChange={(e) => setCategory(e.target.value)}
            form={{ category: { name: 'category', value: category } }}
          />
          <TextField
            label="Prompt"
            id="prompt"
            type="textarea"
            placeholder="Enter prompt for rule creation"
            value={prompt}
            textAreaHeight="100px"
            onChange={(e) => setPrompt(e.target.value)}
          />

          <div className="flex justify-end  w-full items-end gap-2">
            <Button
              label={showRuleFieldsGuide ? 'Hide Fields Guide' : 'Preview Fields Guide'}
              variant="secondary"
              onClick={() => setShowRuleFieldsGuide((prev) => !prev)}
            />

            <Button
              label="Get Rule from AI"
              variant="primary"
              icon={isGettingFormRuleFromAi && FaSpinner}
              cnLeft="mr-2 w-4 h-4 animate-spin"
              onClick={getFormRuleFromAiHandler}
              disabled={isGettingFormRuleFromAi || !prompt || !name || !category}
            />
          </div>
          {showRuleFieldsGuide && (
            <div className="flex flex-col gap-3 mt-4 border border-gray-200 rounded-xl p-4 bg-[#FAFBFF]">
              <h4 className="text-lg font-semibold text-gray-800">Rule Fields Guide</h4>

              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200 rounded-md overflow-hidden">
                  <thead className="bg-gray-100 text-gray-600">
                    <tr>
                      <th className="text-left px-3 py-2">Field</th>
                      <th className="text-left px-3 py-2">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RULE_FIELDS_GUIDE.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-3 py-2 font-mono text-blue-600">{item.field}</td>
                        <td className="px-3 py-2 text-gray-700">{item.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="text-xs text-gray-500">
                These fields are generated by AI and used to define how your rule works.
              </div>
            </div>
          )}
        </div>

        {formula && example && (
          <div className="flex flex-col gap-4 mt-4 border border-gray-200 rounded-xl p-4 bg-[#FAFBFF]">
            <h4 className="text-lg font-semibold text-gray-800">Rule Preview</h4>
            {explanation && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Explanation</p>
                <div className="text-sm text-gray-800 bg-white border rounded-md p-3">
                  {explanation}
                </div>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Formula</p>
              <div className="text-sm font-mono text-blue-600 bg-white border rounded-md p-3 wrap-break-word">
                {formula}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Example Calculation</p>
              <pre className="text-sm text-gray-800 bg-white border rounded-md p-3 whitespace-pre-wrap">
                {example}
              </pre>
            </div>
            <details className="mt-2">
              <summary className="cursor-pointer text-sm text-gray-500">
                Show technical code
              </summary>
              <pre className="text-xs bg-black text-green-400 p-3 rounded-md mt-2 overflow-x-auto">
                {handler}
              </pre>
            </details>
          </div>
        )}
        <div className="flex w-full justify-end gap-2">
          <Button label="Cancel" variant="secondary" onClick={() => setModal(false)} />
          <Button
            label="Update Rule"
            variant="primary"
            icon={isUpdatingRule && FaSpinner}
            cnLeft="mr-2 w-4 h-4 animate-spin"
            onClick={updateRuleHandler}
            disabled={
              isUpdatingRule ||
              !ruleData?._id ||
              !prompt ||
              !name ||
              !handler ||
              !formula ||
              !example ||
              !explanation ||
              !category
            }
          />
        </div>
      </div>
    </div>
  );
};
