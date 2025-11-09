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
    status,
    verificationToken,
    tokenExpires,
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
      role,
      status,
      verification_token,
      token_expires
    ) 
    VALUES (
      ${username}, 
      ${email}, 
      ${hashedPassword}, 
      ${fullName || null}, 
      ${phone || null}, 
      ${avatarUrl || null}, 
      ${address || null}, 
      ${role || 'customer'},
      ${status || 'pending'},
      ${verificationToken || null},
      ${tokenExpires || null}
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
  // Filter out undefined values
  const updates = {};
  if (userData.email !== undefined) updates.email = userData.email;
  if (userData.fullName !== undefined) updates.full_name = userData.fullName;
  if (userData.phone !== undefined) updates.phone = userData.phone;
  if (userData.avatarUrl !== undefined) updates.avatar_url = userData.avatarUrl;
  if (userData.address !== undefined) updates.address = userData.address;
  if (userData.role !== undefined) updates.role = userData.role;
  if (userData.status !== undefined) updates.status = userData.status;
  if (userData.emailVerified !== undefined) updates.email_verified = userData.emailVerified;

  // If no fields to update, return current user
  if (Object.keys(updates).length === 0) {
    return await getUserById(userId);
  }

  // Build dynamic SET clause
  const setClause = Object.keys(updates)
    .map((key, index) => `${key} = $${index + 2}`)
    .join(', ');

  const values = [userId, ...Object.values(updates)];

  const result = await sql.unsafe(`
    UPDATE "User"
    SET ${setClause}
    WHERE user_id = $1
    RETURNING *
  `, values);

  return result[0];
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

/**
 * Get user by verification token
 */
async function getUserByVerificationToken(token) {
  const users = await sql`
    SELECT * FROM "User" 
    WHERE verification_token = ${token} 
    AND token_expires > NOW()
    AND status = 'pending'
  `;
  return users[0];
}

/**
 * Verify user email
 */
async function verifyUserEmail(token) {
  const result = await sql`
    UPDATE "User" 
    SET status = 'active', 
        verification_token = NULL, 
        token_expires = NULL,
        updated_at = NOW()
    WHERE verification_token = ${token} 
    AND token_expires > NOW()
    AND status = 'pending'
    RETURNING *
  `;
  return result[0];
}

/**
 * Update user verification token
 */
async function updateVerificationToken(userId, token, expires) {
  const result = await sql`
    UPDATE "User" 
    SET verification_token = ${token}, 
        token_expires = ${expires},
        updated_at = NOW()
    WHERE user_id = ${userId}
    RETURNING *
  `;
  return result[0];
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
  getUserByVerificationToken,
  verifyUserEmail,
  updateVerificationToken,
  /**
   * Set reset token and expiry for a user
   */
  setResetToken: async function(userId, token, expires) {
    const result = await sql`
      UPDATE "User"
      SET reset_token = ${token},
          reset_expires = ${expires},
          updated_at = NOW()
      WHERE user_id = ${userId}
      RETURNING *
    `;
    return result[0];
  },

  /**
   * Get user by reset token (only if not expired)
   */
  getUserByResetToken: async function(token) {
    const users = await sql`
      SELECT * FROM "User"
      WHERE reset_token = ${token}
      AND reset_expires::timestamp > NOW()
    `;
    return users[0];
  },

  /**
   * Clear reset token fields after successful reset
   */
  clearResetToken: async function(userId) {
    const result = await sql`
      UPDATE "User"
      SET reset_token = NULL,
          reset_expires = NULL,
          updated_at = NOW()
      WHERE user_id = ${userId}
      RETURNING *
    `;
    return result[0];
  },
};

