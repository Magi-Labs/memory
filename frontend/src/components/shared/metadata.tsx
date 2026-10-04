import { Table, TableBody, TableRow, TableCell } from '@/components/ui/table'
export function Metadata({
  values,
}: {
  values: [string, string | number | boolean | undefined | null][]
}) {
  return (
    <Table>
      <TableBody>
        {values
          .filter(([, value]) => value !== undefined && value !== null)
          .map(([label, value]) => (
            <TableRow key={label}>
              <TableCell className="text-muted-foreground">{label}</TableCell>
              <TableCell className="whitespace-normal break-all">{String(value)}</TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  )
}
