import React, { createContext, useContext, useState, useEffect } from "react";
import { ThemeProvider as StyledThemeProvider } from "styled-components";
import { lightTheme, darkTheme } from "../utils/theme";
import { DefaultTheme } from "styled-components";
import { ThemeType } from "../types";

const ThemeContext = createContext({
  toggleTheme: () => {},
  isDarkMode: false,
});

export const useTheme = () => useContext(ThemeContext);

const ThemeProvider: React.FC<{ children: React.ReactNode, theme?: ThemeType }> = ({
  children,
  theme
}) => {
  const [isDarkMode, setIsDarkMode] = useState(theme === "dark");

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      return newMode;
    });
  };

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    if (!theme) {
      const handleMediaChange = (event: MediaQueryListEvent) => {
        const theme = event.matches ? "dark" : "light";
        setIsDarkMode(theme == "dark");
      };

      if (typeof window !== "undefined") {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        mediaQuery.addEventListener("change", handleMediaChange);

        cleanup = () => {
          mediaQuery.removeEventListener("change", handleMediaChange);
        };
      }
    }

    return cleanup;
  }, []);

  return (
    <ThemeContext.Provider value={{ toggleTheme, isDarkMode }}> 
      <StyledThemeProvider theme={isDarkMode ? (darkTheme as DefaultTheme) : (lightTheme as DefaultTheme)}>
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
