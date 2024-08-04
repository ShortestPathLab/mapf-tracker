import { PixiComponent, useApp } from "@pixi/react";
import { Viewport as PixiViewport } from "pixi-viewport";
import * as PIXI from "pixi.js";
import React, { ForwardedRef, forwardRef } from "react";

export interface ViewportProps {
  width: number;
  height: number;
  children?: React.ReactNode;
}

export interface PixiComponentViewportProps extends ViewportProps {
  app: PIXI.Application;
}

const PixiComponentViewport = PixiComponent("Viewport", {
  create: (props: PixiComponentViewportProps) => {
    const viewport = new PixiViewport({
      screenWidth: props.width,
      screenHeight: props.height,
      worldWidth: props.width * 2,
      worldHeight: props.height * 2,
      ticker: props.app.ticker,
      events: props.app.renderer.plugins.interaction,
    });
    viewport.drag().pinch().wheel().clampZoom({});

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
