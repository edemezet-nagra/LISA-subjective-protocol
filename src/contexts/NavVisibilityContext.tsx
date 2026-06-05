// Copyright (c) 2026 Nagravision SARL
import { createContext, useContext, useState } from "react";

interface NavVisibilityContextType {
  navHidden: boolean;
  setNavHidden: (hidden: boolean) => void;
}

const NavVisibilityContext = createContext<NavVisibilityContextType>({
  navHidden: false,
  setNavHidden: () => {},
});

export function NavVisibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [navHidden, setNavHidden] = useState(false);
  return (
    <NavVisibilityContext.Provider value={{ navHidden, setNavHidden }}>
      {children}
    </NavVisibilityContext.Provider>
  );
}

export function useNavVisibility() {
  return useContext(NavVisibilityContext);
}
