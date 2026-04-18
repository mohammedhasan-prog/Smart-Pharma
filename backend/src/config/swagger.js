const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Smart Pharmacy API",
      version: "1.0.0",
      description: "API documentation for Smart Pharmacy Inventory Management backend",
    },
    servers: [
      {
        url: "/",
        description: "Same-origin server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        RegisterRequest: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: {
              type: "string",
              example: "Priyanshu",
            },
            email: {
              type: "string",
              format: "email",
              example: "priyanshu@example.com",
            },
            password: {
              type: "string",
              format: "password",
              example: "StrongPass123",
            },
            role: {
              type: "string",
              enum: ["seller"],
              example: "seller",
            },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "priyanshu@example.com",
            },
            password: {
              type: "string",
              format: "password",
              example: "StrongPass123",
            },
          },
        },
        MedicineRequest: {
          type: "object",
          required: [
            "name",
            "salt",
            "stock",
            "reorderLevel",
            "expiryDate",
          ],
          properties: {
            name: {
              type: "string",
              example: "Dolo 650",
            },
            salt: {
              type: "string",
              example: "Paracetamol",
            },
            stock: {
              type: "number",
              example: 120,
            },
            reorderLevel: {
              type: "number",
              example: 20,
            },
            expiryDate: {
              type: "string",
              format: "date-time",
              example: "2026-12-31T00:00:00.000Z",
            },
            supplierEmail: {
              type: "string",
              format: "email",
              example: "wholesaler@smartpharmacy.local",
              description: "Auto-filled from wholesaler account; optional in request",
            },
          },
        },
        Medicine: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "68011223344556677889900a",
            },
            name: {
              type: "string",
              example: "Dolo 650",
            },
            salt: {
              type: "string",
              example: "Paracetamol",
            },
            stock: {
              type: "number",
              example: 40,
            },
            reorderLevel: {
              type: "number",
              example: 20,
            },
            approvalStatus: {
              type: "string",
              enum: ["pending_approval", "active"],
              example: "active",
            },
          },
        },
        MedicineUpdateRequest: {
          type: "object",
          properties: {
            name: {
              type: "string",
              example: "Dolo 650",
            },
            salt: {
              type: "string",
              example: "Paracetamol",
            },
            reorderLevel: {
              type: "number",
              example: 20,
            },
          },
        },
        SellRequest: {
          type: "object",
          required: ["medicineId", "quantity"],
          properties: {
            medicineId: {
              type: "string",
              example: "68011223344556677889900a",
            },
            quantity: {
              type: "number",
              example: 5,
            },
          },
        },
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "68011223344556677889900a",
            },
            name: {
              type: "string",
              example: "Priyanshu",
            },
            email: {
              type: "string",
              format: "email",
              example: "priyanshu@example.com",
            },
            role: {
              type: "string",
              enum: ["seller", "wholesaler"],
              example: "seller",
            },
          },
        },
        AuthSuccessResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Login successful",
            },
            token: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sample.token",
            },
            user: {
              $ref: "#/components/schemas/User",
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Invalid credentials",
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;