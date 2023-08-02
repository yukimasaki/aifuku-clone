import { createFeatureSelector, createSelector } from "@ngrx/store";

import { MySidebarState, featureName } from "~/store/sidebar/sidebar.reducer";

export const selectSidebarState = createFeatureSelector<MySidebarState>(featureName);

// サイドバーの全情報を取得するセレクター
export const selectSidebarAllInfo = createSelector(
  selectSidebarState,
  (state) => state
);

// サイドバーの表示状態を取得するセレクター
export const selectSidebarVisible = createSelector(
  selectSidebarState,
  (state) => state.visible
);
