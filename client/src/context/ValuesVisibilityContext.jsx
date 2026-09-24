import { createContext, useContext, useEffect, useState } from "react";

const ValuesVisibilityContext = createContext(null);

export function ValuesVisibilityProvider({ children }) {
  const [hidden, setHidden] = useState(() => {
    return localStorage.getItem("financeiro-web:hideValues") === "true";
  });

  useEffect(() => {
    localStorage.setItem("financeiro-web:hideValues", String(hidden));
  }, [hidden]);

  function toggleHidden() {
    setHidden((prev) => !prev);
  }

  return (
    <ValuesVisibilityContext.Provider value={{ hidden, toggleHidden }}>
      {children}
    </ValuesVisibilityContext.Provider>
  );
}

export function useValuesVisibility() {
  const context = useContext(ValuesVisibilityContext);
  if (!context) {
    throw new Error(
      "useValuesVisibility precisa ser usado dentro de um ValuesVisibilityProvider"
    );
  }
  return context;
}
