const express = require("express");

const {
  createReport,
  getAllReports,
  getReportById,
  getReportsByStatus,
  resolveReport,
} = require('../controllers/reportController');

const router = express.Router();

// Report CRUD routes 
router.post("/", createReport);
router.get("/", getAllReports);
router.get("/:id", getReportById);
router.get("/status/:status", getReportsByStatus);
router.put("/:id", resolveReport);

module.exports = router;