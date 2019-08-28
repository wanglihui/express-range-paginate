import { app } from "./app";
import { paginateMiddleware } from "../index";
import request from 'supertest';
import * as assert from 'assert';
import { paginateRespHelper } from "../index";

describe("index", async ()=> {
    let to = 99;
    let offset = 50;
    let total = 89;
    app.get('/range', paginateMiddleware() as any, (req: any, res: any, next: any) => {
        paginateRespHelper(total-offset, offset, total)(res);
        res.json({
            limit: req.paginate && req.paginate.limit,
            offset: req.paginate && req.paginate.offset,
        })
    }); 

    app.get('/range2', paginateMiddleware({keyword: 'Keyword'}) as any, (req: any, res: any, next: any) => {
        paginateRespHelper(total-offset, offset, total)(res);
        res.json({
            limit: req.paginate && req.paginate.limit,
            offset: req.paginate && req.paginate.offset,
        })
    }); 

    it("paginate middleware should be ok when support Range on header", (done) => {
        process.nextTick( () => {
            request(app)
            .get('/range')
            .set("Range", `items:${offset}-${to}`)
            .expect(200)
            .end( (err, resp) => {
                if (err) {
                 throw err;
                }
                let ret = resp.body;
                if (typeof resp.body == 'string') {
                    ret = JSON.parse(ret);
                }
                assert.equal(ret.limit, to-offset+1);
                assert.equal(ret.offset, offset);
                assert.equal(resp.header['content-range'], `items ${offset}-${total-offset}/${total}`);
                done();
            })
        })
    })

    it("paginate middleware should be ok when support Range on Querystring", (done) => {
        process.nextTick( () => {
            request(app)
            .get('/range')
            .query({limit: to-offset+1, offset})
            .expect(200)
            .end( (err, resp) => {
                if (err) {
                 throw err;
                }
                let ret = resp.body;
                if (typeof resp.body == 'string') {
                    ret = JSON.parse(ret);
                }
                assert.equal(ret.limit, to-offset+1);
                assert.equal(ret.offset, offset);
                assert.equal(resp.header['content-range'], `items ${offset}-${total-offset}/${total}`);
                done();
            })
        })
    })

    it("paginate middleware should be ok when set Range key is on header", (done) => {
        process.nextTick( () => {
            request(app)
            .get('/range2')
            .set("Keyword", `items:${offset}-${to}`)
            .expect(200)
            .end( (err, resp) => {
                if (err) {
                 throw err;
                }
                let ret = resp.body;
                if (typeof resp.body == 'string') {
                    ret = JSON.parse(ret);
                }
                assert.equal(ret.limit, to-offset+1);
                assert.equal(ret.offset, offset);
                assert.equal(resp.header['content-range'], `items ${offset}-${total-offset}/${total}`);
                done();
            })
        })
    })
})