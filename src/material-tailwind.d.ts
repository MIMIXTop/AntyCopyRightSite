import "@material-tailwind/react";

declare module "@material-tailwind/react" {
  export interface ButtonProps {
    placeholder?: any;
    onPointerEnterCapture?: any;
    onPointerLeaveCapture?: any;
  }
  // Добавьте другие компоненты, если будут ругаться на placeholder
}