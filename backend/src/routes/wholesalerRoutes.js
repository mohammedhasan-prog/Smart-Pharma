const express = require("express");
const {
  getAllUsers,
  getAllSellers,
  getSoldMedicinesBySeller,
} = require("../controllers/wholesalerController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @openapi
 * /api/wholesaler/users:
 *   get:
 *     tags:
 *       - Wholesaler Dashboard
 *     summary: Get all users (seller + wholesaler)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users fetched successfully
 */
router.get("/users", protect, authorizeRoles("wholesaler"), getAllUsers);

/**
 * @openapi
 * /api/wholesaler/sellers:
 *   get:
 *     tags:
 *       - Wholesaler Dashboard
 *     summary: Get all sellers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sellers fetched successfully
 */
router.get("/sellers", protect, authorizeRoles("wholesaler"), getAllSellers);

/**
 * @openapi
 * /api/wholesaler/sold-medicines:
 *   get:
 *     tags:
 *       - Wholesaler Dashboard
 *     summary: Get all medicines sold by wholesaler grouped by seller with details
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sold medicines fetched successfully
 */
router.get(
  "/sold-medicines",
  protect,
  authorizeRoles("wholesaler"),
  getSoldMedicinesBySeller
);

module.exports = router;
