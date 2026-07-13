import React, { useEffect, useMemo, useState } from "react";
import PageHeader from '../../components/PageHeader';

import {
  ChevronDown,
  FileSpreadsheet,
  Download,
  Loader2,
  TrendingUp,
  Calendar,
  Package,
  DollarSign,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  Clock,
  X,
} from "lucide-react";
import AdminTable from "../../components/AdminTable";
import { adminGetSalesReportAPI } from "../../api/SalesreportApi";

// Professional color palette
const COLORS = {
  primary: "# #009EDB",      // Professional blue
  secondary: "#003147",    // Slate gray
  accent: "#06B6D4",       // Cyan accent
  success: "#10B981",      // Emerald
  warning: "#F59E0B",      // Amber
  danger: "#EF4444",       // Red
  neutral: "#F8FAFC",      // Slate light
  darkBg: "#FFFFFF",
  border: "#E2E8F0",
};
const STATUS_CONFIG = {
  Delivered: { bg: "#D1FAE5", text: "#065F46", icon: CheckCircle2 },
  Shipped: { bg: "#DBEAFE", text: "#0C4A6E", icon: Package },
  Pending: { bg: "#FEF3C7", text: "#78350F", icon: Clock },
  Cancelled: { bg: "#FEE2E2", text: "#7F1D1D", icon: X },
  Processing: { bg: "#EDE9FE", text: "#4C1D95", icon: BarChart3 },
  Returned: { bg: "#F3E8FF", text: "#5B21B6", icon: BarChart3 },
};
const RANGE_OPTIONS = ["Today", "Weekly", "Monthly", "Yearly", "Custom Date Range"];
const TABLE_HEADERS = [
  { label: "Order ID", key: "id", sortable: true, width: "12%" },
  { label: "Customer", key: "customer", sortable: true, width: "22%" },
  { label: "Items", key: "items", sortable: false, align: "center", width: "8%" },
  { label: "Payment", key: "payment", sortable: false, width: "15%" },
  { label: "Status", key: "status", sortable: false, width: "13%" },
  { label: "GST (₹)", key: "gst", sortable: true, align: "right", width: "15%" },
  { label: "Total (₹)", key: "amount", sortable: true, align: "right", width: "15%" },
];
const EMPTY_STATS = {
  totalOrders: 0,
  grossSales: 0,
  gstCollected: 0,
  netSales: 0,
  cancelledOrders: 0,
  cancelledValue: 0,
  finalIncome: 0,
};
const todayStr = () => new Date().toISOString().slice(0, 10);
// Professional PDF Report Generator
const generatePDFReport = async (stats, rows, range, from, to) => {
  const { jsPDF } = await import("jspdf");
  const { default: html2canvas } = await import("html2canvas");

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 15;

  doc.setFontSize(24);
  doc.setTextColor(0, 102, 204);
  doc.text("SALES ANALYTICS REPORT", 15, yPos);
  
  yPos += 8;
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Report Period: ${range}${range === "Custom Date Range" ? ` (${from} to ${to})` : ""}`, 15, yPos);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 15, yPos, { align: "right" });

  yPos += 12;
  doc.setDrawColor(230, 232, 240);
  doc.line(15, yPos, pageWidth - 15, yPos);

  yPos += 8;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, "bold");
  doc.text("KEY PERFORMANCE INDICATORS", 15, yPos);

  yPos += 8;
  const metricsData = [
    { label: "Total Orders", value: stats.totalOrders, unit: "" },
    { label: "Gross Sales", value: `₹${Number(stats.grossSales || 0).toLocaleString("en-IN")}`, unit: "" },
    { label: "GST Collected", value: `₹${Number(stats.gstCollected || 0).toLocaleString("en-IN")}`, unit: "" },
    { label: "Net Sales", value: `₹${Number(stats.netSales || 0).toLocaleString("en-IN")}`, unit: "" },
    { label: "Cancelled Orders", value: stats.cancelledOrders, unit: "" },
    { label: "Net Income", value: `₹${Number(stats.finalIncome || 0).toLocaleString("en-IN")}`, unit: "" },
  ];

  const metricColWidth = (pageWidth - 30) / 3;
  metricsData.forEach((metric, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const xPos = 15 + col * metricColWidth;
    const mYPos = yPos + row * 16;

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.setFont(undefined, "normal");
    doc.text(metric.label, xPos, mYPos);

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, "bold");
    doc.text(metric.value, xPos, mYPos + 5);
  });

  yPos += 40;
  doc.setDrawColor(230, 232, 240);
  doc.line(15, yPos, pageWidth - 15, yPos);

  yPos += 8;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, "bold");
  doc.text("ORDER DETAILS", 15, yPos);

  yPos += 8;
  doc.setFontSize(9);
  doc.setFont(undefined, "bold");
  doc.setTextColor(255, 255, 255);
  doc.setFillColor(0, 102, 204);

  const colWidths = [15, 30, 12, 20, 18, 25, 25];
  const headers = ["Order ID", "Customer", "Items", "Payment", "Status", "GST (₹)", "Total (₹)"];

  headers.forEach((header, idx) => {
    const xPos = 15 + colWidths.slice(0, idx).reduce((a, b) => a + b, 0);
    doc.text(header, xPos + 1, yPos + 4, { maxWidth: colWidths[idx] - 2 });
  });

  yPos += 7;
  doc.setDrawColor(230, 232, 240);
  doc.line(15, yPos, pageWidth - 15, yPos);

  yPos += 2;
  doc.setFont(undefined, "normal");
  doc.setTextColor(0, 0, 0);
  doc.setFillColor(248, 250, 252);

  const rowsPerPage = 15;
  let currentRow = 0;

  rows.slice(0, 100).forEach((row, idx) => {
    if (currentRow >= rowsPerPage) {
      doc.addPage();
      yPos = 15;
      currentRow = 0;

      doc.setFontSize(9);
      doc.setFont(undefined, "bold");
      doc.setTextColor(255, 255, 255);
      doc.setFillColor(0, 102, 204);
      headers.forEach((header, i) => {
        const xPos = 15 + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
        doc.text(header, xPos + 1, yPos + 4, { maxWidth: colWidths[i] - 2 });
      });
      yPos += 7;
      doc.setDrawColor(230, 232, 240);
      doc.line(15, yPos, pageWidth - 15, yPos);
      yPos += 2;
      doc.setFont(undefined, "normal");
      doc.setTextColor(0, 0, 0);
      doc.setFillColor(248, 250, 252);
    }
    if (idx % 2 === 0) {
      doc.rect(15, yPos, pageWidth - 30, 6, "F");
    }
    const rowData = [
      row.id || "",
      row.customer || "",
      row.items || "0",
      row.payment || "",
      row.status || "",
      `₹${Number(row.gst || 0).toLocaleString("en-IN")}`,
      `₹${Number(row.amount || 0).toLocaleString("en-IN")}`,
    ];

    rowData.forEach((data, i) => {
      const xPos = 15 + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
      doc.setFontSize(8);
      doc.text(String(data), xPos + 1, yPos + 4, { maxWidth: colWidths[i] - 2 });
    });

    yPos += 6;
    currentRow++;
  });

  const footerY = pageHeight - 10;
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Page ${doc.internal.pages.length - 1}`, pageWidth / 2, footerY, { align: "center" });

  doc.save(`sales_report_${range.toLowerCase().replace(/\s+/g, "_")}.pdf`);
};

