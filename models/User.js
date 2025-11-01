const sql = require("../db");
const bcrypt = require("bcrypt");

/**
 * Get all users
 */
async function getAllUsers() {
  return await sql`SELECT * FROM "User"`;
}

/**
 * Create a new user
 */
async function createUser(userData) {
  const {
    username,
    email,
    password,
    fullName,
    phone,
    avatarUrl,
    address,
    role,
  } = userData;

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert user
  const newUser = await sql`
    INSERT INTO "User" (
      username, 
      email, 
      password, 
      full_name, 
      phone, 
      avatar_url, 
      address, 
      role
    ) 
    VALUES (
      ${username}, 
      ${email}, 
      ${hashedPassword}, 
      ${fullName || null}, 
      ${phone || null}, 
      ${avatarUrl || null}, 
      ${address || null}, 
      ${role || 'customer'}
    ) 
    RETURNING *
  `;

  return newUser[0];
}

/**
 * Get user by email
 */
async function getUserByEmail(email) {
  const users = await sql`
    SELECT * FROM "User" 
    WHERE email = ${email}
  `;
  return users[0];
}

/**
 * Get user by username
 */
async function getUserByUsername(username) {
  const users = await sql`
    SELECT * FROM "User" 
    WHERE username = ${username}
  `;
  return users[0];
}

/**
 * Get user by email or username
 */
async function getUserByEmailOrUsername(emailOrUsername) {
  const users = await sql`
    SELECT * FROM "User" 
    WHERE email = ${emailOrUsername} OR username = ${emailOrUsername}
  `;
  return users[0];
}

/**
 * Get user by ID
 */
async function getUserById(userId) {
  const users = await sql`
    SELECT * FROM "User" 
    WHERE user_id = ${userId}
  `;
  return users[0];
}

/**
 * Update user information
 */
async function updateUser(userId, userData) {
  const {
    email,
    fullName,
    phone,
    avatarUrl,
    address,
    role,
    status,
    emailVerified,
  } = userData;

  const updatedUser = await sql`
    UPDATE "User"
    SET 
      email = COALESCE(${email}, email),
      full_name = COALESCE(${fullName}, full_name),
      phone = COALESCE(${phone}, phone),
      avatar_url = COALESCE(${avatarUrl}, avatar_url),
      address = COALESCE(${address}, address),
      role = COALESCE(${role}, role),
      status = COALESCE(${status}, status),
      email_verified = COALESCE(${emailVerified}, email_verified)
    WHERE user_id = ${userId}
    RETURNING *
  `;

  return updatedUser[0];
}

/**
 * Update user password
 */
async function updateUserPassword(userId, newPassword) {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  const updatedUser = await sql`
    UPDATE "User"
    SET password = ${hashedPassword}
    WHERE user_id = ${userId}
    RETURNING *
  `;

  return updatedUser[0];
}

/**
 * Update last login timestamp
 */
async function updateLastLogin(userId) {
  const updatedUser = await sql`
    UPDATE "User"
    SET last_login_at = CURRENT_TIMESTAMP
    WHERE user_id = ${userId}
    RETURNING *
  `;

  return updatedUser[0];
}

/**
 * Delete user
 */
async function deleteUser(userId) {
  const result = await sql`
    DELETE FROM "User" 
    WHERE user_id = ${userId} 
    RETURNING *
  `;
  return result[0];
}

/**
 * Search users with filters
 */
async function searchUsers(filters) {
  const { role, status, search, limit = 10, offset = 0 } = filters;
  
  let query = sql`SELECT * FROM "User" WHERE 1=1`;
  
  if (role) {
    query = sql`${query} AND role = ${role}`;
  }
  
  if (status) {
    query = sql`${query} AND status = ${status}`;
  }
  
  if (search) {
    query = sql`${query} AND (
      username ILIKE ${'%' + search + '%'} OR 
      email ILIKE ${'%' + search + '%'} OR 
      full_name ILIKE ${'%' + search + '%'}
    )`;
  }
  
  query = sql`${query} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
  
  return await query;
}

/**
 * Count users with filters
 */
async function countUsers(filters) {
  const { role, status, search } = filters;
  
  let query = sql`SELECT COUNT(*) as count FROM "User" WHERE 1=1`;
  
  if (role) {
    query = sql`${query} AND role = ${role}`;
  }
  
  if (status) {
    query = sql`${query} AND status = ${status}`;
  }
  
  if (search) {
    query = sql`${query} AND (
      username ILIKE ${'%' + search + '%'} OR 
      email ILIKE ${'%' + search + '%'} OR 
      full_name ILIKE ${'%' + search + '%'}
    )`;
  }
  
  const result = await query;
  return parseInt(result[0].count);
}

/**
 * Compare password
 */
async function comparePassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Get user by phone number
 */
async function getUserByPhoneNumber(phoneNumber) {
  try {
    const normalizedPhoneNumber = phoneNumber.replace(/[-\s()]/g, '');
    
    const users = await sql`
      SELECT * FROM "User"
      WHERE REPLACE(phone, '-', '') = ${normalizedPhoneNumber}
    `;
    
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error("Error in getUserByPhoneNumber:", error);
    throw error;
  }
}

module.exports = {
  getAllUsers,
  createUser,
  getUserByEmail,
  getUserByUsername,
  getUserByEmailOrUsername,
  getUserById,
  updateUser,
  updateUserPassword,
  updateLastLogin,
  deleteUser,
  searchUsers,
  countUsers,
  comparePassword,
  getUserByPhoneNumber,
};

