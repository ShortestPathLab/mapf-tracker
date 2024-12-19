import { PixiComponent, useApp } from "@pixi/react";
import { Viewport as PixiViewport } from "pixi-viewport";
import * as PIXI from "pixi.js";
import React, { ForwardedRef, forwardRef } from "react";
import { EventSystem } from "@pixi/events";

export interface ViewportProps {
  width: number;
  height: number;
  children?: React.ReactNode;
  onViewport: (v: PixiViewport) => void;
}

export interface PixiComponentViewportProps extends ViewportProps {
  app: PIXI.Application;
}

const PixiComponentViewport = PixiComponent("Viewport", {
  create: (props: PixiComponentViewportProps) => {
    const events = new EventSystem(props.app.renderer);
    events.domElement = props.app.renderer.view as unknown as HTMLElement;
    const viewport = new PixiViewport({
      stopPropagation: true,
      screenWidth: props.width,
      screenHeight: props.height,
      worldWidth: props.width * 2,
      worldHeight: props.height * 2,
      ticker: props.app.ticker,
      events,
    });
    viewport.drag().pinch().wheel().clampZoom({});
    props.onViewport?.(viewport);
    return viewport;
  },
});

const Viewport = forwardRef(
  (props: ViewportProps, ref: ForwardedRef<PixiViewport>) => {
    const app = useApp();
    return <PixiComponentViewport ref={ref} app={app} {...props} />;
  }
);

export default Viewport;
