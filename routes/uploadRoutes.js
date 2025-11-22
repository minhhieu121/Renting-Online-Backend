const express = require('express');
const {
  uploadSingleImage,
  uploadMultipleImages,
} = require('../controllers/uploadController');

const router = express.Router();

// Upload routes
router.post('/image', uploadSingleImage);
router.post('/images', uploadMultipleImages);

module.exports = router;
