const { BadRequest } = require("http-errors");
const axios = require("axios");

module.exports = async ({ body }) => {
  const editResponse = {
    visible: {},
    disabled: {},
    updated: {
      contact: {
        obligatoryField: true,
      },
    },
  };
  try {
    const userId = body.user.id;

    const res = await axios.get(
      `https://sandbox.upsales.com/api/v2/master/users/${userId}?token=${body.apiKey}`
    );
    const roleId = res.data.data.role.id;
    const allowedRoles = [
      25, 3, 6, 9, 12, 15, 18, 21, 24, 34, 30, 35, 36, 37, 38, 39, 40, 41, 42,
      43, 44, 45,
    ];

    if (!allowedRoles.includes(roleId)) {
      editResponse.disabled = {
        order: {
          custom: {
            20: true,
            25: true,
            21: true,
            22: true,
            23: true,
          },
        },
      };
    }
  } catch (err) {
    console.log(err);
  }
  return editResponse;
};