// CSV Export
const exportToCSV = (rows, range, stats) => {
  let csv = "SALES ANALYTICS REPORT\n";
  csv += `Report Period: ${range}\n`;
  csv += `Generated: ${new Date().toLocaleString()}\n\n`;

  csv += "KEY METRICS\n";
  csv += `Total Orders,${stats.totalOrders}\n`;
  csv += `Gross Sales,₹${stats.grossSales}\n`;
  csv += `GST Collected,₹${stats.gstCollected}\n`;
  csv += `Net Sales,₹${stats.netSales}\n`;
  csv += `Net Income,₹${stats.finalIncome}\n\n`;

  csv += "ORDER DETAILS\n";
  csv += "Order ID,Customer,Items,Payment,Status,GST (₹),Total (₹)\n";
  rows.forEach((row) => {
    csv += `${row.id},"${row.customer}",${row.items},"${row.payment}","${row.status}",${row.gst},${row.amount}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `sales_report_${range.toLowerCase().replace(/\s+/g, "_")}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// XLSX Export
const exportToExcel = async (rows, range, stats) => {
  const { default: ExcelJS } = await import("exceljs/dist/exceljs.bare.js");
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sales Report");

  worksheet.mergeCells("A1:G1");
  worksheet.getCell("A1").value = "SALES ANALYTICS REPORT";
  worksheet.getCell("A1").font = { bold: true, size: 16, color: { rgb: "FF0066CC" } };
  worksheet.getCell("A1").alignment = { horizontal: "center", vertical: "center" };

  worksheet.mergeCells("A2:G2");
  worksheet.getCell("A2").value = `Report Period: ${range} | Generated: ${new Date().toLocaleString()}`;
  worksheet.getCell("A2").font = { size: 10, color: { rgb: "FF64748B" } };

  worksheet.addRow([]);
  const metricRow = worksheet.addRow(["KEY METRICS"]);
  metricRow.font = { bold: true, size: 12 };

  const metrics = [
    ["Total Orders", stats.totalOrders],
    ["Gross Sales (₹)", stats.grossSales],
    ["GST Collected (₹)", stats.gstCollected],
    ["Net Sales (₹)", stats.netSales],
    ["Net Income (₹)", stats.finalIncome],
  ];

  metrics.forEach(([label, value]) => {
    const row = worksheet.addRow([label, value]);
    row.getCell(1).font = { bold: true };
    row.getCell(2).numFmt = "#,##0.00";
  });

  worksheet.addRow([]);

  const headerRow = worksheet.addRow([
    "Order ID",
    "Customer",
    "Items",
    "Payment",
    "Status",
    "GST (₹)",
    "Total (₹)",
  ]);

  headerRow.font = { bold: true, color: { rgb: "FFFFFFFF" } };
  headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { rgb: "FF0066CC" } };
  headerRow.alignment = { horizontal: "center", vertical: "center" };

  rows.forEach((row) => {
    const dataRow = worksheet.addRow([
      row.id,
      row.customer,
      row.items,
      row.payment,
      row.status,
      row.gst,
      row.amount,
    ]);
    dataRow.getCell(6).numFmt = "#,##0.00";
    dataRow.getCell(7).numFmt = "#,##0.00";
  });

  worksheet.columns = [
    { width: 12 },
    { width: 20 },
    { width: 8 },
    { width: 15 },
    { width: 12 },
    { width: 12 },
    { width: 12 },
  ];

  await workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `sales_report_${range.toLowerCase().replace(/\s+/g, "_")}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
};

export default function SalesAnalytics() {
  const [range, setRange] = useState("Today");
  const [rangeOpen, setRangeOpen] = useState(false);
  const [from, setFrom] = useState(todayStr());
  const [to, setTo] = useState(todayStr());
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [stats, setStats] = useState(EMPTY_STATS);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchReport = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = { range };
        if (range === "Custom Date Range") {
          params.from = from;
          params.to = to;
        }

        const res = await adminGetSalesReportAPI(params);
        if (!cancelled) {
          setStats(res.data.stats || EMPTY_STATS);
          setRows(res.data.rows || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.data?.message || "Failed to load sales report");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchReport();
    return () => {
      cancelled = true;
    };
  }, [range, from, to]);

  const sortedRows = useMemo(() => {
    if (!sortConfig.key) return rows;
    return [...rows].sort((a, b) => {
      const av = a[sortConfig.key];
      const bv = b[sortConfig.key];
      if (typeof av === "number") return sortConfig.direction === "asc" ? av - bv : bv - av;
      return sortConfig.direction === "asc"
        ? String(av ?? "").localeCompare(String(bv ?? ""))
        : String(bv ?? "").localeCompare(String(av ?? ""));
    });
  }, [rows, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };

  const handleExport = async (format) => {
    if (rows.length === 0) return;
    setExporting(format);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      if (format === "pdf") {
        await generatePDFReport(stats, rows, range, from, to);
      } else if (format === "csv") {
        exportToCSV(rows, range, stats);
      } else if (format === "excel") {
        await exportToExcel(rows, range, stats);
      }
    } catch (err) {
      console.error("Export error:", err);
      setError("Failed to export report. Please try again.");
    } finally {
      setExporting(null);
    }
  };

  const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

  // Mapping out data rows to integrate seamlessly with standard AdminTable mapping behaviors
  const tableData = useMemo(() => {
    return sortedRows.map((row) => {
      const StatusIcon = STATUS_CONFIG[row.status]?.icon || CheckCircle2;
      const statusStyle = STATUS_CONFIG[row.status] || STATUS_CONFIG.Returned;

      return {
        ...row,
        id: (
          <span className="font-bold" style={{ color: COLORS.secondary }}>
            #{row.id}
          </span>
        ),
        customer: (
          <span style={{ color: COLORS.secondary }} className="font-medium">
            {row.customer}
          </span>
        ),
        items: (
          <span style={{ color: COLORS.secondary }} className="font-medium">
            {row.items}
          </span>
        ),
        payment: (
          <span style={{ color: COLORS.secondary }} className="text-sm">
            {row.payment}
          </span>
        ),
        status: (
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-xs font-semibold"
            style={{  color: statusStyle.text }}
          >
            <StatusIcon size={12} />
            {row.status}
          </div>
        ),
        gst: (
          <span style={{ color: COLORS.secondary }} className="font-mono font-medium">
            {fmt(row.gst)}
          </span>
        ),
        amount: (
          <span className="font-mono font-bold" style={{ color: COLORS.primary }}>
            {fmt(row.amount)}
          </span>
        ),
      };
    });
  }, [sortedRows]);

  return (
    <div style={{ backgroundColor: COLORS.neutral, minHeight: "100vh", width: "100%" }} className="font-sans antialiased">



  <div className="w-full text-slate-800 antialiased min-h-screen">

      <PageHeader
        title="Sales Analytics"
        subtitle="Real-time performance metrics and comprehensive reporting"
      >

         {/* Compact Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            

            {/* Controls */}
            <div className="flex items-center gap-2">
              {/* Range Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setRangeOpen(!rangeOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-md border text-sm transition-all hover:border-blue-300"
                  style={{ borderColor: COLORS.border, color: COLORS.secondary }}
                >
                  <Calendar size={14} />
                  <span className="font-medium">{range}</span>
                  <ChevronDown size={14} />
                </button>

                {rangeOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setRangeOpen(false)} />
                    <div className="absolute right-0 mt-1 w-44 bg-white rounded-md shadow-md z-40 overflow-hidden border"
                      style={{ borderColor: COLORS.border }}>
                      {RANGE_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => {
                            setRange(opt);
                            setRangeOpen(false);
                            setSortConfig({ key: null, direction: "asc" });
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-medium transition-colors hover:bg-blue-50"
                          style={{
                            backgroundColor: opt === range ? COLORS.primary + "10" : "transparent",
                            color: opt === range ? COLORS.primary : COLORS.secondary,
                          }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Custom Date Range */}
              {range === "Custom Date Range" && (
                <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border text-xs"
                  style={{ borderColor: COLORS.border }}>
                  <input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="bg-transparent outline-none"
                    style={{ color: COLORS.secondary }}
                  />
                  <span style={{ color: COLORS.secondary }} className="text-[10px] font-semibold">TO</span>
                  <input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="bg-transparent outline-none"
                    style={{ color: COLORS.secondary }}
                  />
                </div>
              )}

              {/* Export Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  disabled={exporting || rows.length === 0}
                  onClick={() => handleExport("pdf")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all disabled:opacity-50"
                  style={{ backgroundColor: COLORS.primary, color: "white" }}
                >
                  {exporting === "pdf" ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                  <span className="hidden sm:inline">PDF</span>
                </button>

                <button
                  disabled={exporting || rows.length === 0}
                  onClick={() => handleExport("excel")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all border disabled:opacity-50"
                  style={{ borderColor: COLORS.border, color: COLORS.primary }}
                >
                  {exporting === "excel" ? <Loader2 size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />}
                  <span className="hidden sm:inline">Excel</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </PageHeader>


       

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-md flex items-center gap-2 bg-red-50 border text-xs"
            style={{ borderColor: "#FCA5A5", color: COLORS.danger }}>
            <AlertCircle size={16} />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* KPI Cards (Tightened padding and gap) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <KPICard label="Total Orders" value={loading ? "—" : stats.totalOrders} icon={Package} colors={COLORS} />
          <KPICard label="Gross Sales" value={loading ? "—" : fmt(stats.grossSales)} icon={DollarSign} colors={COLORS} accent />
          <KPICard label="GST Collected" value={loading ? "—" : fmt(stats.gstCollected)} icon={BarChart3} colors={COLORS} />
          <KPICard label="Net Income" value={loading ? "—" : fmt(stats.finalIncome)} icon={TrendingUp} colors={COLORS} highlight />
        </div>

        {/* Secondary Metrics Row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
       
          <MetricCard label="Cancelled Orders" value={stats.cancelledOrders} subtext="Total voids" colors={COLORS} warning />
          <MetricCard label="Lost Revenue" value={fmt(stats.cancelledValue)} subtext="From cancellations" colors={COLORS} />
        </div>

        {/* Dynamic AdminTable container */}
       <div className="bg-white rounded-md shadow-sm border overflow-hidden" style={{ borderColor: COLORS.border }}>
  <AdminTable
    headers={TABLE_HEADERS}
    data={sortedRows} // pass raw rows here
    loading={loading}
    sortConfig={sortConfig}
    onSort={handleSort}
    // ADD THIS PROP:
    renderRow={(row, idx) => {
      const StatusIcon = STATUS_CONFIG[row.status]?.icon || CheckCircle2;
      const statusStyle = STATUS_CONFIG[row.status] || STATUS_CONFIG.Returned;

      return (
        <tr key={row.id} className="border-b transition-colors hover:bg-blue-50" style={{ borderColor: COLORS.border }}>
          <td className="px-6 py-4">
            <span className="font-bold" style={{ color: COLORS.secondary }}>#{row.id}</span>
          </td>
          <td className="px-6 py-4">
            <span style={{ color: COLORS.secondary }} className="font-medium">{row.customer}</span>
          </td>
          <td className="px-6 py-4 text-center">
            <span style={{ color: COLORS.secondary }} className="font-medium">{row.items}</span>
          </td>
          <td className="px-6 py-4">
            <span style={{ color: COLORS.secondary }} className="text-sm">{row.payment}</span>
          </td>
          <td className="px-6 py-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}>
              <StatusIcon size={12} />
              {row.status}
            </div>
          </td>
          <td className="px-6 py-4 text-right">
            <span style={{ color: COLORS.secondary }} className="font-mono font-medium">{fmt(row.gst)}</span>
          </td>
          <td className="px-6 py-4 text-right">
            <span className="font-mono font-bold" style={{ color: COLORS.primary }}>{fmt(row.amount)}</span>
          </td>
        </tr>
      );
    }}
  />
</div>
      </div>
    </div>
  );
}

// Compact KPI Card Component
function KPICard({ label, value, icon: Icon, colors, accent, highlight }) {
  return (
    <div className="p-4 rounded-md border transition-all bg-white" style={{ borderColor: colors.border }}>
      <div className="flex items-center justify-between">
        <div>
          <p style={{ color: colors.secondary }} className="text-xs font-medium tracking-tight">
            {label}
          </p>
          <p className="text-xl font-bold mt-1"
            style={{ color: highlight ? colors.success : accent ? colors.primary : colors.secondary }}
          >
            {value}
          </p>
        </div>
        <div className="p-2 rounded-md" style={{ backgroundColor: accent ? colors.primary + "10" : colors.neutral }}>
          <Icon size={18} style={{ color: accent ? colors.primary : colors.secondary }} />
        </div>
      </div>
    </div>
  );
}

// Compact Metric Card Component
function MetricCard({ label, value, subtext, colors, warning }) {
  return (
    <div className="p-4 rounded-md border"
      style={{
        backgroundColor: warning ? colors.danger + "05" : "white",
        borderColor: warning ? colors.danger + "30" : colors.border,
      }}
    >
      <p style={{ color: colors.secondary }} className="text-xs font-medium">
        {label}
      </p>
      <p className="text-xl font-bold mt-1" style={{ color: warning ? colors.danger : colors.primary }}>
        {value}
      </p>
      <p style={{ color: colors.secondary }} className="text-[10px] mt-1 opacity-80">
        {subtext}
      </p>
    </div>
  );
}