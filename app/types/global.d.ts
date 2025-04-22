// グローバル型定義
import React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // HTML要素
      [elemName: string]: any;
    }
  }
}
