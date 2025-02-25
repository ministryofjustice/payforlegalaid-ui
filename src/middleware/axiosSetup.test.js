import { axiosMiddleware } from "./axiosSetup";

describe('axiosSetup middleware',  () => {

    let req, res, next;

    beforeEach(() => {
        res = {}
        next = jest.fn(); 
    });

    it('should call next() after setting up axios when http', () => {
        req = { get: jest.fn(), protocol: 'http' }

        req.get.mockReturnValue('localhost');

        axiosMiddleware(req, res, next);

        expect(next).toHaveBeenCalled();
    })

    it('should call next() after setting up axios when https', () => {
        req = { get: jest.fn(), protocol: 'https' }

        req.get.mockReturnValue('localhost');

        axiosMiddleware(req, res, next);

        expect(next).toHaveBeenCalled();
    })

})