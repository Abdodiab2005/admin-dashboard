const fs = require("fs")
const path = require("path")

// Ensure logs directory exists
const logsDir = path.join(__dirname, "../logs")
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

// Log file paths
const changeLogPath = path.join(logsDir, "changes.log")
const errorLogPath = path.join(logsDir, "errors.log")
const accessLogPath = path.join(logsDir, "access.log")

/**
 * Log a change to the system
 * @param {String} action - The action performed (create, update, delete)
 * @param {String} resource - The resource affected (product, category, etc.)
 * @param {String} userId - ID of the user who made the change
 * @param {Object} details - Additional details about the change
 */
const logChange = (action, resource, userId, details = {}) => {
  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    action,
    resource,
    userId,
    details,
  }

  fs.appendFileSync(changeLogPath, JSON.stringify(logEntry) + "\n", { encoding: "utf8" })
}

/**
 * Log an error
 * @param {String} message - Error message
 * @param {Error} error - Error object
 * @param {Object} context - Additional context
 */
const logError = (message, error, context = {}) => {
  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    message,
    error: error?.message || String(error),
    stack: error?.stack,
    context,
  }

  fs.appendFileSync(errorLogPath, JSON.stringify(logEntry) + "\n", { encoding: "utf8" })
}

/**
 * Log an access attempt
 * @param {String} userId - User ID
 * @param {String} action - Action attempted
 * @param {String} resource - Resource accessed
 * @param {Boolean} success - Whether access was successful
 * @param {Object} details - Additional details
 */
const logAccess = (userId, action, resource, success, details = {}) => {
  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    userId,
    action,
    resource,
    success,
    details,
  }

  fs.appendFileSync(accessLogPath, JSON.stringify(logEntry) + "\n", { encoding: "utf8" })
}

/**
 * Get recent changes from the log
 * @param {Number} limit - Maximum number of entries to return
 * @returns {Array} - Array of log entries
 */
const getRecentChanges = (limit = 100) => {
  try {
    if (!fs.existsSync(changeLogPath)) return []

    const content = fs.readFileSync(changeLogPath, "utf8")
    const lines = content.trim().split("\n")

    return lines
      .slice(-limit)
      .map((line) => JSON.parse(line))
      .reverse()
  } catch (error) {
    console.error("Error reading change log:", error)
    return []
  }
}

module.exports = {
  logChange,
  logError,
  logAccess,
  getRecentChanges,
}

