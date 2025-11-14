const express = require("express");
const { verifySession, verifyRole } = require('../middleware/auth');

const {
  createReport,
  getAllReports,
  getReportById,
  getReportsByStatus,
  resolveReport,
  deleteReport,
} = require('../controllers/reportController');

const router = express.Router();

// Report CRUD routes 
router.post("/", verifySession, verifyRole(['admin', 'seller', 'customer']), createReport);
router.get("/", verifySession, verifyRole(['admin']), getAllReports);
router.get("/:id", verifySession, verifyRole(['admin']), getReportById);
router.get("/status/:status", verifySession, verifyRole(['admin']), getReportsByStatus);
router.put("/:id", verifySession, verifyRole(['admin']), resolveReport);
router.delete("/:id", verifySession, verifyRole(['admin']), deleteReport);

module.exports = router;