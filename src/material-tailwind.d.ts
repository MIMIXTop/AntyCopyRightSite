import "@material-tailwind/react";

declare module "@material-tailwind/react" {
  export interface ButtonProps {
    placeholder?: unknown;
    onPointerEnterCapture?: unknown;
    onPointerLeaveCapture?: unknown;
  }
}