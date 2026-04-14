export interface PropSchema {
  key: string;
  label: string;
  type: 'text' | 'color' | 'number' | 'boolean' | 'textarea';
  placeholder?: string;
  description?: string;
}

export interface SupportedEvent {
  event: string;        // e.g. 'ON_CLICK'
  description: string;
}

export interface ComponentDefinition {
  type: string;
  label: string;
  icon: string;
  category: 'input' | 'display' | 'layout' | 'feedback' | 'navigation';
  defaultProps: Record<string, string>;
  propsSchema: PropSchema[];
  supportedEvents: SupportedEvent[];
}

export interface CanvasElement {
  id: string;
  type: string;
  props: Record<string, string>;
  bindings: Record<string, string>;  // { "ON_CLICK": "workflow://wf_id" }
  order: number;
}

export type EditorStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface PrototypeEditorState {
  elements: CanvasElement[];
  selectedId: string | null;
  status: EditorStatus;
  statusMessage: string | null;
  aiUpdateBadge: boolean;
}

export type EditorAction =
  | { type: 'ADD_ELEMENT'; elementType: string }
  | { type: 'SELECT_ELEMENT'; id: string | null }
  | { type: 'UPDATE_PROPS'; id: string; props: Record<string, string> }
  | { type: 'UPDATE_BINDINGS'; id: string; bindings: Record<string, string> }
  | { type: 'MOVE_ELEMENT'; id: string; direction: 'up' | 'down' }
  | { type: 'DELETE_ELEMENT'; id: string }
  | { type: 'SET_STATUS'; status: EditorStatus; message?: string }
  | { type: 'SYNC_FROM_REMOTE'; elements: CanvasElement[] }
  | { type: 'SET_AI_BADGE'; show: boolean }
  | { type: 'CLEAR' };
