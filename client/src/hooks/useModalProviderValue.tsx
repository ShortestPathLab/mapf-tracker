import {
  Dispatch,
  MutableRefObject,
  Ref,
  RefObject,
  SetStateAction,
  createContext,
  useContext,
  useRef,
  useState,
} from "react";
import { useGetSet } from "react-use";

export const ModalContext = createContext<MutableRefObject<number>>({
  current: 1,
});
export function useModalProviderValue() {
  return useRef(1);
}
export function useModalDepth() {
  return useContext(ModalContext);
}
