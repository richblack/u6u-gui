import { useReducer, useCallback } from 'react';
import type { PrototypeEditorState, EditorAction, CanvasElement } from '../types/prototype';
import { COMPONENT_REGISTRY } from '../constants/componentRegistry';

function nanoid6(): string {
  return Math.random().toString(36).slice(2, 8);
}

const initialState: PrototypeEditorState = {
  elements: [],
  selectedId: null,
  status: 'idle',
  statusMessage: null,
  aiUpdateBadge: false,
};

function reducer(state: PrototypeEditorState, action: EditorAction): PrototypeEditorState {
  switch (action.type) {
    case 'ADD_ELEMENT': {
      const def = COMPONENT_REGISTRY.find(c => c.type === action.elementType);
      if (!def) return state;
      const maxOrder = state.elements.reduce((m, e) => Math.max(m, e.order), 0);
      const el: CanvasElement = {
        id: `el-${nanoid6()}`,
        type: action.elementType,
        props: { ...def.defaultProps },
        bindings: {},
        order: maxOrder + 10,
      };
      return { ...state, elements: [...state.elements, el], selectedId: el.id };
    }
    case 'SELECT_ELEMENT':
      return { ...state, selectedId: action.id };
    case 'UPDATE_PROPS': {
      return {
        ...state,
        elements: state.elements.map(e =>
          e.id === action.id ? { ...e, props: { ...e.props, ...action.props } } : e
        ),
      };
    }
    case 'UPDATE_BINDINGS': {
      return {
        ...state,
        elements: state.elements.map(e =>
          e.id === action.id ? { ...e, bindings: { ...e.bindings, ...action.bindings } } : e
        ),
      };
    }
    case 'MOVE_ELEMENT': {
      const sorted = [...state.elements].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex(e => e.id === action.id);
      const swapIdx = action.direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= sorted.length) return state;
      const updated = sorted.map(e => ({ ...e }));
      const tmp = updated[idx].order;
      updated[idx].order = updated[swapIdx].order;
      updated[swapIdx].order = tmp;
      return { ...state, elements: updated };
    }
    case 'DELETE_ELEMENT': {
      const newSelected = state.selectedId === action.id ? null : state.selectedId;
      return { ...state, elements: state.elements.filter(e => e.id !== action.id), selectedId: newSelected };
    }
    case 'SET_STATUS':
      return { ...state, status: action.status, statusMessage: action.message ?? null };
    case 'SYNC_FROM_REMOTE':
      return { ...state, elements: action.elements, selectedId: null };
    case 'SET_AI_BADGE':
      return { ...state, aiUpdateBadge: action.show };
    case 'CLEAR':
      return { ...initialState };
    default:
      return state;
  }
}

export function usePrototypeEditor() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const addElement = useCallback((type: string) => dispatch({ type: 'ADD_ELEMENT', elementType: type }), []);
  const selectElement = useCallback((id: string | null) => dispatch({ type: 'SELECT_ELEMENT', id }), []);
  const updateProps = useCallback((id: string, props: Record<string, string>) => dispatch({ type: 'UPDATE_PROPS', id, props }), []);
  const updateBindings = useCallback((id: string, bindings: Record<string, string>) => dispatch({ type: 'UPDATE_BINDINGS', id, bindings }), []);
  const moveElement = useCallback((id: string, direction: 'up' | 'down') => dispatch({ type: 'MOVE_ELEMENT', id, direction }), []);
  const deleteElement = useCallback((id: string) => dispatch({ type: 'DELETE_ELEMENT', id }), []);
  const setStatus = useCallback((status: EditorAction & { type: 'SET_STATUS' }) => dispatch(status), []);
  const syncFromRemote = useCallback((elements: CanvasElement[]) => dispatch({ type: 'SYNC_FROM_REMOTE', elements }), []);
  const setAiBadge = useCallback((show: boolean) => dispatch({ type: 'SET_AI_BADGE', show }), []);
  const clear = useCallback(() => dispatch({ type: 'CLEAR' }), []);

  const selectedElement = state.elements.find(e => e.id === state.selectedId) ?? null;
  const sortedElements = [...state.elements].sort((a, b) => a.order - b.order);

  return { state, sortedElements, selectedElement, addElement, selectElement, updateProps, updateBindings, moveElement, deleteElement, setStatus, syncFromRemote, setAiBadge, clear, dispatch };
}
