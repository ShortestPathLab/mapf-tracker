import { PixiComponent, useApp } from "@pixi/react";
import { Viewport as PixiViewport } from "pixi-viewport";
import * as PIXI from "pixi.js";
import React, { ForwardedRef, forwardRef } from "react";
import { EventSystem } from "@pixi/events";
import { now } from "lodash";

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
      worldWidth: props.width,
      worldHeight: props.height,
      ticker: props.app.ticker,
      events,
      passiveWheel: false,
    });
    viewport.drag().pinch().wheel().decelerate().clamp({
      direction: "all",
      underflow: "center",
    });
    let lastClick = now();
    viewport.on("clicked", () => {
      if (now() - lastClick < 300) {
        viewport.animate({
          scale: viewport.scale.x * 1.4,
          time: 300,
          ease: "easeInOutQuint",
        });
      }
      lastClick = now();
    });
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
