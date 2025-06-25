import User from "../models/user.schema.js";
import BookModel from "../models/book.schema.js";

export const getAdminStats = async (req, res) => {
  try {
    const users = await User.find({}, 'orders'); // fetch only orders from users
    const booksCount = await BookModel.countDocuments();
    const usersCount = users.length;

    // Count total orders across all users
    let ordersCount = 0;
    users.forEach(user => {
      if (Array.isArray(user.orders)) {
        ordersCount += user.orders.length;
      }
    });

    res.status(200).json({
      users: usersCount,
      books: booksCount,
      orders: ordersCount,
    });
  } catch (error) {
    console.error("Error in getAdminStats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const userdelete = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(401).json({ msg: "Unauthorized: User ID not found in request" });
    }

   const user = await User.findByIdAndDelete(id);

    res.status(200).json({ msg: "User deleted successfully", user });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};