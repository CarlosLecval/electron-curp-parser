import { Skeleton } from "@/components/ui/skeleton"
import { TableCell, TableRow } from "@/components/ui/table"

export default function TableSkeleton() {
  return (<>
    {
      Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={index}>
          <TableCell><Skeleton className="h-6 w-14" /></TableCell>
          <TableCell><Skeleton className="h-6 w-40" /></TableCell>
        </TableRow>
      ))
    }
  </>)
}
