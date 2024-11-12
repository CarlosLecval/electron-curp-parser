import { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import * as XLSX from 'xlsx';
import toast, { Toaster } from 'react-hot-toast';
import InvalidCurpsTable from './InvalidCurpsTable';
import { Button } from './components/ui/button';

export interface Result {
  row: number;
  curp: string | undefined;
}

function validateCURPs(curps: Result['curp'][]) {
  const invalidCURPs: Result[] = [];

  curps.forEach((curp, index) => {
    if (!isValidCURP(curp)) {
      invalidCURPs.push({ row: index + 2, curp });
    }
  });

  return invalidCURPs;
}

function isValidCURP(curp: Result['curp']): boolean {
  if (curp === undefined) return false;
  const curpRegex =
    /^[A-Z][AEIOU][A-Z]{2}\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|1[0-9]|2[0-9]|3[01])[HM](?:AS|B[CS]|C[CLMSH]|D[FG]|G[TR]|HG|JC|M[CNS]|N[ETL]|OC|PL|Q[TR]|S[PLR]|T[CSL]|VZ|YN|ZS)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d]{2}$/g;

  if (!curpRegex.test(curp)) return false;

  return true;
}

export default function App() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    toast.dismiss();
    setResults([]);
    setSuccess(false);
    setColumns([]);
    setSelectedColumn('');
    if (!e.target.files) return;
    setFile(e.target.files[0]);
    if (!e.target.files[0]) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if ((json[0] as string[]).length === 0) {
        toast.error('El archivo está vacío');
        return;
      }

      if (json.length > 0) {
        const headers = json[0] as string[];
        setColumns(headers);
        setSelectedColumn(headers.find((h) => h.toUpperCase() === 'C.U.R.P(*)') || headers[0]);
      }
    };
    reader.readAsArrayBuffer(e.target.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Selecciona un archivo');
      return;
    }
    if (selectedColumn === '') {
      toast.error('Selecciona una columna');
      return;
    }
    setResults([]);
    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);
      if (json.length === 0) {
        toast.error('El archivo está vacío');
        setLoading(false);
        return;
      }
      const curps = json.map((row: any) => row[selectedColumn]);
      const invalidCURPs = validateCURPs(curps);

      if (invalidCURPs.length === 0) {
        toast.success('Todos los CURPs son correctos');
        setSuccess(true);
      } else setResults(invalidCURPs);
      setLoading(false);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="container mx-auto p-4">
      <div>
        <Toaster />
      </div>
      <h1 className="text-2xl font-bold mb-4">Validador de CURPs</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex flex-col items-start gap-4">
          <Input type="file" onChange={handleFileChange} accept=".csv,.xlsx,.xls" />
          {columns.length > 0 && (
            <>
              <div className="flex gap-4 items-center">
                <p>Columna:</p>
                <Select value={selectedColumn} onValueChange={setSelectedColumn}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Selecciona la columna del CURP" />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map((column) => (
                      <SelectItem key={column} value={column}>
                        {column}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Validando...' : 'Validar'}
              </Button>
            </>
          )}
        </div>
      </form>
      <InvalidCurpsTable results={results} loading={loading} success={success} />
    </div>
  );
}
