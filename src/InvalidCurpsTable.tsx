import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import TableSkeleton from './TableSkeleton'
import { Result } from "./App"

interface Props {
  results: Result[]
  loading: boolean
  success: boolean
}

export default function InvalidCurpsTable({ results, loading, success }: Props) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">CURPs inválidos:</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fila</TableHead>
            <TableHead>CURP inválido</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableSkeleton />
          ) : results.length > 0 ? (
            results.map((result, index) => (
              <TableRow key={index}>
                <TableCell>{result.row}</TableCell>
                <TableCell>{
                  result.curp ??
                  <span className="bg-red-300 rounded-sm p-1">{"Campo vacío"}</span>
                }
                </TableCell>
              </TableRow>
            ))
          ) : (success &&
            <TableRow>
              <TableCell colSpan={3} className="text-center">
                <span className="bg-green-300 rounded-sm p-1">Todos los CURPs son correctos</span>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
