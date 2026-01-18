export const Permission = (permission) => {
  return (req, res, next) => {
    if (req.user.role === "admin") return next();
    if (!req.user.permissions.includes(permission)) {
      return res
        .status(403)
        .json({ message: "Permission Denied" });
    }
    next();
  };
};
