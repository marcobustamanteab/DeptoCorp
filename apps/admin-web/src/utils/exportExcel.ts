import * as XLSX from 'xlsx'

export const exportToExcel = (data: any[], filename: string, sheetName: string = 'Datos') => {
  // Crear workbook y worksheet
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(data)

  // Agregar worksheet al workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName)

  // Generar archivo y descargar
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

export const exportMultipleSheets = (
  sheets: Array<{ data: any[]; sheetName: string }>,
  filename: string
) => {
  const wb = XLSX.utils.book_new()

  sheets.forEach(({ data, sheetName }) => {
    const ws = XLSX.utils.json_to_sheet(data)
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
  })

  XLSX.writeFile(wb, `${filename}.xlsx`)
}