import { csrfProtection, csrfValidate } from "./csrfMiddleware.js";
import config from '../../config.js';

describe('csrfValidate middleware', () => {

    let req, res, next;

    beforeEach(() => {
        req = { body: {}, cookies: [] }
        res = { status: jest.fn().mockReturnThis(), send: jest.fn() }
        next = jest.fn();
    });

    it('should call next() if csrf token is valid', () => {
        req.body._csrf = "valid-token";
        req.cookies[config.csrf.cookieName] = "valid-token";

        csrfValidate(req, res, next);

        expect(next).toHaveBeenCalled();
    })

    it('should not call next() if csrf token is not set in body', () => {
        req.cookies[config.csrf.cookieName] = "valid-token";

        csrfValidate(req, res, next);

        // Should not call next as an error has happened
        expect(next).toHaveBeenCalledTimes(0);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.send).toHaveBeenCalledWith("Invalid CSRF token");
    })

    it('should not call next() if csrf token is invalid', () => {
        req.body._csrf = "wrong-token";
        req.cookies[config.csrf.cookieName] = "valid-token";

        csrfValidate(req, res, next);

        // Should not call next as an error has happened
        expect(next).toHaveBeenCalledTimes(0);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.send).toHaveBeenCalledWith("Invalid CSRF token");
    })

})

describe('csrfProtection middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = { cookies: [] }
        res = { locals: {}, cookie: jest.fn(), setHeader: jest.fn() }
        next = jest.fn();
    });

    it('should call next() after setting up csrf with csrf in cookies', () => {
        req.cookies[config.csrf.cookieName] = "cookies";

        csrfProtection(req, res, next);
    
        expect(next).toHaveBeenCalled();

        // Check its setup things properly
        expect(res.locals.cspNonce).toBeDefined();
        expect(res.locals.csrfToken).toEqual("cookies");
        expect(res.cookie).toHaveBeenCalled();
        expect(res.setHeader).toHaveBeenCalled();
    })

    it('should call next() after setting up csrf with no csrf in cookies', () => {

        csrfProtection(req, res, next);
    
        expect(next).toHaveBeenCalled();

        // Check its setup things properly
        expect(res.locals.cspNonce).toBeDefined();
        // In this case it needs to generate a token
        expect(res.locals.csrfToken).toBeDefined();
        expect(res.cookie).toHaveBeenCalled();
        expect(res.setHeader).toHaveBeenCalled();
    })
})