import { useEffect, useState } from "react";

export default function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      if (window.matchMedia("(pointer: coarse)").matches) {
        setIsTouch(true);
      } else {
        setIsTouch(false);
      }
    };

    checkTouch();

    // Escuchar cambios (por si conectan/desconectan periféricos)
    window.matchMedia("(pointer: coarse)").addEventListener("change", checkTouch);

    return () => {
      window.matchMedia("(pointer: coarse)").removeEventListener("change", checkTouch);
    };
  }, []);

  return isTouch;
}