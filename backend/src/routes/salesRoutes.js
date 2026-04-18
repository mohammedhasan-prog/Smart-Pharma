const express = require("express");
const { sellMedicine } = require("../controllers/salesController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @openapi
 * /api/sell:
 *   post:
 *     tags:
 *       - Seller Dashboard
 *     summary: Sell medicine and trigger auto-reorder if needed
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SellRequest'
 *     responses:
 *       200:
 *         description: Sale completed
 */
router.post("/", protect, authorizeRoles("seller"), sellMedicine);

module.exports = router;
