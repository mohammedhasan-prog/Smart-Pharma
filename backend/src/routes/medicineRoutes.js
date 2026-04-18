const express = require("express");
const {
  createMedicine,
  getMedicines,
  updateMedicine,
  deleteMedicine,
} = require("../controllers/medicineController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @openapi
 * /api/medicines:
 *   get:
 *     tags:
 *       - Seller Dashboard
 *     summary: Get all medicines for the logged-in seller
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Medicines fetched successfully
 *   post:
 *     tags:
 *       - Seller Dashboard
 *     summary: Add medicine request (wholesaler approval required before selling)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MedicineRequest'
 *     responses:
 *       201:
 *         description: Medicine request created and sent to wholesaler
 */
router
  .route("/")
  .get(protect, authorizeRoles("seller"), getMedicines)
  .post(protect, authorizeRoles("seller"), createMedicine);

/**
 * @openapi
 * /api/medicines/{id}:
 *   put:
 *     tags:
 *       - Seller Dashboard
 *     summary: Update medicine (only name, salt, reorderLevel)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MedicineUpdateRequest'
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Medicine updated successfully
 *   delete:
 *     tags:
 *       - Seller Dashboard
 *     summary: Delete medicine
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
 *         description: Medicine deleted successfully
 */
router
  .route("/:id")
  .put(protect, authorizeRoles("seller"), updateMedicine)
  .delete(protect, authorizeRoles("seller"), deleteMedicine);

module.exports = router;
