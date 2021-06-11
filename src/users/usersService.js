const environment = process.env.NODE_ENV || "development";
const bcrypt = require("bcryptjs");

const UsersService = {
  // add a new user
  insertUser(knex, newUser) {
    return knex
      .insert(newUser)
      .into("users")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },

  // find a specific user by email address
  getByEmail(knex, email) {
    return knex.from("users").select("*").where({ email }).first();
  },

  //delete a user
  deleteUser(knex, id) {
    return knex.from("users").delete(id);
  },

  // update a user's info
  updateUser(knex, id, newUserFields) {
    return knex("users").where({ id }).update(newUserFields);
  },
};

module.exports = UsersService;
