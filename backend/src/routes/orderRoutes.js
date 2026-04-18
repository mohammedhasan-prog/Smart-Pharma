const express = require("express");
const {
	getMyOrders,
	getIncomingOrders,
	acceptOrder,
	deliverOrder,
} = require("../controllers/orderController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @openapi
 * /api/orders/my-orders:
 *   get:
 *     tags:
 *       - Seller Dashboard
 *     summary: Get seller orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders fetched successfully
 */
router.get("/my-orders", protect, authorizeRoles("seller"), getMyOrders);

/**
 * @openapi
 * /api/orders:
 *   get:
 *     tags:
 *       - Wholesaler Dashboard
 *     summary: Get incoming orders for wholesaler
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Incoming orders fetched successfully
 */
router.get("/", protect, authorizeRoles("wholesaler"), getIncomingOrders);

/**
 * @openapi
 * /api/orders/{id}/approve:
 *   put:
 *     tags:
 *       - Wholesaler Dashboard
 *     summary: Approve order and immediately update stock for that medicine
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order approved successfully
 */
router.put("/:id/approve", protect, authorizeRoles("wholesaler"), acceptOrder);

/**
 * @openapi
 * /api/orders/{id}/deliver:
 *   put:
 *     tags:
 *       - Wholesaler Dashboard
 *     summary: Mark accepted order as delivered
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order delivered successfully
 */
router.put("/:id/deliver", protect, authorizeRoles("wholesaler"), deliverOrder);

module.exports = router;
