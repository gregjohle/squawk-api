const { expect } = require("chai");
const knex = require("knex");
const supertest = require("supertest");
const app = require("../src/app");
const bcrypt = require("bcryptjs");

const { makeUsers } = require("./app.fixtures");

describe("Users Endpoints", () => {
  let db;
  before("make knex instance to simulate server", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("prep tables before each test", () => {
    db.raw("TRUNCATE users, passwords RESTART IDENTITY CASCADE");
  });

  afterEach("prep tables after each test", async () => {
    await db.raw("TRUNCATE users, passwords RESTART IDENTITY CASCADE");
  });

  describe("POST api/users/register", () => {
    context("user not in table", () => {
      const testUser = makeUsers();
      it("responds with 201 and user added", () => {
        return supertest(app)
          .post("/api/users/register")
          .send(testUser[0])
          .expect(201, "user added");
      });
    });

    context("User exists already", () => {
      const testUser = makeUsers();
      const insertUser = {
        name: testUser[0].name,
        email: testUser[0].email,
        password: bcrypt.hashSync("test", 10),
      };

      before("insert user", async () => {
        await db.into("users").insert(insertUser);
      });

      it("responds 200 and user exists", () => {
        return supertest(app)
          .post("/api/users/register")
          .send(testUser[0])
          .expect(200, "A User already exists with that email.");
      });
    });
  });

  describe("POST /api/users/login", () => {
    context("user does not exist", () => {
      const testUser = makeUsers();

      it("responds 404 user not found", () => {
        return supertest(app)
          .post("/api/users/login")
          .send(testUser[0])
          .expect(404, "No User found.");
      });
    });

    context("user exists", () => {
      const testUser = makeUsers();
      const insertUser = {
        name: testUser[0].name,
        email: testUser[0].email,
        password: bcrypt.hashSync("test", 10),
      };

      beforeEach("insert user", async () => {
        await db.into("users").insert(insertUser);
      });

      it("responds with wrong password", () => {
        let userInfo = {
          email: testUser[0].email,
          password: "Wrong",
        };

        return supertest(app)
          .post("/api/users/login")
          .send(userInfo)
          .expect(401, "Invalid Password");
      });

      it("responds with user Data", () => {
        const existingUser = {
          password: testUser[0].password,
          email: testUser[0].email,
        };

        return supertest(app)
          .post("/api/users/login")
          .send(testUser[0])
          .expect(200);
      });
    });
  });
});
