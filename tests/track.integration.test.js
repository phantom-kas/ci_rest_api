import request from "supertest";
import app from "../server.js"; // your Express app, not the server
import { accessToken } from "./auth.integration.test.js";
import fs from "fs";

describe("Track routes", () => {

    if (!fs.existsSync("tests/test-image.png")) {
        console.log('-------------create test 400----------------------')
        throw new Error("Test file missing");

    }


    it("should create a track", async () => {
        console.log('-------------create track- start-------------=++++-------')
        let res
        console.log('accessToken = ', accessToken)


        try {

            res = await request(app)
                .post("/api/track")
                .set("Authorization", `Bearer ${accessToken}`)
                .attach("file", "tests/test-image.png")
                .field("title", "New Track")
                .field("duration", "5 weeks")
                .field("instructor", "Jane Doe")
                .field("description", "Jane Doe")
                .field("price", 200);
            console.log('-------------create track--------------=++++-------')
            // console.log(res.error)
            console.log(res.statusCode)
            console.log(res.body)
            console.log('-------------create track----------------------')
        } catch (error) {
            console.log(error)
        }

        expect(res.statusCode).toBeGreaterThanOrEqual(200);
        expect(res.data.status).toBe('success');
        expect(res.body.data.id).toBeDefined();
        expect(res.statusCode).toBeLessThan(300);
    });
});



