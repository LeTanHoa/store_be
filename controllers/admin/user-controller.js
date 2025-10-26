const User = require("../../models/User");

const fetchAllUsers = async (req, res) => {
  try {
    const listOfUsers = await User.find({}).select("-password");
    res.status(200).json({
      success: true,
      data: listOfUsers,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

//delete a product
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);

    if (!user)
      return res.status(404).json({
        success: false,
        message: "User not found",
      });

    res.status(200).json({
      success: true,
      message: "User delete successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

module.exports = {
  deleteUser,
  fetchAllUsers,
};
