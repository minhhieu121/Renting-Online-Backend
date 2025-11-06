const Report = require("../models/Report");

// @desc    Create a new report
// @route   POST /api/reports
// @access  Private
const createReport = async (req, res) => {
  try {
    const reportData = req.body;
    const created = await Report.createReport(reportData);
    return res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// @desc    Get all reports
// @route   GET /api/reports
// @access  Private/Admin
const getAllReports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {
      status: req.query.status,
      reporting_user_id: req.query.reporting_user_id,
      reported_user_id: req.query.reported_user_id,
    };
    const result = await Report.getAllReports(page, limit, filters);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// @desc    Get report by ID
// @route   GET /api/reports/:id
// @access  Private/Admin
const getReportById = async (req, res) => {
  try {
    const id = req.params.id;
    const report = await Report.getReportById(id);
    if (!report) return res.status(404).json({ success: false, error: "Report not found" });
    return res.status(200).json({ success: true, data: report });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// @desc    Get reports by status
// @route   GET /api/reports/status/:status
// @access  Private/Admin
const getReportsByStatus = async (req, res) => {
  try {
    const status = req.params.status;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await Report.getReportsByStatus(status, page, limit);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// @desc    Update report
// @route   PUT /api/reports/:id
// @access  Private/Admin
const resolveReport = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;
    const updated = await Report.resolveReport(id, updatedData);
    if (!updated) return res.status(404).json({ success: false, error: "Report not found" });
    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// @desc    Delete report
// @route   DELETE /api/reports/:id
// @access  Private/Admin
const deleteReport = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Report.deleteReport(id);
    if (!deleted) return res.status(404).json({ success: false, error: "Report not found" });
    return res.status(200).json({ success: true, data: deleted });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

module.exports = {
  createReport,
  getAllReports,
  getReportById,
  getReportsByStatus,
  resolveReport,
  deleteReport,
};