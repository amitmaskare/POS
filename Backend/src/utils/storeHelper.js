// Helper to extract store_id from authenticated request
export const getStoreIdFromRequest = (req) => {
  return req.user?.store_id || req.body?.store_id || null;
};

// Middleware to validate store_id is present
export const validateStoreId = (req, res, next) => {
  const storeId = req.user?.store_id;
  if (!storeId) {
    return res.status(400).json({
      success: false,
      message: "Store ID not found in user credentials"
    });
  }
  req.storeId = storeId;
  next();
};
