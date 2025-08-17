
import { BarChart2, LineChart, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type ChartType = 'bar' | 'line' | 'pie';

interface ChartTypeSwitcherProps<T extends ChartType> {
  currentType: T;
  onTypeChange: (newType: T) => void;
  availableTypes: T[];
}

const iconMap: { [key in ChartType]: React.ReactNode } = {
  bar: <BarChart2 className="h-4 w-4" />,
  line: <LineChart className="h-4 w-4" />,
  pie: <PieChart className="h-4 w-4" />,
};

export function ChartTypeSwitcher<T extends ChartType>({
  currentType,
  onTypeChange,
  availableTypes,
}: ChartTypeSwitcherProps<T>) {
  return (
    <ToggleGroup 
      type="single"
      size="sm" 
      value={currentType}
      onValueChange={(value: T) => {
        if (value) onTypeChange(value)
      }}
      className="gap-1"
    >
      {availableTypes.map((type) => (
        <ToggleGroupItem
          key={type}
          value={type}
          aria-label={`Switch to ${type} chart`}
          className="p-1.5 h-auto"
        >
          {iconMap[type]}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

    