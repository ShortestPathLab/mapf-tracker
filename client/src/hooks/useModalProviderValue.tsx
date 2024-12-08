import { MutableRefObject, createContext, useContext, useRef } from "react";

export const ModalContext = createContext<MutableRefObject<number>>({
  current: 1,
});
export function useModalProviderValue() {
  return useRef(1);
}
export function useModalDepth() {
  return useContext(ModalContext);
}
