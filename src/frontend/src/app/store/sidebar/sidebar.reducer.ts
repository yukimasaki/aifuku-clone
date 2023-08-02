import { createReducer, on } from "@ngrx/store";
import { toggleVisibleSidebarAction } from "./sidebar.action";

// デバッグツールでの表示名
export const featureName = 'sidebar';

// 型定義
export type MySidebarState = {
  visible: boolean;
}

// 初期値の設定 (Store本体)
export const initialState: MySidebarState = {
  visible: false,
}

export const sidebarReducer = createReducer(
  initialState,
  on(toggleVisibleSidebarAction, (state) => ({
    ...state,
    visible: !state.visible,
  })),
);
