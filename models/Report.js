const sql = require("../db");

/**
 * Create a new report
 */
async function createReport(reportData) {
  const {
    reporting_user_id,
    reported_user_id,
    reporting_user_username,
    reported_user_username,
    reason,
    reason_extended,
    image,
  } = reportData;

  const result = await sql`
    INSERT INTO "Report" (
      reporting_user_id, 
      reported_user_id, 
      reporting_user_username, 
      reported_user_username, 
      reason, 
      reason_extended, 
      image,
      report_date,
      status
    )
    VALUES (
      ${reporting_user_id},
      ${reported_user_id},
      ${reporting_user_username},
      ${reported_user_username},
      ${reason},
      ${reason_extended},
      ${image || null},
      CURRENT_TIMESTAMP,
      'pending'
    )
    RETURNING *
  `;

  return result[0];
}

/** 
 * Get all reports with pagination and optional filters
 */
async function getAllReports(page = 1, limit = 10, filters = {}) {
  const offset = (page - 1) * limit;
  
  let whereConditions = sql`TRUE`;
  
  if (filters.status) {
    whereConditions = sql`${whereConditions} AND status = ${filters.status}`;
  }
  
  if (filters.reporting_user_id) {
    whereConditions = sql`${whereConditions} AND reporting_user_id = ${filters.reporting_user_id}`;
  }
  
  if (filters.reported_user_id) {
    whereConditions = sql`${whereConditions} AND reported_user_id = ${filters.reported_user_id}`;
  }

  const reports = await sql`
    SELECT * FROM "Report"
    WHERE ${whereConditions}
    ORDER BY report_date DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;

  const countResult = await sql`
    SELECT COUNT(*) FROM "Report"
    WHERE ${whereConditions}
  `;
  
  const total = parseInt(countResult[0].count);

  return {
    reports,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

/**
 * Get report by ID
 */
async function getReportById(reportId) {
  const result = await sql`
    SELECT * FROM "Report" 
    WHERE report_id = ${reportId}
  `;
  
  return result[0];
}

/**
 * Get reports by status with pagination
 */
async function getReportsByStatus(status, page = 1, limit = 10) {
  const offset = (page - 1) * limit;
  
  const reports = await sql`
    SELECT * FROM "Report" 
    WHERE status = ${status}
    ORDER BY report_date DESC 
    LIMIT ${limit}
    OFFSET ${offset}
  `;
  
  const countResult = await sql`
    SELECT COUNT(*) FROM "Report" 
    WHERE status = ${status}
  `;
  
  const total = parseInt(countResult[0].count);

  return {
    reports,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

/**
 * Update report details
 */
async function resolveReport(reportId, updatedData) {
  const {
    status,
    action,
    unsuspend_date,
    action_reason,
    mod_note,
  } = updatedData;

  const result = await sql`
    UPDATE "Report"
    SET 
      status = COALESCE(${status}, status),
      action = COALESCE(${action}, action),
      unsuspend_date = COALESCE(${unsuspend_date}, unsuspend_date),
      action_reason = COALESCE(${action_reason}, action_reason),
      mod_note = COALESCE(${mod_note}, mod_note),
      resolve_date = CURRENT_TIMESTAMP
    WHERE report_id = ${reportId}
    RETURNING *
  `;
  
  return result[0];
}
/** 
 * Delete report
 */
async function deleteReport(reportId) {
  const result = await sql`
    DELETE FROM "Report" 
    WHERE report_id = ${reportId}
    RETURNING *
  `;
  
  return result[0];
}

module.exports = {
  createReport,
  getAllReports,
  getReportById,
  getReportsByStatus,
  resolveReport,
  deleteReport
};