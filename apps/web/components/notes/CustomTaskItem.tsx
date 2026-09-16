"use client";

import { TaskItem } from "@tiptap/extension-task-item";
import { NodeViewWrapper, NodeViewContent, ReactNodeViewRenderer } from "@tiptap/react";

const CustomTaskItemComponent = (props: any) => {
  return (
    <NodeViewWrapper as="li" data-type="taskItem" data-checked={props.node.attrs.checked}>
      <label className="nm-custom-checkbox">
        <input
          type="checkbox"
          checked={props.node.attrs.checked}
          onChange={() => props.updateAttributes({ checked: !props.node.attrs.checked })}
        />
        <div className="nm-checkmark">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width={20} height={20} rx={5} ry={5} strokeWidth={2} />
              <polyline points="7 10 12 16 22 2" strokeWidth={3} />
            </g>
          </svg>
        </div>
      </label>
      <NodeViewContent as="div" className="nm-task-content" />
    </NodeViewWrapper>
  );
};

export const CustomTaskItem = TaskItem.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CustomTaskItemComponent);
  },
});
