import React, { createContext, useContext, useState } from "react";

interface MonthContextType {
  currentMonth: Date;
  setCurrentMonth: (month: Date) => void;
}

const MonthContext = createContext<MonthContextType | undefined>(undefined);

export function MonthProvider({ children }: { children: React.ReactNode }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  return (
    <MonthContext.Provider value={{ currentMonth, setCurrentMonth }}>
      {children}
    </MonthContext.Provider>
  );
}

export function useMonth() {
  const context = useContext(MonthContext);
  if (context === undefined) {
    throw new Error("useMonth must be used within a MonthProvider");
  }
  return context;
}


