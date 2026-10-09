"use client";
import { Plus, RotateCcw, Shuffle, Trash2, Table2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { EXAMPLES, parseValue, type Observation } from "@/lib/statistics";
type Props = {
  rows: Observation[];
  dataset: string;
  selected: string | null;
  onSelect: (id: string) => void;
  onChange: (id: string, key: "x" | "y", value: string) => void;
  onExample: (key: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onRandom: () => void;
  onClear: () => void;
};
export function DataEditor({
  rows,
  dataset,
  selected,
  onSelect,
  onChange,
  onExample,
  onAdd,
  onDelete,
  onRandom,
  onClear,
}: Props) {
  const invalid = rows.filter(
    (row) => parseValue(row.x) === null || parseValue(row.y) === null,
  ).length;
  return (
    <section className="panel data-panel" aria-labelledby="data-title">
      <div className="panel-heading">
        <h2 id="data-title">
          <Table2 size={17} /> Your data
        </h2>
        <span className="count-badge">{rows.length} rows</span>
      </div>
      <div className="data-inner">
        <label className="field-label" htmlFor="dataset">
          EXAMPLE DATASET
        </label>
        <Select value={dataset} onValueChange={onExample}>
          <SelectTrigger id="dataset" className="dataset-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            {dataset === "custom" && (
              <SelectItem value="custom">Custom observations</SelectItem>
            )}
            {dataset === "random" && (
              <SelectItem value="random">Random observations</SelectItem>
            )}
            {Object.entries(EXAMPLES).map(([key, value]) => (
              <SelectItem value={key} key={key}>
                {value.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="data-table-scroll">
          <Table className="data-table">
            <TableHeader>
              <TableRow>
                <TableHead scope="col">#</TableHead>
                <TableHead scope="col">
                  X <span>variable</span>
                </TableHead>
                <TableHead scope="col">
                  Y <span>variable</span>
                </TableHead>
                <TableHead scope="col">
                  <span className="sr-only">Remove</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  data-state={selected === row.id ? "selected" : undefined}
                >
                  <TableCell className="row-number">
                    {String(index + 1).padStart(2, "0")}
                  </TableCell>
                  {(["x", "y"] as const).map((key) => (
                    <TableCell key={key}>
                      <input
                        id={`${key}-${row.id}`}
                        aria-label={`${key.toUpperCase()} observation ${index + 1}`}
                        aria-invalid={parseValue(row[key]) === null}
                        inputMode="decimal"
                        autoComplete="off"
                        spellCheck={false}
                        value={row[key]}
                        onFocus={() => onSelect(row.id)}
                        onChange={(e) => onChange(row.id, key, e.target.value)}
                      />
                    </TableCell>
                  ))}
                  <TableCell>
                    <button
                      className="icon-button delete-row"
                      aria-label={`Remove observation ${index + 1}`}
                      onClick={() => onDelete(row.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {!rows.length && (
          <p className="editor-empty">
            No observations yet. Add a row to begin.
          </p>
        )}
        <button className="button add-row" onClick={onAdd}>
          <Plus size={15} /> Add observation
        </button>
        {invalid > 0 && (
          <p role="status" className="validation-message">
            {invalid} incomplete or invalid{" "}
            {invalid === 1 ? "row is" : "rows are"} excluded. Enter finite
            numbers in both columns.
          </p>
        )}
        <div className="editor-actions">
          <button className="button" onClick={onRandom}>
            <Shuffle size={15} /> Random data
          </button>
          <button
            className="button subtle"
            onClick={onClear}
            disabled={!rows.length}
          >
            Clear
          </button>
        </div>
      </div>
      <div className="editor-footer">
        <span>Every edit updates the plot.</span>
        <button onClick={() => onExample("starter")} className="text-button">
          <RotateCcw size={13} /> Reset
        </button>
      </div>
    </section>
  );
}
