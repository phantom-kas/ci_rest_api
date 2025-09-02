import request from "supertest";
import app from "../server.js"; // make sure this exports the express app (not app.listen)
import db from "../db.js";

export let accessToken;
export let refreshCookie;


afterAll(async () => {
    await db.end(); // closes pool/connections
});
beforeAll(async () => {
    try {

        await db.query("SET FOREIGN_KEY_CHECKS = 0"); // disable FK checks if needed
        await db.query("TRUNCATE TABLE users");
        await db.query("TRUNCATE TABLE track");
        await db.query("SET FOREIGN_KEY_CHECKS = 1");
    }
    catch (err) {
        console.error("DB cleanup failed", err);
    }
    // 1. Signup admin (optional — skip if your DB is seeded)
    if (accessToken) { return }
    try {


        const signUpRes = await request(app)
            .post("/api/user/admin")
            .send({
                firstName: "Admin",
                lastName: "Test",
                email: "admin@test.com",
                password: "AdminPass123",

            });
        console.log('-------------test--signup-----------------------===')
        console.log('-------------test--signup-----------------------===')
        // console.log(signUpRes.body)
    } catch (error) {
        console.log('User already exits')
    }
    // 2. Login admin to get token + cookies
    const loginRes = await request(app)
        .post("/api/login")
        .send({
            email: "admin@test.com",
            password: "AdminPass123",
        });
    accessToken = loginRes.body.data.accessToken;
    // console.log(loginRes.headers)
    refreshCookie = loginRes.body.data.accessToken;

});


describe("Auth tests", () => {
    it("should login admin successfully", async () => {
        const res = await request(app)
            .post("/api/login")
            .send({
                email: "admin@test.com",
                password: "AdminPass123",
            });

        // console.log(res)
        // console.log(res.body)
        console.log('statusCode---------------------', res.statusCode)
        expect(res.statusCode).toBeGreaterThanOrEqual(200);
        expect(res.statusCode).toBeLessThan(300);
        expect(res.body.data.accessToken).toBeDefined();
    });
});
