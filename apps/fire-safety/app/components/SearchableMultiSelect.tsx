"use client";
import Select, { StylesConfig, MultiValue } from "react-select";
import { useTheme } from "../utils/theme-context";

interface Option {
  value: string | number;
  label: string;
}

interface SearchableMultiSelectProps {
  label: string;
  emoji?: string;
  options: (string | number)[];
  selected: (string | number)[];
  onChange: (values: (string | number)[]) => void;
  placeholder?: string;
}

export default function SearchableMultiSelect({
  label,
  emoji,
  options,
  selected,
  onChange,
  placeholder = "Search and select...",
}: SearchableMultiSelectProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const selectOptions: Option[] = options.map((opt) => ({
    value: opt,
    label: String(opt),
  }));

  const selectedOptions = selectOptions.filter((opt) =>
    selected.includes(opt.value)
  );

  const handleChange = (newValue: MultiValue<Option>) => {
    onChange(newValue.map((v) => v.value));
  };

  const selectAll = () => onChange([...options]);
  const clearAll = () => onChange([]);

  // If no label provided, hide the header section
  const showHeader = label.length > 0;

  // Muted color scheme - easier on the eyes
  const customStyles: StylesConfig<Option, true> = {
    control: (base, state) => ({
      ...base,
      backgroundColor: isDark ? "#1e293b" : "#f8fafc",
      borderColor: state.isFocused
        ? isDark ? "#475569" : "#94a3b8"
        : isDark ? "#334155" : "#e2e8f0",
      borderRadius: "0.75rem",
      minHeight: "42px",
      boxShadow: state.isFocused ? `0 0 0 2px ${isDark ? "#47556940" : "#94a3b840"}` : "none",
      "&:hover": {
        borderColor: isDark ? "#475569" : "#cbd5e1",
      },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: isDark ? "#1e293b" : "#ffffff",
      borderRadius: "0.75rem",
      border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
      boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
      zIndex: 50,
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: "200px",
      padding: "4px",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? isDark ? "#475569" : "#cbd5e1"
        : state.isFocused
        ? isDark ? "#334155" : "#f1f5f9"
        : "transparent",
      color: state.isSelected
        ? isDark ? "#f1f5f9" : "#1e293b"
        : isDark ? "#e2e8f0" : "#334155",
      borderRadius: "0.5rem",
      padding: "8px 12px",
      cursor: "pointer",
      "&:active": {
        backgroundColor: isDark ? "#475569" : "#e2e8f0",
      },
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: isDark ? "#475569" : "#e2e8f0",
      borderRadius: "0.5rem",
      border: `1px solid ${isDark ? "#64748b" : "#cbd5e1"}`,
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: isDark ? "#f1f5f9" : "#334155",
      fontSize: "0.75rem",
      padding: "2px 6px",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: isDark ? "#94a3b8" : "#64748b",
      borderRadius: "0 0.5rem 0.5rem 0",
      "&:hover": {
        backgroundColor: isDark ? "#64748b" : "#cbd5e1",
        color: isDark ? "#f1f5f9" : "#1e293b",
      },
    }),
    input: (base) => ({
      ...base,
      color: isDark ? "#e2e8f0" : "#1e293b",
    }),
    placeholder: (base) => ({
      ...base,
      color: isDark ? "#64748b" : "#94a3b8",
    }),
    indicatorSeparator: () => ({ display: "none" }),
    dropdownIndicator: (base) => ({
      ...base,
      color: isDark ? "#64748b" : "#94a3b8",
      "&:hover": {
        color: isDark ? "#94a3b8" : "#64748b",
      },
    }),
    clearIndicator: (base) => ({
      ...base,
      color: isDark ? "#64748b" : "#94a3b8",
      "&:hover": {
        color: isDark ? "#f87171" : "#ef4444",
      },
    }),
  };

  return (
    <div className="space-y-2">
      {showHeader && (
        <>
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {emoji && <span className="mr-2">{emoji}</span>}
              {label}
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-500">
              {selected.length} of {options.length}
            </span>
          </div>

          <div className="flex gap-2 mb-2">
            <button
              onClick={selectAll}
              className="px-3 py-1 text-xs font-medium rounded-lg bg-slate-600 hover:bg-slate-700 dark:bg-slate-600 dark:hover:bg-slate-500 text-white transition-colors"
            >
              Select All
            </button>
            <button
              onClick={clearAll}
              className="px-3 py-1 text-xs font-medium rounded-lg bg-slate-400 dark:bg-slate-700 hover:bg-slate-500 dark:hover:bg-slate-600 text-white transition-colors"
            >
              Clear All
            </button>
          </div>
        </>
      )}

      <Select<Option, true>
        isMulti
        options={selectOptions}
        value={selectedOptions}
        onChange={handleChange}
        placeholder={placeholder}
        styles={customStyles}
        closeMenuOnSelect={false}
        hideSelectedOptions={false}
        isClearable
        isSearchable
      />
    </div>
  );
}

