"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Download, Upload, FileSpreadsheet, FileText, CheckCircle2, AlertCircle, Loader2, File, X } from "lucide-react"
import { exportToExcel, exportToCSV, importFromExcel, importFromCSV } from "@/lib/excel-utils"

export function ImportExportModal({
  data = [],
  onImport,
  entityName = "Data",
  columns = [],
  templateData = [],
  children,
}) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("export")
  const [exportFormat, setExportFormat] = useState("excel")
  const [importFile, setImportFile] = useState(null)
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [importedData, setImportedData] = useState([])
  const [importErrors, setImportErrors] = useState([])
  const fileInputRef = useRef(null)

  const handleExport = async () => {
    if (!data.length) {
      toast({
        title: "No Data",
        description: "There is no data to export.",
        variant: "destructive",
      })
      return
    }

    setExporting(true)
    setProgress(0)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 20, 90))
      }, 100)

      const filename = `${entityName.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}`

      if (exportFormat === "excel") {
        exportToExcel(data, filename, entityName)
      } else {
        exportToCSV(data, filename)
      }

      clearInterval(progressInterval)
      setProgress(100)

      toast({
        title: "Export Successful",
        description: `${data.length} ${entityName.toLowerCase()} exported successfully.`,
      })

      setTimeout(() => {
        setProgress(0)
        setExporting(false)
      }, 500)
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "An error occurred while exporting data.",
        variant: "destructive",
      })
      setExporting(false)
      setProgress(0)
    }
  }

  const handleDownloadTemplate = () => {
    const template = templateData.length
      ? templateData
      : [
          columns.reduce((acc, col) => {
            acc[col.key] = col.example || ""
            return acc
          }, {}),
        ]

    exportToExcel(template, `${entityName.toLowerCase()}-template`, "Template")

    toast({
      title: "Template Downloaded",
      description: "Fill in the template and import it back.",
    })
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImportFile(file)
    setImportErrors([])
    setImporting(true)
    setProgress(0)

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 80))
      }, 100)

      let parsedData
      if (file.name.endsWith(".csv")) {
        parsedData = await importFromCSV(file)
      } else {
        parsedData = await importFromExcel(file)
      }

      clearInterval(progressInterval)
      setProgress(100)

      // Validate data
      const errors = []
      parsedData.forEach((row, index) => {
        columns.forEach((col) => {
          if (col.required && !row[col.key]) {
            errors.push(`Row ${index + 2}: Missing required field "${col.label}"`)
          }
        })
      })

      if (errors.length) {
        setImportErrors(errors.slice(0, 5))
      }

      setImportedData(parsedData)
      setImporting(false)
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to parse the file. Please check the format.",
        variant: "destructive",
      })
      setImporting(false)
      setProgress(0)
    }
  }

  const handleImport = async () => {
    if (!importedData.length) return

    setImporting(true)
    try {
      await onImport?.(importedData)
      toast({
        title: "Import Successful",
        description: `${importedData.length} records imported successfully.`,
      })
      setOpen(false)
      resetImport()
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error.message || "An error occurred while importing data.",
        variant: "destructive",
      })
    } finally {
      setImporting(false)
    }
  }

  const resetImport = () => {
    setImportFile(null)
    setImportedData([])
    setImportErrors([])
    setProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Import/Export
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import/Export {entityName}</DialogTitle>
          <DialogDescription>Export data to Excel/CSV or import from a file</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">
              <Download className="h-4 w-4 mr-2" />
              Export
            </TabsTrigger>
            <TabsTrigger value="import">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excel">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-green-600" />
                      Excel (.xlsx)
                    </div>
                  </SelectItem>
                  <SelectItem value="csv">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      CSV (.csv)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Alert>
              <AlertDescription className="flex items-center justify-between">
                <span>{data.length} records will be exported</span>
                <Badge variant="secondary">{entityName}</Badge>
              </AlertDescription>
            </Alert>

            {exporting && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-muted-foreground text-center">Exporting... {progress}%</p>
              </div>
            )}

            <Button onClick={handleExport} disabled={exporting || !data.length} className="w-full">
              {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
              Export {entityName}
            </Button>
          </TabsContent>

          <TabsContent value="import" className="space-y-4 mt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Select File</Label>
                <Button variant="link" size="sm" onClick={handleDownloadTemplate} className="h-auto p-0">
                  Download Template
                </Button>
              </div>

              {!importFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                >
                  <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="font-medium">Click to upload or drag and drop</p>
                  <p className="text-sm text-muted-foreground mt-1">Excel (.xlsx) or CSV (.csv) files</p>
                </div>
              ) : (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <File className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{importFile.name}</p>
                        <p className="text-xs text-muted-foreground">{(importFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={resetImport}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <Input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {importing && progress < 100 && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-muted-foreground text-center">Processing file... {progress}%</p>
              </div>
            )}

            {importedData.length > 0 && (
              <Alert className="bg-green-500/10 border-green-500/20">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">
                  {importedData.length} records ready to import
                </AlertDescription>
              </Alert>
            )}

            {importErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium mb-1">Validation Errors:</p>
                  <ul className="text-xs space-y-1">
                    {importErrors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleImport}
              disabled={importing || !importedData.length || importErrors.length > 0}
              className="w-full"
            >
              {importing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
              Import {importedData.length || ""} Records
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
